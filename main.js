import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // Semi-black background (Almost black, but not fully)

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Slightly above and in front of the model

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft light to make sure the scene isn't too dark
scene.add(ambientLight);

// Directional Light (To give some depth and shadow effect)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

// Create a veiling fog or mist
const fogColor = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(fogColor, 12, 20); // Start and end distances will be adjusted dynamically

// Create a semi-transparent veil plane
const veilGeometry = new THREE.PlaneGeometry(15, 15);
const veilMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide
});
const veil = new THREE.Mesh(veilGeometry, veilMaterial);
veil.position.set(0, 1, 2); // Position between camera and eye model
scene.add(veil);

// Variables for animation
let model;
let initialModelPosition = { x: 0, y: 1, z: -11 };
let time = 0;
const movementAmplitude = 1
const movementSpeed = 0.001; // Speed of the movement cycle
const minVeilOpacity = 0.2; // Minimum opacity when most forward
const maxVeilOpacity = 0.5; // Maximum opacity when

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  './models/scene.gltf', // Make sure this path is correct. Should be relative to your public folder.
  function (gltf) {
    model = gltf.scene;
    model.position.set(initialModelPosition.x, initialModelPosition.y, initialModelPosition.z);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

// Animation Loop
function animate() {
  time += movementSpeed;
  
  if (model) {
    // Calculate position with a sine wave for smooth back and forth movement
    const movementFactor = Math.sin(time);
    
    // Move the model back and forth
    model.position.z = initialModelPosition.z + movementFactor * movementAmplitude;
    
    // Calculate how far back the model is (normalized from 0 to 1)
    // When movementFactor is -1, the model is furthest back
    const backPosition = (-movementFactor + 1) / 2; // Convert from [-1,1] to [1,0] then to [0,1]
    
    // Apply veiling effect based on position
 veilMaterial.opacity = minVeilOpacity + backPosition * (maxVeilOpacity - minVeilOpacity);
    
    // Adjust fog density based on position
    scene.fog.near = 12 - backPosition * 4; // Bring fog closer when moving back
    scene.fog.far = 20 - backPosition * 4;  // Make fog denser when moving back
  }
  
  renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
