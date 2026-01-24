import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, RotateCw } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import gsap from 'gsap';

interface Model3DViewerProps {
  model3D?: {
    vertices?: number[][];
    type: string;
  };
  measurements: any;
  gender?: string;
  selectedMeasurement?: string | null;
}

// Camera zones for cinematic focus on each measurement
const CAMERA_ZONES: Record<string, {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}> = {
  // HEAD & NECK - Close-up, high angle
  'head circumference': { 
    position: { x: 0, y: 1.2, z: 0.8 }, 
    target: { x: 0, y: 0.95, z: 0 } 
  },
  'neck circumference': { 
    position: { x: 0, y: 1.0, z: 0.7 }, 
    target: { x: 0, y: 0.78, z: 0 } 
  },
  
  // TORSO - Medium shots
  'shoulder to crotch height': { 
    position: { x: 0, y: 0.5, z: 1.5 }, 
    target: { x: 0, y: 0.45, z: 0 } 
  },
  'chest circumference': { 
    position: { x: 0, y: 0.75, z: 1.2 }, 
    target: { x: 0, y: 0.60, z: 0 } 
  },
  'waist circumference': { 
    position: { x: 0, y: 0.5, z: 1.2 }, 
    target: { x: 0, y: 0.35, z: 0 } 
  },
  'hip circumference': { 
    position: { x: 0, y: 0.3, z: 1.2 }, 
    target: { x: 0, y: 0.15, z: 0 } 
  },
  'shoulder breadth': { 
    position: { x: 0, y: 0.85, z: 1.0 }, 
    target: { x: 0, y: 0.70, z: 0 } 
  },
  
  // RIGHT ARM - Side angle
  'bicep right circumference': { 
    position: { x: 0.8, y: 0.65, z: 0.8 }, 
    target: { x: 0.4, y: 0.52, z: 0 } 
  },
  'forearm right circumference': { 
    position: { x: 0.8, y: 0.42, z: 0.8 }, 
    target: { x: 0.4, y: 0.32, z: 0 } 
  },
  'wrist right circumference': { 
    position: { x: 0.8, y: 0.18, z: 0.8 }, 
    target: { x: 0.5, y: 0.08, z: 0 } 
  },
  'arm right length': { 
    position: { x: 0.9, y: 0.5, z: 1.0 }, 
    target: { x: 0.35, y: 0.40, z: 0 } 
  },
  
  // LEFT ARM - Side angle (mirrored)
  'arm left length': { 
    position: { x: -0.9, y: 0.5, z: 1.0 }, 
    target: { x: -0.35, y: 0.40, z: 0 } 
  },
  
  // LEGS - Lower body focus
  'inside leg height': { 
    position: { x: 0, y: -0.2, z: 1.5 }, 
    target: { x: 0, y: -0.35, z: 0 } 
  },
  'thigh left circumference': { 
    position: { x: -0.5, y: 0.0, z: 1.0 }, 
    target: { x: -0.2, y: -0.08, z: 0 } 
  },
  'calf left circumference': { 
    position: { x: -0.5, y: -0.4, z: 1.0 }, 
    target: { x: -0.15, y: -0.48, z: 0 } 
  },
  'ankle left circumference': { 
    position: { x: -0.4, y: -0.7, z: 0.8 }, 
    target: { x: -0.1, y: -0.75, z: 0 } 
  },
  'outseam length': { 
    position: { x: -0.6, y: -0.2, z: 1.5 }, 
    target: { x: -0.15, y: -0.35, z: 0 } 
  },
  
  // FULL BODY - Wide shot
  'height': { 
    position: { x: 0, y: 0.15, z: 2.8 }, 
    target: { x: 0, y: 0.15, z: 0 } 
  },
  
  // Additional measurements with reasonable defaults
  'arm length (shoulder to elbow)': { 
    position: { x: 0.9, y: 0.6, z: 1.0 }, 
    target: { x: 0.3, y: 0.50, z: 0 } 
  },
  'arm length (spine to wrist)': { 
    position: { x: 0.7, y: 0.5, z: 1.2 }, 
    target: { x: 0.25, y: 0.45, z: 0 } 
  },
  'crotch height': { 
    position: { x: 0, y: 0.1, z: 1.5 }, 
    target: { x: 0, y: 0.0, z: 0 } 
  },
  'Hip circumference max height': { 
    position: { x: 0, y: 0.3, z: 1.3 }, 
    target: { x: 0, y: 0.18, z: 0 } 
  },
};

export const Model3DViewerSMPL: React.FC<Model3DViewerProps> = ({
  model3D,
  measurements,
  gender,
  selectedMeasurement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [activeMeasurement, setActiveMeasurement] = useState<string | null>(null);
  const [measurementValue, setMeasurementValue] = useState<string>('');

  // Cinematic camera animation function
  const focusOnMeasurement = (measurementKey: string) => {
    const zone = CAMERA_ZONES[measurementKey];
    if (!zone || !cameraRef.current || !controlsRef.current) {
      console.warn('Camera zone not found for:', measurementKey);
      return;
    }

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Get measurement value for tooltip
    const value = measurements[measurementKey];
    if (value) {
      setMeasurementValue(`${measurementKey}: ${value.toFixed(1)} cm`);
      setActiveMeasurement(measurementKey);
    }

    // Animate camera position and controls target simultaneously
    gsap.to(camera.position, {
      x: zone.position.x,
      y: zone.position.y,
      z: zone.position.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      },
    });

    gsap.to(controls.target, {
      x: zone.target.x,
      y: zone.target.y,
      z: zone.target.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      },
    });

    console.log('Focusing on:', measurementKey, 'Zone:', zone);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      sceneRef.current = scene;

      // Camera - default position for full body view
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 0.15, 2.2);
      camera.lookAt(0, 0.15, 0);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // OrbitControls for manual interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 0.15, 0);
      controls.update();
      controlsRef.current = controls;

      // Lighting (professional setup)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(5, 10, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
      backLight.position.set(0, 5, -10);
      scene.add(backLight);

      // Load Wireframe OBJ Model
      const mtlLoader = new MTLLoader();
      mtlLoader.load(
        '/wireframe-body.mtl',
        (materials) => {
          materials.preload();
          
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(
            '/wireframe-body.obj',
            (obj) => {
              obj.scale.setScalar(1.2);
              obj.position.set(0, 0, 0);
              
              scene.add(obj);
              modelRef.current = obj;
              setModelLoaded(true);
            },
            (progress) => {
              console.log((progress.loaded / progress.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading OBJ model:', error);
            }
          );
        },
        undefined,
        (error) => {
          console.error('Error loading MTL:', error);
        }
      );

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        if (containerRef.current?.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (error) {
      console.error('Error initializing 3D viewer:', error);
    }
  }, [gender]);

  // Handle measurement selection - trigger camera animation
  useEffect(() => {
    if (!modelLoaded || !selectedMeasurement) {
      setActiveMeasurement(null);
      setMeasurementValue('');
      return;
    }

    const value = measurements[selectedMeasurement];
    
    console.log('Selected Measurement:', selectedMeasurement);
    console.log('Measurement value:', value);

    if (!value || value === undefined) {
      console.warn('Measurement value is undefined');
      return;
    }

    focusOnMeasurement(selectedMeasurement);
  }, [selectedMeasurement, modelLoaded, measurements]);

  const handleResetView = () => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Animate back to default view
    gsap.to(camera.position, {
      x: 0,
      y: 0.15,
      z: 2.2,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      },
    });

    gsap.to(controls.target, {
      x: 0,
      y: 0.15,
      z: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      },
    });

    setActiveMeasurement(null);
    setMeasurementValue('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Maximize2 className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">3D Body Model</h3>
        </div>
        <button
          onClick={handleResetView}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition text-sm font-medium"
        >
          <RotateCw size={14} />
          Reset View
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="bg-slate-50 rounded-xl overflow-hidden shadow-sm relative border border-slate-200/60">
        <div
          ref={containerRef}
          style={{ width: '100%', height: '700px' }}
          className="relative"
        >
          {!modelLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading 3D Model...</p>
              </div>
            </div>
          )}

          {/* Measurement Tooltip */}
          {activeMeasurement && measurementValue && (
            <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <p className="font-medium text-sm">{measurementValue}</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-xs rounded-lg px-4 py-3 backdrop-blur pointer-events-none">
            <p className="font-medium">🎬 Cinematic Camera • Drag to rotate • Scroll to zoom • Click measurement to focus</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg flex items-center gap-2 border border-slate-200/60">
        <span>✨</span>
        <span>Cinematic Camera System • Smooth animations powered by GSAP • Click any measurement for close-up</span>
      </div>
    </motion.div>
  );
};
