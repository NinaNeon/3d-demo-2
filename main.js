import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { STLLoader } from './libs/STLLoader.js'; // ✅ 改成載入 STLLoader

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白色背景

// 建立相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 2;

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

loader.load('DFN5X6.stl', (geometry) => {  // ✅ 注意: 換成你的 STL 檔名
  const material = new THREE.MeshStandardMaterial({
    color: 0x555555,  // ✅ 半導體產品常用的深灰色
    metalness: 0.8,
    roughness: 0.2
  });
  model = new THREE.Mesh(geometry, material);
  scene.add(model);
}, undefined, (error) => {
  console.error(error);
});

// 加入控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 加一個Clock來推進動畫（雖然這次不需要mixer了，但Clock可以保留）
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

  const delta = clock.getDelta(); // ✅ 這裡保留，雖然沒mixer但controls會用
  // 這次不需要 mixer.update(delta) 了

  if (model) {
    model.rotation.y += 0.005; // 自動慢慢旋轉
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
