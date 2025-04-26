import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';

// 场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// 相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 灯光
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 1, 0);
scene.add(light);

// 画一个简单的球体
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 响应式
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();