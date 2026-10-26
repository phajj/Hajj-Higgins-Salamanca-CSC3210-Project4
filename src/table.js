import * as THREE from "three";
/**
 * Table object represents a wood textured tabletop with a leg at each corner
 * @author Peter Hajj
 */

const WIDTH = 60;
const HEIGHT = 40;
const THICKNESS = 2;
const LEG_SIZE = 2;
const LEG_LENGTH = 25;

// Wood texture shared by the top and legs (cleaned up by Claude Code)
const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('resources/tableTex.jpg', (tex) => tex.colorSpace = THREE.SRGBColorSpace)
});
const legGeometry = new THREE.BoxGeometry(LEG_SIZE, LEG_SIZE, LEG_LENGTH);

/**
 * Builds the table top with a leg under each of its four corners
 * @returns {THREE.Group} the table top and legs
 */
export function createTable() {
    const table = new THREE.Group();
    table.add(new THREE.Mesh(new THREE.BoxGeometry(WIDTH, HEIGHT, THICKNESS), material));

    // Inset each leg so its outer faces line up with the top's edges (assisted by Claude Code)
    const legX = WIDTH / 2 - LEG_SIZE / 2;
    const legY = HEIGHT / 2 - LEG_SIZE / 2;
    for (const x of [-legX, legX]) {
        for (const y of [-legY, legY]) {
            const leg = new THREE.Mesh(legGeometry, material);
            leg.position.set(x, y, -(THICKNESS + LEG_LENGTH) / 2);
            table.add(leg);
        }
    }
    return table;
}
