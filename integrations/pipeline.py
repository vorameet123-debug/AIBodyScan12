"""
Integration Pipeline: Live API → PARE → SMPL-Anthropometry
Connects all components for end-to-end body measurement extraction
"""
import os
import sys
import tempfile
from pathlib import Path

import cv2
import joblib
import numpy as np
import torch
from loguru import logger

# Add paths for imports
PROJECT_ROOT = Path(__file__).parent.parent
PARE_DIR = PROJECT_ROOT / "pare"
SMPL_ANTHROPOMETRY_DIR = PROJECT_ROOT / "smpl_anthropometry"

sys.path.insert(0, str(PARE_DIR))
sys.path.insert(0, str(SMPL_ANTHROPOMETRY_DIR))

# Fix for Windows - set OpenGL platform BEFORE any imports
import sys

if sys.platform == 'win32':
    os.environ['PYOPENGL_PLATFORM'] = 'osmesa'

# Suppress verbose OpenGL errors on Windows
import warnings

warnings.filterwarnings('ignore', category=UserWarning)
import logging

logging.getLogger('OpenGL').setLevel(logging.ERROR)

# Import components
try:
    from pare.core.tester import PARETester
except Exception as e:
    # If import fails, log and raise - we need PARETester
    logger.error(f"Failed to import PARETester: {e}")
    raise ImportError(f"Cannot import PARETester. Make sure PARE is properly set up. Error: {e}")
from measure import MeasureBody

# Import size recommendation engine
try:
    from size_recommendation import SizeRecommendationEngine, calculate_outseam
except ImportError:
    # If import fails, try absolute import
    try:
        import sys
        integrations_path = Path(__file__).parent
        if str(integrations_path) not in sys.path:
            sys.path.insert(0, str(integrations_path))
        from size_recommendation import SizeRecommendationEngine, calculate_outseam
    except ImportError:
        logger.warning("Size recommendation engine not available - continuing without it")
        SizeRecommendationEngine = None
        calculate_outseam = None

# PARE configuration
PARE_CFG = str(PARE_DIR / 'data' / 'pare' / 'checkpoints' / 'pare_w_3dpw_config.yaml')
PARE_CKPT = str(PARE_DIR / 'data' / 'pare' / 'checkpoints' / 'pare_w_3dpw_checkpoint.ckpt')


class MeasurementPipeline:
    """
    Complete pipeline for body measurement extraction:
    1. Accepts images (front, optional side)
    2. Runs PARE for 3D reconstruction
    3. Extracts measurements using SMPL-Anthropometry
    """

    def __init__(self, pare_cfg=None, pare_ckpt=None):
        """
        Initialize the pipeline
        
        Args:
            pare_cfg: Path to PARE config file (default: uses pre-downloaded)
            pare_ckpt: Path to PARE checkpoint (default: uses pre-downloaded)
        """
        self.pare_cfg = pare_cfg or PARE_CFG
        self.pare_ckpt = pare_ckpt or PARE_CKPT

        # Initialize PARE tester (lazy loading)
        self.pare_tester = None
        self.smpl_measurer = None

        # Initialize size recommendation engine
        if SizeRecommendationEngine is not None:
            self.size_engine = SizeRecommendationEngine()
        else:
            self.size_engine = None
            logger.warning("Size recommendation engine not available")

        logger.info("MeasurementPipeline initialized")

    def _init_pare(self):
        """Initialize PARE tester (lazy loading)"""
        if self.pare_tester is None:
            logger.info("Initializing PARE tester...")

            # Save current directory and change to PARE directory
            # PARE expects to be run from its own directory for relative paths
            original_dir = os.getcwd()
            pare_dir = str(PARE_DIR)

            try:
                os.chdir(pare_dir)
                logger.info(f"Changed directory to: {pare_dir}")

                # Create args object for PARE
                class Args:
                    def __init__(self, cfg, ckpt):
                        self.cfg = cfg
                        self.ckpt = ckpt
                        self.exp = 'pipeline'
                        self.mode = 'folder'
                        self.tracking_method = 'bbox'
                        self.detector = 'yolo'
                        self.yolo_img_size = 416
                        self.tracker_batch_size = 1
                        self.batch_size = 1
                        self.display = False
                        self.smooth = False
                        self.min_cutoff = 0.004
                        self.beta = 1.0
                        self.no_render = True
                        self.no_save = False
                        self.wireframe = False
                        self.sideview = False
                        self.draw_keypoints = False
                        self.save_obj = False
                        self.smplify = False

                args = Args(self.pare_cfg, self.pare_ckpt)

                self.pare_tester = PARETester(args)
                logger.info("PARE tester initialized")
            finally:
                # Always restore original directory
                os.chdir(original_dir)
                logger.info(f"Restored directory to: {original_dir}")

    def _init_smpl_measurer(self):
        """Initialize SMPL-Anthropometry measurer (lazy loading)"""
        if self.smpl_measurer is None:
            logger.info("Initializing SMPL-Anthropometry measurer...")
            logger.info(f"  SMPL_ANTHROPOMETRY_DIR: {SMPL_ANTHROPOMETRY_DIR}")
            logger.info(f"  Current working directory: {os.getcwd()}")

            # Change to smpl_anthropometry directory to ensure correct data path resolution
            original_cwd = os.getcwd()
            try:
                logger.info(f"  Changing to: {SMPL_ANTHROPOMETRY_DIR}")
                os.chdir(SMPL_ANTHROPOMETRY_DIR)
                logger.info(f"  Now in: {os.getcwd()}")

                logger.info("  Calling MeasureBody('smpl')...")
                self.smpl_measurer = MeasureBody('smpl')
                logger.info("✓ SMPL-Anthropometry measurer initialized successfully")
                logger.info(f"  Measurer type: {type(self.smpl_measurer)}")
                logger.info(f"  Has measurements attr: {hasattr(self.smpl_measurer, 'measurements')}")
                logger.info(f"  Has all_possible_measurements: {hasattr(self.smpl_measurer, 'all_possible_measurements')}")
            except Exception as e:
                logger.error(f"✗ Failed to initialize measurer: {e}")
                import traceback
                logger.error(f"Traceback:\n{traceback.format_exc()}")
                os.chdir(original_cwd)
                raise
            finally:
                os.chdir(original_cwd)
                logger.info(f"  Returned to: {os.getcwd()}")

    def process_image(
        self,
        front_image: np.ndarray,
        side_image: np.ndarray | None = None,
        user_height_cm: float | None = None,
        measurements_to_get: list | None = None,
        gender: str | None = None,
        age: int | None = None
    ) -> dict:
        """
        Process images through the complete pipeline
        
        Args:
            front_image: Front view image (numpy array, BGR format)
            side_image: Side view image (optional, numpy array, BGR format)
            user_height_cm: User's height in cm (optional, for scaling measurements)
            measurements_to_get: List of measurement names (default: 'all' - tries all 21 measurements)
            gender: Optional gender ('male', 'female') for size recommendations
            age: Optional age (years) for age-based size recommendations
        
        Returns:
            Dictionary with:
            - measurements: All body measurements (21 measurements + outseam)
            - size_recommendations: Size recommendations for different clothing categories
            - metadata: Processing information
        """
        logger.info("Starting measurement pipeline...")

        # Default measurements - try ALL available measurements
        # System will automatically skip ones that fail (e.g., circumferences without face segmentation)
        if measurements_to_get is None:
            measurements_to_get = 'all'  # This will be handled in _extract_measurements

        try:
            # Step 1: Run PARE inference
            logger.info("Running PARE 3D reconstruction...")
            # Note: side_image is accepted for future multi-view enhancement, currently PARE uses front_image only
            if side_image is not None:
                logger.debug("Side image provided (not currently used by PARE, reserved for future multi-view reconstruction)")
            vertices = self._run_pare_inference(front_image)

            if vertices is None:
                return {
                    "success": False,
                    "error": "Failed to extract 3D mesh from image",
                    "stage": "pare_inference"
                }

            # Step 2: Extract measurements
            logger.info("Extracting body measurements...")
            measurements = self._extract_measurements(vertices, measurements_to_get, user_height_cm)

            # Validate that we got at least some measurements
            if not measurements or len(measurements) == 0:
                logger.error("No measurements extracted from 3D mesh - extraction failed")
                return {
                    "success": False,
                    "error": "No measurements could be extracted from the 3D mesh. This might indicate an issue with the measurement extraction process.",
                    "stage": "measurement_extraction",
                    "measurements": {},
                    "metadata": {
                        "user_height_cm": user_height_cm,
                        "measurements_extracted": 0,
                        "vertices_shape": list(vertices.shape) if vertices is not None else None,
                        "note": "3D mesh was extracted successfully, but measurement extraction failed"
                    }
                }

            logger.info(f"Extracted {len(measurements)} measurements")

            # Step 3: Add derived measurements (outseam)
            if calculate_outseam is not None:
                try:
                    outseam = calculate_outseam(measurements)
                    if outseam is not None:
                        measurements['outseam length'] = outseam
                        logger.debug(f"Calculated outseam: {outseam} cm")
                except Exception as e:
                    logger.warning(f"Outseam calculation failed: {e}")

            # Step 4: Get size recommendations
            size_recommendations = None
            if self.size_engine is not None and measurements:
                try:
                    logger.debug("Calculating size recommendations...")
                    size_recommendations = self.size_engine.recommend_all_sizes(
                        measurements,
                        gender=gender,
                        age=age
                    )
                    logger.debug(f"Size recommendations calculated for {len(size_recommendations)} categories")
                except Exception as e:
                    logger.warning(f"Size recommendation failed: {e}")
                    size_recommendations = None

            # Step 5: Format output
            result = {
                "success": True,
                "measurements": measurements,
                "metadata": {
                    "user_height_cm": user_height_cm,
                    "measurements_extracted": len(measurements),
                    "vertices_shape": list(vertices.shape) if vertices is not None else None,
                    "scaled": user_height_cm is not None and 'height' in measurements,
                    "gender": gender
                },
                "model_3d": {
                    "vertices": vertices.tolist() if vertices is not None else None,
                    "type": "smpl"
                }
            }

            # Add scaling info if scaling was applied
            if user_height_cm is not None and 'height' in measurements:
                # Note: measurements['height'] is already scaled at this point
                result["metadata"]["scaling_info"] = {
                    "user_provided_height_cm": user_height_cm,
                    "note": "All measurements scaled to match user's actual height"
                }

            # Add size recommendations if available
            if size_recommendations:
                result["size_recommendations"] = size_recommendations

            logger.info(f"Pipeline completed: {len(measurements)} measurements extracted")
            return result

        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e),
                "stage": "pipeline"
            }

    def _run_pare_inference(self, image: np.ndarray) -> np.ndarray | None:
        """
        Run PARE inference on image to get SMPL vertices
        
        Args:
            image: Input image (numpy array, BGR format)
        
        Returns:
            SMPL vertices (6890, 3) or None if failed
        """
        try:
            # Initialize PARE if needed
            self._init_pare()

            # Create temporary directory for PARE processing
            with tempfile.TemporaryDirectory() as temp_dir:
                # Save image to temp folder (PARE expects folder input)
                input_image_folder = os.path.join(temp_dir, 'input_images')
                os.makedirs(input_image_folder, exist_ok=True)

                image_path = os.path.join(input_image_folder, 'input.jpg')
                cv2.imwrite(image_path, image)

                # Run detector
                logger.debug("Running person detector...")
                try:
                    detections = self.pare_tester.run_detector(input_image_folder)
                except Exception as det_error:
                    logger.error(f"Detector failed: {det_error}")
                    return None

                if not detections or len(detections) == 0:
                    logger.warning("No person detected in image")
                    return None

                logger.debug(f"Detected {len(detections)} person(s) in image")

                # Run PARE inference
                logger.debug("Running PARE inference...")
                output_path = os.path.join(temp_dir, 'output')
                output_img_folder = os.path.join(temp_dir, 'results')
                os.makedirs(output_path, exist_ok=True)
                os.makedirs(output_img_folder, exist_ok=True)
                # PARE creates a 'pare_results' subdirectory, ensure it exists
                os.makedirs(os.path.join(output_path, 'pare_results'), exist_ok=True)

                try:
                    self.pare_tester.run_on_image_folder(
                        input_image_folder,
                        detections,
                        output_path,
                        output_img_folder,
                        run_smplify=False
                    )
                    logger.debug("PARE inference completed")
                except Exception as pare_error:
                    logger.error(f"PARE inference failed: {pare_error}")
                    return None

                # Load PARE output
                pare_output_path = os.path.join(output_path, 'pare_results', 'input.pkl')
                if not os.path.exists(pare_output_path):
                    logger.error(f"PARE output file not found at: {pare_output_path}")
                    return None

                pare_output = joblib.load(pare_output_path)
                logger.debug(f"Loaded PARE output: {type(pare_output)}")

                # Extract vertices - PARE output uses 'smpl_vertices' key
                if isinstance(pare_output, dict) and 'smpl_vertices' in pare_output:
                    verts = pare_output['smpl_vertices']
                elif isinstance(pare_output, dict) and 'verts' in pare_output:
                    verts = pare_output['verts']
                else:
                    logger.error(f"Vertices not found in PARE output. Available keys: {list(pare_output.keys()) if isinstance(pare_output, dict) else 'N/A'}")
                    return None

                # If multiple frames, take first frame
                if len(verts.shape) == 3:  # (n_frames, 6890, 3)
                    verts = verts[0]

                logger.debug(f"Extracted vertices shape: {verts.shape}")
                return verts

        except Exception as e:
            logger.error(f"PARE inference error: {e}")
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Full traceback:\n{error_details}")
            print(f"\n[DEBUG] PARE Error Details:\n{error_details}")
            return None

    def _extract_measurements(
        self,
        vertices: np.ndarray,
        measurements_to_get: list,
        user_height_cm: float | None = None
    ) -> dict[str, float]:
        """
        Extract body measurements from SMPL vertices
        
        Args:
            vertices: SMPL vertices (6890, 3)
            measurements_to_get: List of measurement names
            user_height_cm: User's actual height in cm (for scaling)
        
        Returns:
            Dictionary of measurements in cm (scaled if user_height_cm provided)
        """
        logger.debug("Starting measurement extraction")
        logger.debug(f"Input vertices shape: {vertices.shape}, measurements: {measurements_to_get}, height: {user_height_cm}")

        try:
            # Initialize measurer if needed
            self._init_smpl_measurer()

            # Convert to torch tensor
            if isinstance(vertices, np.ndarray):
                verts_tensor = torch.from_numpy(vertices).float()
            else:
                verts_tensor = vertices.float()

            # Ensure correct shape
            if verts_tensor.shape != torch.Size([6890, 3]):
                raise ValueError(f"Expected vertices shape (6890, 3), got {verts_tensor.shape}")

            logger.debug(f"Converting vertices to tensor: {verts_tensor.shape}")

            # Load vertices into measurer
            try:
                self.smpl_measurer.from_verts(verts=verts_tensor)
                logger.debug("Vertices loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load vertices: {e}")
                import traceback
                logger.error(f"Traceback:\n{traceback.format_exc()}")
                raise

            # Clear any previous measurements to ensure fresh start
            self.smpl_measurer.measurements = {}

            # Check if joints were calculated
            if hasattr(self.smpl_measurer, 'joints') and self.smpl_measurer.joints is not None:
                logger.debug(f"Joints calculated: shape={self.smpl_measurer.joints.shape}")
            else:
                logger.error("CRITICAL: Joints were not calculated by from_verts() - measurements will fail")
                return {}

            # Get available measurements
            if not hasattr(self.smpl_measurer, 'all_possible_measurements'):
                logger.error("CRITICAL: smpl_measurer.all_possible_measurements not found - measurer not initialized correctly")
                return {}

            all_measurements = self.smpl_measurer.all_possible_measurements
            logger.info(f"Available measurements: {len(all_measurements)} total")
            if len(all_measurements) == 0:
                logger.error("✗ CRITICAL: No measurements available in all_possible_measurements!")
                logger.error("This means the measurement definitions are not loaded")
                return {}

            logger.info(f"Sample measurements available: {list(all_measurements)[:10]}")

            # Determine which measurements to extract
            if measurements_to_get == 'all':
                # Try all available measurements
                valid_measurements = list(all_measurements)
                logger.info(f"Will attempt ALL {len(valid_measurements)} available measurements")
            else:
                # Filter to requested measurements
                valid_measurements = [m for m in measurements_to_get if m in all_measurements]

                if not valid_measurements:
                    logger.warning("No valid measurements found, trying common ones")
                    # Try common measurements that usually work
                    common_measurements = ['height', 'shoulder to crotch height', 'arm left length',
                                          'arm right length', 'inside leg height', 'shoulder breadth']
                    valid_measurements = [m for m in common_measurements if m in all_measurements]

                if not valid_measurements:
                    logger.warning("Using all available measurements")
                    valid_measurements = list(all_measurements)

                logger.info(f"Will measure: {valid_measurements}")

            # Perform measurements
            # Strategy: Separate length and circumference measurements
            # Length measurements are more reliable, so try them first
            successful_measurements = {}
            failed_measurements = []

            logger.info("[STEP 4/6] Separating measurements by type...")

            # Separate measurements by type
            length_measurements = []
            circumference_measurements = []

            for m_name in valid_measurements:
                if m_name in self.smpl_measurer.measurement_types:
                    m_type = self.smpl_measurer.measurement_types[m_name]
                    if m_type == "length":
                        length_measurements.append(m_name)
                    elif m_type == "circumference":
                        circumference_measurements.append(m_name)
                    else:
                        # Unknown type, try as length first
                        length_measurements.append(m_name)
                else:
                    # Unknown measurement, try as length first
                    length_measurements.append(m_name)

            logger.info(f"  Length measurements: {len(length_measurements)} - {length_measurements[:3]}...")
            logger.info(f"  Circumference measurements: {len(circumference_measurements)} - {circumference_measurements[:3]}...")

            logger.info(f"Length measurements: {len(length_measurements)}, Circumference: {len(circumference_measurements)}")

            # Try length measurements first (more reliable)
            if length_measurements:
                try:
                    logger.info(f"[STEP 5/6] Measuring {len(length_measurements)} length measurements...")
                    logger.info(f"First 5 measurements to try: {length_measurements[:5]}")

                    # Check measurer state before measuring
                    logger.info(f"Measurer has {len(self.smpl_measurer.measurements)} measurements before batch")

                    self.smpl_measurer.measure(length_measurements)

                    # Check measurer state after measuring
                    logger.info(f"Measurer has {len(self.smpl_measurer.measurements)} measurements after batch")
                    logger.info(f"Measurements in measurer: {list(self.smpl_measurer.measurements.keys())[:10]}")

                    for m_name in length_measurements:
                        if m_name in self.smpl_measurer.measurements:
                            successful_measurements[m_name] = self.smpl_measurer.measurements[m_name]
                            logger.info(f"✓ {m_name}: {successful_measurements[m_name]:.2f} cm")
                        else:
                            failed_measurements.append(m_name)
                            logger.warning(f"✗ {m_name}: Not found in measurer.measurements after batch call")
                except Exception as e:
                    logger.error(f"Length measurements batch failed: {e}")
                    import traceback
                    logger.error(f"Traceback:\n{traceback.format_exc()}")
                    logger.warning("Trying measurements individually...")
                    # Try individually
                    for m_name in length_measurements:
                        if m_name not in successful_measurements:
                            try:
                                logger.debug(f"Trying {m_name} individually...")
                                self.smpl_measurer.measure([m_name])
                                if m_name in self.smpl_measurer.measurements:
                                    successful_measurements[m_name] = self.smpl_measurer.measurements[m_name]
                                    logger.info(f"✓ {m_name}: {successful_measurements[m_name]:.2f} cm")
                                else:
                                    failed_measurements.append(m_name)
                                    logger.warning(f"✗ {m_name}: Not in measurements after individual call")
                            except Exception as e2:
                                failed_measurements.append(m_name)
                                logger.error(f"✗ {m_name}: Exception - {str(e2)[:100]}")

            # Try circumference measurements (may fail if face segmentation missing)
            if circumference_measurements:
                # Try each circumference individually (they're more likely to fail)
                for m_name in circumference_measurements:
                    if m_name in successful_measurements:
                        continue  # Already got it
                    try:
                        self.smpl_measurer.measure([m_name])
                        if m_name in self.smpl_measurer.measurements:
                            successful_measurements[m_name] = self.smpl_measurer.measurements[m_name]
                            logger.debug(f"✓ {m_name}: {successful_measurements[m_name]:.2f} cm")
                        else:
                            failed_measurements.append(m_name)
                            logger.debug(f"✗ {m_name}: Not in measurements dict")
                    except Exception as e:
                        failed_measurements.append(m_name)
                        logger.debug(f"✗ {m_name}: {str(e)[:50]}")

            # Final check: Get ALL measurements from measurer (in case some were added)
            for measurement_name, value in self.smpl_measurer.measurements.items():
                if measurement_name not in successful_measurements:
                    successful_measurements[measurement_name] = value
                    logger.debug(f"✓ {measurement_name}: {value:.2f} cm (found in measurer)")

            logger.info(f"Successfully measured: {len(successful_measurements)}/{len(valid_measurements)}")
            if failed_measurements:
                logger.warning(f"Failed measurements ({len(failed_measurements)}): {failed_measurements[:5]}{'...' if len(failed_measurements) > 5 else ''}")

            # Critical check: If no measurements were successful, log detailed error
            if len(successful_measurements) == 0:
                logger.error("=" * 80)
                logger.error("CRITICAL ERROR: No measurements were successfully extracted!")
                logger.error(f"Attempted {len(valid_measurements)} measurements, all failed")
                logger.error(f"Length measurements attempted: {len(length_measurements)}")
                logger.error(f"Circumference measurements attempted: {len(circumference_measurements)}")
                logger.error(f"Failed measurements: {failed_measurements[:10]}")

                # Try a simple test measurement to see if measurer works at all
                logger.info("Attempting diagnostic test with 'height' measurement...")
                try:
                    test_result = self.smpl_measurer.measure(['height'])
                    logger.info(f"Test measure() call completed, measurer.measurements now has {len(self.smpl_measurer.measurements)} items")
                    if 'height' in self.smpl_measurer.measurements:
                        logger.info(f"✓ Test measurement 'height' succeeded: {self.smpl_measurer.measurements['height']} cm")
                        successful_measurements['height'] = self.smpl_measurer.measurements['height']
                    else:
                        logger.error("✗ Test measurement 'height' failed - not in measurer.measurements")
                except Exception as test_e:
                    logger.error(f"✗ Test measurement failed with exception: {test_e}")
                    import traceback
                    logger.error(f"Test traceback:\n{traceback.format_exc()}")

                # If still no measurements, try FALLBACK: calculate from vertices directly
                if len(successful_measurements) == 0:
                    logger.warning("=" * 80)
                    logger.warning("FALLBACK: Attempting to calculate measurements from vertices directly...")
                    try:
                        fallback_meas = self._calculate_fallback_measurements(vertices)
                        if fallback_meas and len(fallback_meas) > 0:
                            logger.info(f"✓ FALLBACK successful: Got {len(fallback_meas)} measurements")
                            successful_measurements.update(fallback_meas)
                        else:
                            logger.error("✗ FALLBACK failed: No measurements calculated")
                    except Exception as fallback_e:
                        logger.error(f"✗ FALLBACK exception: {fallback_e}")
                    logger.warning("=" * 80)

                if len(successful_measurements) == 0:
                    logger.error("=" * 80)
                    logger.error("DIAGNOSTIC: Even simple 'height' measurement failed")
                    logger.error("This indicates a fundamental problem with the measurer")
                    logger.error("Possible causes:")
                    logger.error("  1. SMPL measurer is not initialized correctly")
                    logger.error("  2. Joints were not calculated from vertices")
                    logger.error("  3. Measurement definitions are missing or incorrect")
                    logger.error("  4. Vertices are in wrong format or scale")
                    logger.error("  5. SMPL model files are missing or corrupted")
                    logger.error("=" * 80)
                    return {}  # Return empty dict to trigger error in pipeline
                else:
                    logger.warning(f"At least one measurement worked (height), but others failed. Got {len(successful_measurements)} measurements total.")

            # Get results (in mesh units, not real-world cm yet)
            measurements = successful_measurements
            logger.info(f"Returning {len(measurements)} measurements from _extract_measurements")

            # Scale measurements if user provided their real height
            if user_height_cm is not None and 'height' in measurements:
                mesh_height = float(measurements['height'])
                scaling_factor = user_height_cm / mesh_height
                logger.info(f"Scaling measurements: user_height={user_height_cm}cm, mesh_height={mesh_height:.2f}cm, factor={scaling_factor:.3f}")

                # Scale all measurements to match real-world height
                scaled_measurements = {}
                for name, value in measurements.items():
                    scaled_value = float(value) * scaling_factor
                    scaled_measurements[name] = round(scaled_value, 2)

                logger.info(f"Measurements scaled to match user height of {user_height_cm} cm")
                return scaled_measurements
            else:
                # No scaling - return raw mesh measurements
                formatted_measurements = {}
                for name, value in measurements.items():
                    formatted_measurements[name] = round(float(value), 2)

                logger.info(f"Extracted {len(formatted_measurements)} measurements (unscaled)")
                return formatted_measurements

        except Exception as e:
            logger.error("="*80)
            logger.error("EXCEPTION IN _extract_measurements()")
            logger.error("="*80)
            logger.error(f"Error: {e}")
            import traceback
            logger.error(f"Full traceback:\n{traceback.format_exc()}")
            logger.error("="*80)
            return {}

    def _calculate_fallback_measurements(self, vertices: np.ndarray) -> dict[str, float]:
        """
        Calculate basic measurements directly from vertices as fallback
        when SMPL measurer fails
        """
        try:
            logger.info("Calculating fallback measurements from vertices...")

            if vertices.shape != (6890, 3):
                logger.warning(f"Unexpected vertices shape: {vertices.shape}")
                return {}

            verts = vertices.copy()
            measurements = {}

            # Height: distance from top of head to heel
            head_top = np.max(verts[:, 1])  # max Y
            heels = np.min(verts[:, 1])    # min Y
            height = (head_top - heels) * 100  # convert to cm
            measurements['height'] = round(height, 2)
            logger.info(f"  ✓ Height: {measurements['height']} cm")

            # Chest circumference: approximate as circle at chest height
            chest_y = heels + (head_top - heels) * 0.45  # 45% up
            chest_verts = verts[np.abs(verts[:, 1] - chest_y) < 0.05]
            if len(chest_verts) > 0:
                chest_width = (np.max(chest_verts[:, 0]) - np.min(chest_verts[:, 0])) * 100
                chest_depth = (np.max(chest_verts[:, 2]) - np.min(chest_verts[:, 2])) * 100
                chest_circ = np.pi * np.sqrt((chest_width**2 + chest_depth**2) / 2)
                measurements['chest circumference'] = round(chest_circ, 2)
                logger.info(f"  ✓ Chest circumference: {measurements['chest circumference']} cm")

            # Waist circumference: approximate at 50% height
            waist_y = heels + (head_top - heels) * 0.50
            waist_verts = verts[np.abs(verts[:, 1] - waist_y) < 0.05]
            if len(waist_verts) > 0:
                waist_width = (np.max(waist_verts[:, 0]) - np.min(waist_verts[:, 0])) * 100
                waist_depth = (np.max(waist_verts[:, 2]) - np.min(waist_verts[:, 2])) * 100
                waist_circ = np.pi * np.sqrt((waist_width**2 + waist_depth**2) / 2)
                measurements['waist circumference'] = round(waist_circ, 2)
                logger.info(f"  ✓ Waist circumference: {measurements['waist circumference']} cm")

            # Hip circumference: approximate at 35% height
            hip_y = heels + (head_top - heels) * 0.35
            hip_verts = verts[np.abs(verts[:, 1] - hip_y) < 0.05]
            if len(hip_verts) > 0:
                hip_width = (np.max(hip_verts[:, 0]) - np.min(hip_verts[:, 0])) * 100
                hip_depth = (np.max(hip_verts[:, 2]) - np.min(hip_verts[:, 2])) * 100
                hip_circ = np.pi * np.sqrt((hip_width**2 + hip_depth**2) / 2)
                measurements['hip circumference'] = round(hip_circ, 2)
                logger.info(f"  ✓ Hip circumference: {measurements['hip circumference']} cm")

            logger.info(f"Fallback measurements complete: {len(measurements)} measurements")
            return measurements

        except Exception as e:
            logger.error(f"Fallback measurement calculation failed: {e}")
            return {}


def process_images_from_files(
    front_image_path: str,
    side_image_path: str | None = None,
    user_height_cm: float | None = None
) -> dict:
    """
    Convenience function to process images from file paths
    
    Args:
        front_image_path: Path to front image
        side_image_path: Path to side image (optional)
        user_height_cm: User height in cm (optional)
    
    Returns:
        Dictionary with measurements
    """
    # Load images
    front_image = cv2.imread(front_image_path)
    if front_image is None:
        return {
            "success": False,
            "error": f"Could not load front image: {front_image_path}"
        }

    side_image = None
    if side_image_path and os.path.exists(side_image_path):
        side_image = cv2.imread(side_image_path)

    # Initialize pipeline
    pipeline = MeasurementPipeline()

    # Process
    return pipeline.process_image(
        front_image=front_image,
        side_image=side_image,
        user_height_cm=user_height_cm
    )


if __name__ == '__main__':
    """
    Test the pipeline with sample images
    """
    import argparse

    parser = argparse.ArgumentParser(description='Test measurement pipeline')
    parser.add_argument('--front_image', type=str, required=True,
                        help='Path to front image')
    parser.add_argument('--side_image', type=str, default=None,
                        help='Path to side image (optional)')
    parser.add_argument('--height_cm', type=float, default=None,
                        help='User height in cm (optional)')

    args = parser.parse_args()

    print("="*60)
    print("Measurement Pipeline Test")
    print("="*60)

    result = process_images_from_files(
        front_image_path=args.front_image,
        side_image_path=args.side_image,
        user_height_cm=args.height_cm
    )

    if result['success']:
        print("\n✓ Pipeline completed successfully!")
        print("\nMeasurements (cm):")
        for name, value in result['measurements'].items():
            print(f"  {name}: {value:.2f} cm")
    else:
        print(f"\n✗ Pipeline failed: {result.get('error', 'Unknown error')}")
        print(f"Stage: {result.get('stage', 'unknown')}")




