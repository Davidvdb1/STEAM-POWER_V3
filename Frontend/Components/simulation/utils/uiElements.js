import { createSettingsPanel } from '../ui/settingsPanel.js';

/**
 * Creates a 3D text label that always faces the camera
 * @param {string} text - The text to display
 * @param {BABYLON.Vector3} position - The position in 3D space
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @returns {BABYLON.Mesh} The created label plane
 */
export function create3DLabel(text, position, scene) {
    const plane = BABYLON.MeshBuilder.CreatePlane("labelPlane_" + text, { width: 1.5, height: 0.5 }, scene);
    plane.position = position;

    const dynamicTexture = new BABYLON.DynamicTexture("dt_" + text, { width: 512, height: 256 }, scene);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, null, 140, "bold 80px Arial", "black", "transparent", true);

    const material = new BABYLON.StandardMaterial("mat_" + text, scene);
    material.diffuseTexture = dynamicTexture;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.backFaceCulling = false;
    plane.material = material;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    return plane;
}

/**
 * Creates a horizontal separator line for UI
 * @returns {BABYLON.GUI.Rectangle} The line control
 */
export function createLine() {
    const line = new BABYLON.GUI.Rectangle();
    line.thickness = 1;
    line.width = "90%";
    line.color = "white";
    line.height = "1px";
    return line;
}

/**
 * Creates the main settings UI
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {Function} onBladeCountChange - Callback for when blade count changes
 * @returns {BABYLON.GUI.AdvancedDynamicTexture} The GUI texture
 */
export function createSettings(scene, onBladeCountChange) {
    return createSettingsPanel(scene, onBladeCountChange);
}
