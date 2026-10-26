import * as THREE from "three";
/**
 * Card object represents a single card with a suit and value
 * @author: Peter Hajj
 */

const BASE_URL = 'https://webisso.github.io/playing-cards/png/';
const WIDTH = 2.5;
const HEIGHT = 3.5;
const THICKNESS = 0.02;

// Every card has plain red back with white edge
const backMaterial = new THREE.MeshBasicMaterial({color: 0xD61305});
const edgeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const cardGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, THICKNESS);

const loader = new THREE.TextureLoader();
export const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const namedCards = {1: 'ace', 11: 'jack', 12: 'queen', 13: 'king'};
export const vals = [];
for (let i = 1; i <= 13; i++) {
    vals.push(i);
}

/**
 * Loads the front-face texture for every suit/value combination
 * (assisted by Claude Code)
 * @returns {Object} map of card name (ex: "ace_of_spades") to THREE.Texture
 */
export function loadTexture() {
    const textures = {};
    for (const suit of suits) {
        for (const val of vals) {
            const name = `${namedCards[val] ?? val}_of_${suit}`;
            textures[name] = loader.load(`${BASE_URL}${name}.png`);
            textures[name].colorSpace = THREE.SRGBColorSpace;
        }
    }
    return textures;
}

/**
 * Creates a card mesh with the webisso texture on the front and a red back
 * @param {THREE.Texture} texture: front face webisso texture from loadTexture()
 * @param {string} suit: hearts, diamonds, clubs, spades
 * @param {number} val: 1-13
 * @returns {THREE.Mesh} with suit and val stored in userData
 */
export function createCard(texture, suit, val) {
    const frontMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const card = new THREE.Mesh(cardGeometry, [
        edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, frontMaterial, backMaterial//+x, -x, +y, -y, +z, -z
    ]);
    card.userData = {suit, val};
    return card;
}