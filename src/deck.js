import {
  createCard,
  loadTexture,
  cardName,
  suits,
  vals,
  THICKNESS,
} from "./card.js";
import { TABLE_TOP } from "./table.js";

/**
 * Deck of cards, with functions to create, shuffle, and stack them
 * @author Laura Salamanca
 */

const SPACING = THICKNESS * 1.05;

/**
 * Creates a deck of 52 cards, one for each suit/value combination
 * @returns {THREE.Mesh[]} array of 52 card meshes
 */
export function createDeck() {
  const textures = loadTexture();
  const deck = [];
  for (const suit of suits) {
    for (const val of vals) {
      deck.push(createCard(textures[cardName(suit, val)], suit, val));
    }
  }
  return deck;
}

/**
 * Shuffles an array of cards using Fisher-Yates shuffle algorithm (assisted by Claude Code)
 * @param {THREE.Mesh[]} arr the array of cards to shuffle
 * @returns {THREE.Mesh[]} shuffled array of cards
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculates the z position of a card in a stack based on its index
 * @param {number} i the index of the card in the stack (0 = bottom, last = top)
 * @returns {number} the z position of the card
 */
export function stackZ(i) {
  return TABLE_TOP + THICKNESS / 2 + i * SPACING;
}

/**
 * Stacks a deck of cards at a specified position and orientation (assisted by Claude Code)
 * @param {THREE.Mesh[]} cards the array of card meshes to stack
 * @param {number} x the x position of the stack
 * @param {number} y the y position of the stack
 * @param {number} yaw the yaw rotation of the stack (default: 0)
 */
export function stackDeck(cards, x, y, yaw = 0) {
  cards.forEach((card, i) => {
    card.rotation.order = "ZXY";
    card.rotation.set(Math.PI, 0, yaw); // x = flip, z = yaw
    card.position.set(x, y, stackZ(i));
  });
}
