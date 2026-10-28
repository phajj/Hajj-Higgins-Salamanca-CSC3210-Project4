const animations = [];

/**
 * Card animations for moving cards
 * @author Laura Salamanca
 */

/**
 * Animates the movement of a card to a new position and rotation
 * @param {THREE.Mesh} card the card to animate
 * @param {THREE.Vector3} toPos the target position
 * @param {number} toRotX the target rotation around the x-axis
 * @param {number} duration the animation duration (default: 0.8)
 * @param {number} arc the height of the arc (default: 0)
 * @returns {Promise} a promise that resolves when the animation is complete
 */
export function moveCard(card, toPos, toRotX, duration = 0.8, arc = 0) {
  const fromPos = card.position.clone();
  const fromRot = card.rotation.x;
  return new Promise((resolve) => {
    animations.push({
      card,
      fromPos,
      toPos,
      fromRot,
      toRot: toRotX,
      duration,
      arc,
      t: 0,
      resolve,
    });
  });
}

/**
 * Updates all active animations (assisted by Claude Code)
 * @param {number} dt the time elapsed since the last update
 */
export function updateAnimations(dt) {
  for (let i = animations.length - 1; i >= 0; i--) {
    const a = animations[i];
    a.t = Math.min(a.t + dt / a.duration, 1);
    const e = a.t * a.t * (3 - 2 * a.t); // smoothstep easing
    a.card.position.lerpVectors(a.fromPos, a.toPos, e);
    a.card.position.z += Math.sin(Math.PI * e) * a.arc; // lift along z (z-up world)
    a.card.rotation.x = a.fromRot + (a.toRot - a.fromRot) * e;
    if (a.t === 1) {
      animations.splice(i, 1);
      a.resolve();
    }
  }
}
