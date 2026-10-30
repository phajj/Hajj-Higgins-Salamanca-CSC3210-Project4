import * as THREE from "three";

// Preset camera angles: position, up vector and the point the camera looks at
export const CAMERA_VIEWS = {
  topDown: { position: [0, 0, 32], up: [0, 1, 0], target: [0, 0, 0] },
  angled: { position: [15, -30, 15], up: [0, 0, 1], target: [0, 0, -10] },
  side: { position: [0, -45, 8], up: [0, 0, 1], target: [0, 0, 2] },
};

/**
 * Moves the camera to one of the preset views in CAMERA_VIEWS
 * @param {THREE.PerspectiveCamera} camera
 * @param {string} view: key of CAMERA_VIEWS
 *
 * @author Peter Hajj
 */
export function setCameraView(camera, view) {
  const { position, up, target } = CAMERA_VIEWS[view];
  camera.position.set(...position);
  camera.up.set(...up);
  camera.lookAt(...target);
}

/**
 * Creates the scene's perspective camera, starting in the top down view
 * (copied and modified from Project 2)
 * @param {number} aspect: viewport aspect ratio (width / height)
 * @returns {THREE.PerspectiveCamera}
 *
 * @author Peter Hajj
 */

export function perspectiveCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 500);
  setCameraView(camera, "topDown");
  return camera;
}
