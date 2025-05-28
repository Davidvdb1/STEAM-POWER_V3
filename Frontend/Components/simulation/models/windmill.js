import { fetchWindDirection } from '../utils/weatherData.js';

/**
 * Loads the windmill model with the specified number of blades
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component
 * @param {number} bladeCount - Number of blades (1-5)
 */
export function loadWindmill(scene, component, bladeCount) {
    const fileName = `turbine_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;

    // Dispose previous turbine if exists
    if (component.windmill) {
        component.windmill.dispose();
        component.windmill = null;
    }

    // Load new turbine
    BABYLON.SceneLoader.ImportMesh("", "", `../Frontend/Assets/GLBs/${fileName}`, scene, async (meshes) => {
        component.windmill = meshes.find(m => m.name === "__root__");
        if (component.windmill) {
            component.windmill.scaling = new BABYLON.Vector3(5, 5, 5);
            component.windmill.position = new BABYLON.Vector3(-1.1, -0.1, 0.5);
            component.windmill.rotation = new BABYLON.Vector3(0, -1.1, 0);

            const degrees = await fetchWindDirection();
            const radians = BABYLON.Angle.FromDegrees(degrees + 180).radians();
            component.windmill.rotation = new BABYLON.Vector3(0, radians, 0);

            component.dragBehaviorWind = new BABYLON.PointerDragBehavior();
            component.dragBehaviorWind.useObjectOrientationForDragging = false;
            component.dragBehaviorWind.enabled = false;
            component.windmill.addBehavior(component.dragBehaviorWind);
        }
    });
}
