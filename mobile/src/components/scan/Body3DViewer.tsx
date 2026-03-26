/**
 * Body3DViewer - WebView-based Three.js 3D body model viewer
 * Matches the website's Model3DViewerSMPL component exactly
 * Uses the same wireframe-body.obj/mtl files with cinematic camera
 */
import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { API_URL } from '../../config/env';

interface Body3DViewerProps {
  measurements: Record<string, number>;
  gender?: string;
  selectedMeasurement?: string | null;
  onMeasurementSelect?: (key: string | null) => void;
}

export const Body3DViewer: React.FC<Body3DViewerProps> = ({
  measurements,
  gender,
  selectedMeasurement,
  onMeasurementSelect,
}) => {
  const webViewRef = useRef<WebView>(null);
  const modelUrl = `${API_URL}/static/wireframe-body.obj`;
  const mtlUrl = `${API_URL}/static/wireframe-body.mtl`;
  const bodyColor = gender === 'female' ? '0xEC4899' : '0x3B82F6';

  // Build the HTML content with classic script tags (no import maps)
  const htmlContent = useMemo(() => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f172a;overflow:hidden;touch-action:none}
#c{width:100vw;height:100vh;position:relative}
#loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f172a;z-index:10}
.spin{width:40px;height:40px;border:3px solid #334155;border-top:3px solid #8B5CF6;border-radius:50%;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(360deg)}}
.lt{color:#94a3b8;font-family:system-ui;font-size:14px;margin-top:12px}
#tip{position:absolute;top:10px;left:10px;right:10px;background:rgba(0,0,0,0.85);color:#fff;padding:10px 14px;border-radius:10px;font-family:system-ui;font-size:13px;font-weight:600;display:none;border:1px solid rgba(139,92,246,0.4)}
#hint{position:absolute;bottom:10px;left:10px;right:10px;background:rgba(0,0,0,0.7);color:#94a3b8;padding:8px 10px;border-radius:8px;font-family:system-ui;font-size:10px;text-align:center}
</style>
</head><body>
<div id="c">
  <div id="loading"><div class="spin"></div><div class="lt">Loading 3D Model...</div></div>
  <div id="tip"></div>
  <div id="hint">🎬 Drag to rotate • Pinch to zoom</div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MTLLoader.js"></script>

<script>
(function(){
  var c = document.getElementById('c');
  var ld = document.getElementById('loading');
  var tip = document.getElementById('tip');

  // Scene
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  // Camera
  var cam = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
  cam.position.set(0, 0.15, 2.2);
  cam.lookAt(0, 0.15, 0);

  // Renderer
  var r = new THREE.WebGLRenderer({antialias:true, alpha:true});
  r.setSize(window.innerWidth, window.innerHeight);
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  c.appendChild(r.domElement);

  // Controls
  var ctrl = new THREE.OrbitControls(cam, r.domElement);
  ctrl.enableDamping = true;
  ctrl.dampingFactor = 0.05;
  ctrl.target.set(0, 0.15, 0);
  ctrl.update();

  // Lighting (same as website)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var kl = new THREE.DirectionalLight(0xffffff, 1.0);
  kl.position.set(5, 10, 5);
  kl.castShadow = true;
  kl.shadow.mapSize.width = 1024;
  kl.shadow.mapSize.height = 1024;
  scene.add(kl);
  var fl = new THREE.DirectionalLight(0xffffff, 0.4);
  fl.position.set(-5, 5, -5);
  scene.add(fl);
  var bl = new THREE.DirectionalLight(0xffffff, 0.3);
  bl.position.set(0, 5, -10);
  scene.add(bl);

  // Ground grid
  var grid = new THREE.GridHelper(4, 20, 0x1e293b, 0x1e293b);
  grid.position.y = -0.85;
  scene.add(grid);

  // Camera zones for cinematic focus (same as website)
  var ZONES = {
    'head_circumference':          {p:[0,1.2,0.8],    t:[0,0.95,0]},
    'head circumference':          {p:[0,1.2,0.8],    t:[0,0.95,0]},
    'neck_circumference':          {p:[0,1.0,0.7],    t:[0,0.78,0]},
    'neck circumference':          {p:[0,1.0,0.7],    t:[0,0.78,0]},
    'chest_circumference':         {p:[0,0.75,1.2],   t:[0,0.60,0]},
    'chest circumference':         {p:[0,0.75,1.2],   t:[0,0.60,0]},
    'shoulder_breadth':            {p:[0,0.85,1.0],   t:[0,0.70,0]},
    'shoulder breadth':            {p:[0,0.85,1.0],   t:[0,0.70,0]},
    'shoulder_to_crotch_height':   {p:[0,0.5,1.5],    t:[0,0.45,0]},
    'shoulder to crotch height':   {p:[0,0.5,1.5],    t:[0,0.45,0]},
    'waist_circumference':         {p:[0,0.5,1.2],    t:[0,0.35,0]},
    'waist circumference':         {p:[0,0.5,1.2],    t:[0,0.35,0]},
    'hip_circumference':           {p:[0,0.3,1.2],    t:[0,0.15,0]},
    'hip circumference':           {p:[0,0.3,1.2],    t:[0,0.15,0]},
    'bicep_right_circumference':   {p:[0.8,0.65,0.8], t:[0.4,0.52,0]},
    'bicep right circumference':   {p:[0.8,0.65,0.8], t:[0.4,0.52,0]},
    'forearm_right_circumference': {p:[0.8,0.42,0.8], t:[0.4,0.32,0]},
    'forearm right circumference': {p:[0.8,0.42,0.8], t:[0.4,0.32,0]},
    'wrist_right_circumference':   {p:[0.8,0.18,0.8], t:[0.5,0.08,0]},
    'wrist right circumference':   {p:[0.8,0.18,0.8], t:[0.5,0.08,0]},
    'arm_right_length':            {p:[0.9,0.5,1.0],  t:[0.35,0.40,0]},
    'arm right length':            {p:[0.9,0.5,1.0],  t:[0.35,0.40,0]},
    'arm_left_length':             {p:[-0.9,0.5,1.0], t:[-0.35,0.40,0]},
    'arm left length':             {p:[-0.9,0.5,1.0], t:[-0.35,0.40,0]},
    'thigh_left_circumference':    {p:[-0.5,0.0,1.0], t:[-0.2,-0.08,0]},
    'thigh left circumference':    {p:[-0.5,0.0,1.0], t:[-0.2,-0.08,0]},
    'calf_left_circumference':     {p:[-0.5,-0.4,1.0],t:[-0.15,-0.48,0]},
    'calf left circumference':     {p:[-0.5,-0.4,1.0],t:[-0.15,-0.48,0]},
    'ankle_left_circumference':    {p:[-0.4,-0.7,0.8],t:[-0.1,-0.75,0]},
    'ankle left circumference':    {p:[-0.4,-0.7,0.8],t:[-0.1,-0.75,0]},
    'inside_leg_height':           {p:[0,-0.2,1.5],   t:[0,-0.35,0]},
    'inside leg height':           {p:[0,-0.2,1.5],   t:[0,-0.35,0]},
    'outseam_length':              {p:[-0.6,-0.2,1.5],t:[-0.15,-0.35,0]},
    'outseam length':              {p:[-0.6,-0.2,1.5],t:[-0.15,-0.35,0]},
    'height':                      {p:[0,0.15,2.8],   t:[0,0.15,0]},
  };

  // Smooth camera animation (replaces GSAP from website)
  var animId = null;
  function animCam(tp, tt, dur) {
    dur = dur || 1500;
    if (animId) cancelAnimationFrame(animId);
    var sp = {x:cam.position.x, y:cam.position.y, z:cam.position.z};
    var st = {x:ctrl.target.x, y:ctrl.target.y, z:ctrl.target.z};
    var t0 = Date.now();
    function step() {
      var el = Date.now() - t0;
      var t = Math.min(el/dur, 1);
      var e = t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
      cam.position.set(sp.x+(tp[0]-sp.x)*e, sp.y+(tp[1]-sp.y)*e, sp.z+(tp[2]-sp.z)*e);
      ctrl.target.set(st.x+(tt[0]-st.x)*e, st.y+(tt[1]-st.y)*e, st.z+(tt[2]-st.z)*e);
      ctrl.update();
      if (t<1) animId = requestAnimationFrame(step);
      else animId = null;
    }
    step();
  }

  // Global function called from React Native via injectJavaScript
  window.focusMeasurement = function(key, value) {
    // Try both underscore and space versions
    var zone = ZONES[key] || ZONES[key.replace(/_/g,' ')];
    if (zone) {
      animCam(zone.p, zone.t);
      var label = key.replace(/_/g, ' ');
      tip.textContent = label + (value ? ': ' + value.toFixed(1) + ' cm' : '');
      tip.style.display = 'block';
    }
  };

  window.resetView = function() {
    animCam([0, 0.15, 2.2], [0, 0.15, 0]);
    tip.style.display = 'none';
  };

  // Load model
  function loadModel() {
    var mtlL = new THREE.MTLLoader();
    mtlL.load('${mtlUrl}', function(mats) {
      mats.preload();
      var objL = new THREE.OBJLoader();
      objL.setMaterials(mats);
      objL.load('${modelUrl}', onModelLoaded, undefined, function() {
        loadObjOnly();
      });
    }, undefined, function() {
      loadObjOnly();
    });
  }

  function loadObjOnly() {
    var objL = new THREE.OBJLoader();
    objL.load('${modelUrl}', function(obj) {
      obj.traverse(function(ch) {
        if (ch.isMesh) {
          ch.material = new THREE.MeshPhongMaterial({
            color: ${bodyColor},
            wireframe: true,
            transparent: true,
            opacity: 0.85
          });
        }
      });
      onModelLoaded(obj);
    }, undefined, function(err) {
      // OBJ also failed - show procedural body
      ld.querySelector('.lt').textContent = 'Creating body model...';
      createProceduralBody();
    });
  }

  function onModelLoaded(obj) {
    obj.scale.setScalar(1.2);
    obj.position.set(0, 0, 0);
    scene.add(obj);
    ld.style.display = 'none';
  }

  // Procedural fallback body (in case OBJ fails to load)
  function createProceduralBody() {
    var bodyColor = ${bodyColor};
    var mat = new THREE.MeshPhongMaterial({color:bodyColor, transparent:true, opacity:0.85});
    var wireMat = new THREE.MeshPhongMaterial({color:bodyColor, wireframe:true, transparent:true, opacity:0.6});
    var group = new THREE.Group();

    // Head
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), mat);
    head.position.set(0, 0.88, 0);
    group.add(head);
    // Neck
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12), mat);
    neck.position.set(0, 0.73, 0);
    group.add(neck);
    // Torso
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.5, 16), mat);
    torso.position.set(0, 0.45, 0);
    group.add(torso);
    // Hips
    var hips = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), mat);
    hips.position.set(0, 0.18, 0);
    group.add(hips);
    // Left Arm
    var lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.45, 8), mat);
    lArm.position.set(-0.25, 0.48, 0);
    lArm.rotation.z = 0.15;
    group.add(lArm);
    // Right Arm
    var rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.45, 8), mat);
    rArm.position.set(0.25, 0.48, 0);
    rArm.rotation.z = -0.15;
    group.add(rArm);
    // Left Leg
    var lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6, 10), mat);
    lLeg.position.set(-0.08, -0.15, 0);
    group.add(lLeg);
    // Right Leg
    var rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6, 10), mat);
    rLeg.position.set(0.08, -0.15, 0);
    group.add(rLeg);

    scene.add(group);
    ld.style.display = 'none';
  }

  loadModel();

  // Render loop
  function render() {
    requestAnimationFrame(render);
    ctrl.update();
    r.render(scene, cam);
  }
  render();

  // Resize
  window.addEventListener('resize', function() {
    cam.aspect = window.innerWidth/window.innerHeight;
    cam.updateProjectionMatrix();
    r.setSize(window.innerWidth, window.innerHeight);
  });
})();
</script>
</body></html>`, [modelUrl, mtlUrl, bodyColor]);

  // Send measurement focus commands to WebView via injectJavaScript
  useEffect(() => {
    if (!webViewRef.current) return;

    if (selectedMeasurement) {
      const value = measurements[selectedMeasurement];
      const js = `window.focusMeasurement('${selectedMeasurement}', ${value || 0}); true;`;
      webViewRef.current.injectJavaScript(js);
    } else {
      webViewRef.current.injectJavaScript('window.resetView(); true;');
    }
  }, [selectedMeasurement]);

  // Key measurements for the interactive buttons
  const keyMeasurements = [
    { key: 'head_circumference', label: '🧠 Head' },
    { key: 'neck_circumference', label: '🦒 Neck' },
    { key: 'chest_circumference', label: '💪 Chest' },
    { key: 'waist_circumference', label: '📏 Waist' },
    { key: 'hip_circumference', label: '🍑 Hip' },
    { key: 'arm_right_length', label: '💪 Arm' },
    { key: 'thigh_left_circumference', label: '🦵 Thigh' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20 }}>🧍</Text>
        <Text style={styles.headerTitle}>3D Body Model</Text>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => {
            onMeasurementSelect?.(null);
            webViewRef.current?.injectJavaScript('window.resetView(); true;');
          }}
        >
          <Text style={styles.resetBtnText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 3D WebView */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          startInLoadingState={false}
          androidLayerType="hardware"
        />
      </View>

      {/* Measurement focus buttons */}
      <View style={styles.measurementBtns}>
        {keyMeasurements.map((m) => {
          const value = measurements[m.key];
          if (!value) return null;
          const isActive = selectedMeasurement === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.measurementBtn, isActive && styles.measurementBtnActive]}
              onPress={() => onMeasurementSelect?.(isActive ? null : m.key)}
            >
              <Text style={[styles.measurementLabel, isActive && styles.measurementLabelActive]}>
                {m.label}
              </Text>
              <Text style={[styles.measurementVal, isActive && styles.measurementValActive]}>
                {value.toFixed(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipText}>✨ Tap a measurement above to zoom the 3D model to that body part</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
  },
  resetBtnText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  webviewContainer: {
    height: 380,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  measurementBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  measurementBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  measurementBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  measurementLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  measurementLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  measurementVal: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.text,
  },
  measurementValActive: {
    color: Colors.primary,
  },
  tip: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default Body3DViewer;
