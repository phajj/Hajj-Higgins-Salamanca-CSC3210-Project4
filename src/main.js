import * as THREE from "three";
import { perspectiveCamera, setCameraView } from "./camera.js";
import { createDeck, shuffle, stackDeck, stackZ } from "./deck.js";
import { createTable } from "./table.js";
import { updateAnimations, moveCard } from "./animation.js";

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

// Camera (starts in the top down view)
const camera = perspectiveCamera(window.innerWidth / window.innerHeight);
let currentView = "topDown";

// Number keys that select each camera view
const VIEW_KEYS = { 1: "topDown", 2: "angled", 3: "side" };

/**
 * Switches the camera to a preset view and remembers which one is active
 * @param {string} view: key of CAMERA_VIEWS
 */
function changeView(view) {
  currentView = view;
  setCameraView(camera, view);
}

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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Aces are high in War
const rank = (card) => (card.userData.val === 1 ? 14 : card.userData.val);

// Players who still have cards in their hand
const activePlayers = () => [0, 1, 2].filter((p) => hands[p].length > 0);

/**
 * Moves the top card of a player's hand onto their center pile
 * @param {number} p the player index
 * @param {boolean} faceUp whether the card lands face up
 * @returns {Promise} resolves when the card has landed
 */
function playCard(p, faceUp) {
  const card = hands[p].pop();
  const pile = centerPiles[p];
  const target = new THREE.Vector3(
    CENTER_POS[p].x,
    CENTER_POS[p].y,
    stackZ(pile.length),
  );
  pile.push(card);
  return moveCard(card, target, faceUp ? 0 : Math.PI, 0.9, 3);
}

/**
 * Plays the next move in the game: every player with cards plays one card face up,
 * the highest card (after any wars) takes every card in the center
 * @returns
 */
async function playNextMove() {
  const players = activePlayers();
  if (players.length < 2) return;
  await Promise.all(
    // stagger the moves so they don't all happen at once
    players.map((p, i) => wait(i * 150).then(() => playCard(p, true))),
  );

  const winner = await resolveBattle(players);
  await wait(2000); // leave the played cards on the table for a moment
  await collectPot(winner);

  if (activePlayers().length === 1)
    console.log(`Player ${winner + 1} wins the game!`);
}

/**
 * Compares the face up cards on top of each contender's center pile. If the highest
 * card is tied, every contender goes to war, not just the tied players: each plays
 * one card face down and one face up, then the new face up cards are compared.
 * A player with only one card left plays it face up, and a player with no cards
 * left loses the war.
 * @param {number[]} contenders the players in this battle
 * @returns {Promise<number>} the winning player
 */
async function resolveBattle(contenders) {
  const top = (p) => rank(centerPiles[p][centerPiles[p].length - 1]);
  const best = Math.max(...contenders.map(top));
  const tied = contenders.filter((p) => top(p) === best);
  if (tied.length === 1) return tied[0];

  // War detected
  const fighters = contenders.filter((p) => hands[p].length > 0);
  if (fighters.length === 0) return tied[0]; // nobody can continue the war
  if (fighters.length === 1) return fighters[0];

  await Promise.all(
    fighters.map(async (p, i) => {
      await wait(i * 150);
      if (hands[p].length > 1) await playCard(p, false);
      await playCard(p, true);
    }),
  );
  return resolveBattle(fighters);
}

/**
 * Gives every card in the center piles to the winner, placing them face down
 * at the bottom of the winner's hand
 * @param {number} winner the player who won the battle
 */
async function collectPot(winner) {
  // Shuffle the won cards so games can't loop forever
  const pot = shuffle(centerPiles.flatMap((pile) => pile.splice(0)));
  const hand = hands[winner];
  const { x, y } = DECK_POS[winner];
  const yaw = ANGLES[winner];

  // Flip the pot face down in place and turn it toward the winner,
  // taking the shortest way around
  await Promise.all(
    pot.map((card) => {
      const turns = Math.round((card.rotation.z - yaw) / (2 * Math.PI));
      const toYaw = yaw + turns * 2 * Math.PI;
      return moveCard(card, card.position.clone(), Math.PI, 0.5, 2, toYaw);
    }),
  );

  // Lift the winner's hand to make room underneath for the won cards
  await Promise.all(
    hand.map((card, i) =>
      moveCard(card, new THREE.Vector3(x, y, stackZ(i + pot.length)), Math.PI, 0.25),
    ),
  );

  hand.unshift(...pot);
  await Promise.all(
    pot.map((card, i) =>
      moveCard(card, new THREE.Vector3(x, y, stackZ(i)), Math.PI, 0.7),
    ),
  );
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
 * p toggles the point light, l toggles the ambient light and m toggles shadows,
 * c cycles through the camera views, 1 2 3 pick a camera view
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
    if (event.key.toLocaleLowerCase() === "m" && !event.repeat) {
      pointLight.castShadow = !pointLight.castShadow;
      sunLight.castShadow = !sunLight.castShadow;
    }
    if (event.key.toLocaleLowerCase() === "c" && !event.repeat) {
      // Cycle to the next view in 1, 2, 3 order
      const views = Object.values(VIEW_KEYS);
      changeView(views[(views.indexOf(currentView) + 1) % views.length]);
    }
    if (VIEW_KEYS[event.key] && !event.repeat) changeView(VIEW_KEYS[event.key]);
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
const WORLD_UP = new THREE.Vector3(0, 0, 1);

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
  // Looking straight down there is no flat view direction, so use screen up
  if (forward.lengthSq() < 1e-6) forward.copy(camera.up);
  forward.normalize();
  right.crossVectors(forward, WORLD_UP).normalize();
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
