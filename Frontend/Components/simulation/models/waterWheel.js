/**
 * Loads the water wheel model
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component
 */
export function loadWaterWheel(scene, component) {
    BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/wheel.glb", scene, (meshes) => {
        component.wheel = meshes.find(m => m.name === "__root__");
        if (component.wheel) {
            component.wheel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
            component.wheel.position = new BABYLON.Vector3(1, 0.07, 0.7);
            component.wheel.rotation = new BABYLON.Vector3(0, 1, 0);
            component.dragBehaviorWheel = new BABYLON.PointerDragBehavior();
            component.dragBehaviorWheel.useObjectOrientationForDragging = false;
            component.dragBehaviorWheel.enabled = false;
            component.wheel.addBehavior(component.dragBehaviorWheel);
        }
    });
}
