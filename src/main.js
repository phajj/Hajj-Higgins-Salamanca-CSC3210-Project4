import * as THREE from "three";
import { perspectiveCamera } from "./camera.js";
import { loadTexture, createCard } from "./card.js";
import { createTable } from "./table.js";

const MOUSE_SENSITIVITY = 0.002;
const LIGHT_MOVE_SPEED = 0.1;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Camera (perspective in ship cockpit)
const camera = perspectiveCamera(window.innerWidth / window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000);
pointLight.position.set(0, 0, 20);
pointLight.castShadow = true;
scene.add(pointLight);

// Table
const table = createTable();
// Shadow has to applied to each piece individually
table.traverse((child) => {
  child.castShadow = true;
  child.receiveShadow = true;
});
scene.add(table);

// Keep the camera and the renderer in sync with the window size
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard input handling
var wPresssed = false;
var aPresssed = false;
var sPresssed = false;
var dPresssed = false;
var qPresssed = false;
var ePresssed = false;

/**
 * Handles keyboard input:
 * w a s d move the point light, q e rotate the camera,
 * p toggles the point light, l toggles the ambient light and m toggles shadows
 * (copied and modified from Project 2)
 */
function keyboardInput() {
  // Handle keydown events to start movement
  window.addEventListener("keydown", (event) => {
    if (event.key.toLocaleLowerCase() === "w")
      wPresssed = true;
    if (event.key.toLocaleLowerCase() === "a")
      aPresssed = true;
    if (event.key.toLocaleLowerCase() === "s")
      sPresssed = true;
    if (event.key.toLocaleLowerCase() === "d")
      dPresssed = true;
    if (event.key.toLocaleLowerCase() === "q")
      qPresssed = true;
    if (event.key.toLocaleLowerCase() === "e")
      ePresssed = true;
    if (event.key.toLocaleLowerCase() === "p" && !event.repeat)
      pointLight.visible = !pointLight.visible;
    if (event.key.toLocaleLowerCase() === "l" && !event.repeat)
      ambientLight.visible = !ambientLight.visible;
    if (event.key.toLocaleLowerCase() === "m" && !event.repeat)
      pointLight.castShadow = !pointLight.castShadow;
    });

  // Handle keyup events to stop movement
  window.addEventListener("keyup", (event) => {
    if (event.key.toLocaleLowerCase() === "w")
      wPresssed = false;
    if (event.key.toLocaleLowerCase() === "a")
      aPresssed = false;
    if (event.key.toLocaleLowerCase() === "s")
      sPresssed = false;
    if (event.key.toLocaleLowerCase() === "d")
      dPresssed = false;
    if (event.key.toLocaleLowerCase() === "q")
      qPresssed = false;
    if (event.key.toLocaleLowerCase() === "e")
      ePresssed = false;
  });
}

// Reused every frame by updateMovement() instead of allocating new vectors
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const movement = new THREE.Vector3();

/**
 * Moves the point light with WASD, keeping it at the same height above the table.
 * Called every frame from animate() so multiple keys can be held at once.
 * (copied and modified from project 2)
 */
function updateMovement() {
  // Flatten the camera's view direction onto the table so W moves the light
  // away from the camera and A/D move it left/right on screen.
  camera.getWorldDirection(forward);
  forward.z = 0;
  forward.normalize();
  right.crossVectors(forward, camera.up).normalize();
  movement.set(0, 0, 0);

  if (wPresssed)
    movement.add(forward);
  if (aPresssed)
    movement.sub(right);
  if (sPresssed)
    movement.sub(forward);
  if (dPresssed)
    movement.add(right);
  // Normalize combined input so diagonal movement has the same speed.
  if (movement.lengthSq() > 0)
    pointLight.position.addScaledVector(movement.normalize(), LIGHT_MOVE_SPEED);
}

/**
 * Rotates the perspective camera left or right.
 * @returns {void}
 */
function rotateCam(){
  if (qPresssed)
    camera.rotation.z += 0.01;
  if (ePresssed)
    camera.rotation.z -= 0.01;
}

keyboardInput();

/**
 * Render loop, called once per frame
 */
function animate() {
  updateMovement();
  rotateCam();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
