import * as THREE from "three";
import { perspectiveCamera } from "./camera.js";
import { createDeck, shuffle, stackDeck, stackZ } from "./deck.js";
import { createTable } from "./table.js";
import { updateAnimations, moveCard } from "./animation.js";

const MOUSE_SENSITIVITY = 0.002;
const LIGHT_MOVE_SPEED = 0.1;

const loader = new THREE.CubeTextureLoader();
loader.setPath("resources/skybox/");
const skyboxTexture = loader.load([
  "Left.png",
  "Right.png",
  "Up.png",
  "Down.png",
  "Front.png",
  "Back.png",
]);

// Scene
const scene = new THREE.Scene();
scene.background = skyboxTexture;
// Rotate skybox to match table
scene.backgroundRotation.x = Math.PI / 2;

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

const sunLight = new THREE.DirectionalLight(0xfff2d9, 1.5);
sunLight.castShadow = true;
sunLight.position.set(20, 10, 40);
scene.add(sunLight);

// Table
const table = createTable();
// Shadow has to applied to each piece individually
table.traverse((child) => {
  child.castShadow = true;
  child.receiveShadow = true;
});
scene.add(table);

//Card layout and dealing
const ANGLES = [0, 1, 2].map((p) => (p * 2 * Math.PI) / 3);
const DIRS = ANGLES.map((a) => new THREE.Vector2(Math.sin(a), -Math.cos(a)));
const DECK_POS = DIRS.map((d) => new THREE.Vector2(d.x * 20, d.y * 13));
const CENTER_POS = DIRS.map((d) => new THREE.Vector2(d.x * 4, d.y * 4));

const hands = [[], [], []];
const centerPiles = [[], [], []];

//Shuffle the deck and deal 17 cards to each player
const deck = shuffle(createDeck());

deck.pop(); // discard one random card so 51 cards deal evenly
deck.forEach((c, i) => hands[i % 3].push(c));

hands.forEach((h, p) => {
  stackDeck(h, DECK_POS[p].x, DECK_POS[p].y, ANGLES[p]);
  h.forEach((c) => scene.add(c));
});

let busy = false;

/**
 * Plays the next move in the game, moving one card from each player's hand to the center pile
 * @returns
 */
async function playNextMove() {
  if (!hands[0].length) return;
  const moves = hands.map((hand, p) => {
    const card = hand.pop();
    const pile = centerPiles[p];
    const target = new THREE.Vector3(
      CENTER_POS[p].x,
      CENTER_POS[p].y,
      stackZ(pile.length),
    );
    pile.push(card);
    return new Promise((r) => setTimeout(r, p * 150)).then(() =>
      // stagger the moves so they don't all happen at once
      moveCard(card, target, 0, 0.9, 3),
    );
  });
  await Promise.all(moves);
}

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

/**
 * Handles keyboard input:
 * w a s d move the point light,
 * p toggles the point light, l toggles the ambient light and m toggles shadows
 * (copied and modified from Project 2)
 */
function keyboardInput() {
  // Handle keydown events to start movement
  window.addEventListener("keydown", (event) => {
    if (event.key.toLocaleLowerCase() === "w") wPresssed = true;
    if (event.key.toLocaleLowerCase() === "a") aPresssed = true;
    if (event.key.toLocaleLowerCase() === "s") sPresssed = true;
    if (event.key.toLocaleLowerCase() === "d") dPresssed = true;
    if (event.key.toLocaleLowerCase() === "n" && !event.repeat && !busy) {
      busy = true;
      playNextMove().finally(() => (busy = false));
    }
    if (event.key.toLocaleLowerCase() === "p" && !event.repeat)
      pointLight.visible = !pointLight.visible;
    if (event.key.toLocaleLowerCase() === "l" && !event.repeat)
      ambientLight.visible = !ambientLight.visible;
    if (event.key.toLocaleLowerCase() === "m" && !event.repeat)
      pointLight.castShadow = !pointLight.castShadow;
    sunLight.castShadow = !sunLight.castShadow;
  });

  // Handle keyup events to stop movement
  window.addEventListener("keyup", (event) => {
    if (event.key.toLocaleLowerCase() === "w") wPresssed = false;
    if (event.key.toLocaleLowerCase() === "a") aPresssed = false;
    if (event.key.toLocaleLowerCase() === "s") sPresssed = false;
    if (event.key.toLocaleLowerCase() === "d") dPresssed = false;
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

  if (wPresssed) movement.add(forward);
  if (aPresssed) movement.sub(right);
  if (sPresssed) movement.sub(forward);
  if (dPresssed) movement.add(right);
  // Normalize combined input so diagonal movement has the same speed.
  if (movement.lengthSq() > 0)
    pointLight.position.addScaledVector(movement.normalize(), LIGHT_MOVE_SPEED);
}

keyboardInput();

// Clock for delta time
const clock = new THREE.Clock();

/**
 * Render loop, called once per frame
 */
function animate() {
  updateMovement();
  updateAnimations(clock.getDelta());
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
