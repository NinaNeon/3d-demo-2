import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { AnimationMixer } from './libs/three.module.js';

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白色背景

// 建立相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 建立渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 限制 pixel ratio，避免手機過大
document.body.appendChild(renderer.domElement);

// 加入光源
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
light.position.set(0, 1, 0);
scene.add(light);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 載入 GLB 模型
const loader = new GLTFLoader();
let model;
let mixer;

loader.load('DFN5X6.glb', (gltf) => {
  model = gltf.scene;
  scene.add(model);

  // 材質分類上色
  model.traverse((child) => {
    if (child.isMesh) {
      const name = child.name.toLowerCase();
      if (name.includes('node1') || name.includes('main') || name.includes('top')) {
        child.material?.color?.set(0x111111);
      } else if (name.includes('node2') || name.includes('foot') || name.includes('lead')) {
        child.material?.color?.set(0xcccccc);
      } else {
        child.material?.color?.set(0x888888);
      }
    }
  });

  // 動畫（若有）
  if (gltf.animations?.length > 0) {
    mixer = new AnimationMixer(model);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }

  // 自動調整 scale 與相機距離
  const bbox = new THREE.Box3().setFromObject(model);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());

  // ✅ 微調縮放倍數：桌機原本是 10，改為 7；手機仍為 5
  const scaleFactor = window.innerWidth < 600 ? 5 : 6;
  model.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // ✅ 微調相機距離：乘上 1.5（原本是 1.2，拉遠一點）
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = (maxDim * scaleFactor) / (2 * Math.tan(fov / 2));
  cameraZ *= 3; // ⬅️ 拉遠一點

  camera.position.set(center.x, center.y, cameraZ);
  camera.lookAt(center);
}, undefined, (error) => {
  console.error('GLTF load error:', error);
});

// 視窗尺寸變化處理
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 時鐘與動畫迴圈
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (model) model.rotation.y += 0.005;
  controls.update();
  renderer.render(scene, camera);
}

animate();