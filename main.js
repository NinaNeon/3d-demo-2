import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { STLLoader } from './libs/STLLoader.js';

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白色背景

// 建立相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 10;  // ✅ 把 z 往後推，拉遠一點比較容易看到

// 建立渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加入燈光
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 1, 0);
scene.add(light);

// 載入 STL 模型
const loader = new STLLoader();
let model;

loader.load('DFN5X6.stl', (geometry) => {   // ✅ 請確認這邊檔名寫對，DFN5X6.stl
  console.log('✅ 成功載入 STL！'); // ✅ 成功載入後印出訊息

  const material = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
    roughness: 0.2
  });
  model = new THREE.Mesh(geometry, material);
  model.scale.set(10, 10, 10); // ✅ 把模型放大10倍，避免太小看不到
  model.position.set(0, 0, 0); // ✅ 把模型放到正中央
  model.rotation.x = -Math.PI / 2; // ✅ 把模型繞X軸轉90度
  scene.add(model);
}, undefined, (error) => {
  console.error('❌ 載入 STL失敗', error);
});

// 加入控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Clock
const clock = new THREE.Clock();

// 視窗尺寸變動時更新相機跟渲染器
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 動畫循環
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  
  if (model) {
    model.rotation.y += 0.005; // 自動慢慢旋轉
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
