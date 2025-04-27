import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { AnimationMixer } from './libs/three.module.js'; // ✅ 加這個！

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

// 載入 GLB 模型
const loader = new GLTFLoader();
let model;
let mixer; // ✅ Mixer控制動畫

loader.load('Duck.glb', (gltf) => {
  model = gltf.scene;
  scene.add(model);

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new AnimationMixer(model);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }
}, undefined, (error) => {
  console.error(error);
});

// 加入控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 加一個Clock來推進動畫
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

  const delta = clock.getDelta(); // ✅ 計算每幀時間差
  if (mixer) {
    mixer.update(delta); // ✅ 更新動畫
  }

  if (model) {
    model.rotation.y += 0.005; // 自動慢慢旋轉
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();