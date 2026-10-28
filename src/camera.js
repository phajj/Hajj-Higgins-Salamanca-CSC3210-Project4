import * as THREE from "three";

/**
 * Creates the scene's perspective camera, looking at origin
 * (copied and modified from Project 2)
 * @param {number} aspect: viewport aspect ratio (width / height)
 * @returns {THREE.PerspectiveCamera}
 *
 * @author Peter Hajj
 */

export function perspectiveCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 500);
  camera.position.set(35, -45, 15);
  camera.up.set(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, -10));
  return camera;
}
