"""
Simple test script for PARE with a single image
This script tests PARE's ability to produce SMPL mesh/vertices from a single image
"""
import os
import sys
import cv2
import joblib
import argparse
from loguru import logger

# Fix for Windows - use 'osmesa' instead of 'egl' for PyOpenGL
os.environ['PYOPENGL_PLATFORM'] = 'osmesa'

sys.path.append('.')
from pare.core.tester import PARETester

# Default paths (relative to pare directory)
CFG = 'data/pare/checkpoints/pare_w_3dpw_config.yaml'
CKPT = 'data/pare/checkpoints/pare_w_3dpw_checkpoint.ckpt'


def test_single_image(image_path, output_folder='logs/test_output'):
    """
    Test PARE with a single image
    
    Args:
        image_path: Path to input image
        output_folder: Folder to save output
    """
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Create a temporary image folder (PARE expects folder input)
    import shutil
    temp_image_folder = os.path.join(output_folder, 'input_images')
    os.makedirs(temp_image_folder, exist_ok=True)
    
    # Copy image to temp folder
    image_name = os.path.basename(image_path)
    temp_image_path = os.path.join(temp_image_folder, image_name)
    shutil.copy(image_path, temp_image_path)
    
    logger.info(f'Testing PARE with image: {image_path}')
    logger.info(f'Output folder: {output_folder}')
    
    # Create args object
    class Args:
        def __init__(self):
            self.cfg = CFG
            self.ckpt = CKPT
            self.exp = 'test'
            self.mode = 'folder'
            self.image_folder = temp_image_folder
            self.output_folder = output_folder
            self.tracking_method = 'bbox'
            self.detector = 'yolo'
            self.yolo_img_size = 416
            self.tracker_batch_size = 1
            self.batch_size = 1
            self.display = False
            self.smooth = False
            self.min_cutoff = 0.004
            self.beta = 1.0
            self.no_render = False
            self.no_save = False
            self.wireframe = False
            self.sideview = False
            self.draw_keypoints = False
            self.save_obj = True  # Save as .obj file
            self.smplify = False
    
    args = Args()
    
    # Initialize tester
    logger.info('Initializing PARE tester...')
    tester = PARETester(args)
    
    # Run detection
    logger.info('Running detector...')
    detections = tester.run_detector(temp_image_folder)
    
    # Run PARE on image folder
    logger.info('Running PARE inference...')
    output_img_folder = os.path.join(output_folder, 'pare_results')
    os.makedirs(output_img_folder, exist_ok=True)
    
    tester.run_on_image_folder(
        temp_image_folder, 
        detections, 
        output_folder, 
        output_img_folder,
        run_smplify=args.smplify
    )
    
    # Check for output
    output_pkl = os.path.join(output_folder, 'pare_output.pkl')
    if os.path.exists(output_pkl):
        logger.info(f'✓ Output saved to: {output_pkl}')
        
        # Load and inspect output
        output = joblib.load(output_pkl)
        logger.info(f'Output keys: {list(output.keys())}')
        
        # Get first person's data
        if len(output) > 0:
            first_person_id = list(output.keys())[0]
            person_data = output[first_person_id]
            logger.info(f'\nPerson {first_person_id} data:')
            for key, value in person_data.items():
                if hasattr(value, 'shape'):
                    logger.info(f'  {key}: shape {value.shape}')
                else:
                    logger.info(f'  {key}: {type(value)}')
            
            # Check for vertices (SMPL mesh)
            if 'verts' in person_data:
                verts = person_data['verts']
                logger.info(f'\n✓ SMPL vertices extracted: {verts.shape}')
                logger.info(f'  First vertex: {verts[0, 0]}')
                return True
    
    logger.error('✗ No output found')
    return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Test PARE with single image')
    parser.add_argument('--image', type=str, required=True,
                        help='Path to input image')
    parser.add_argument('--output', type=str, default='logs/test_output',
                        help='Output folder')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.image):
        logger.error(f'Image not found: {args.image}')
        sys.exit(1)
    
    success = test_single_image(args.image, args.output)
    
    if success:
        logger.info('\n✓ Test completed successfully!')
        logger.info(f'Check output in: {args.output}')
    else:
        logger.error('\n✗ Test failed')
        sys.exit(1)









