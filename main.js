import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { AnimationMixer } from './libs/three.module.js'; // ✅ 加這個！

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白色背景

// 建立相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 8.5;

// 建立渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加入燈光
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
light.position.set(0, 1, 0);
scene.add(light);

// 載入 GLB 模型
const loader = new GLTFLoader();
let model;
let mixer; // ✅ Mixer控制動畫

loader.load('DFN5X6.glb', (gltf) => {
  model = gltf.scene;
  scene.add(model);

  // ✅ 遍歷每個子Mesh，根據名字自動上色
  model.traverse((child) => {
    if (child.isMesh) {
      console.log('找到子物件:', child.name);

      const name = child.name.toLowerCase();

      if (name.includes('node1') || name.includes('main') || name.includes('top')) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x111111,    // 本體黑色
          metalness: 0.5,
          roughness: 0.8,
        });
      } else if (name.includes('node2') || name.includes('foot') || name.includes('lead')) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,    // 腳銀白色
          metalness: 1.0,
          roughness: 0.2,
        });
      } else {
        // 其他沒分類到的，用中性灰色
        child.material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.3,
          roughness: 0.7,
        });
      }
    }
  });

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
  camera.aspect = window.innerWidth / window.innerHeight;
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