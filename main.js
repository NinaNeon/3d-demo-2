import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { STLLoader } from './libs/STLLoader.js';

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白色背景

// 建立相機
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 200;  // 🔥 相機拉超遠，保證看得到！

// 建立渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加一個超亮的環境光
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 載入 STL
const loader = new STLLoader();
let model = null;

loader.load('DFN5X6.stl', (geometry) => {
  console.log('✅ 成功載入 STL！');
  console.log('🔵 geometry內容:', geometry);

  const material = new THREE.MeshBasicMaterial({
    color: 0x555555,
    wireframe: false
  });

  model = new THREE.Mesh(geometry, material);

  model.scale.set(100, 100, 100); // 🔥 放大100倍
  model.position.set(0, 0, 0);
  model.rotation.x = -Math.PI / 2;

  scene.add(model);
  console.log('🔵 scene內容:', scene.children);

}, undefined, (error) => {
  console.error('❌ 載入 STL失敗', error);
});

// 視窗尺寸變動時更新
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 動畫循環
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.y += 0.005; // 自轉
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();