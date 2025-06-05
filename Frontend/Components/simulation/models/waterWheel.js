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
            component.wheel.rotation = new BABYLON.Vector3(0, -2.1, 0);
            component.dragBehaviorWheel = new BABYLON.PointerDragBehavior();
            component.dragBehaviorWheel.useObjectOrientationForDragging = false;
            component.dragBehaviorWheel.enabled = false;
            component.wheel.addBehavior(component.dragBehaviorWheel);
        }
    });
}

export async function updateWaterWheelPosition(scene, component, position) {
    if (!component.wheel) return;

    // Define the target positions and rotations for each slot (position 1, 2, 3)
    const positions = [
        new BABYLON.Vector3(1, 0.07, 0.7),
        new BABYLON.Vector3(-0.68, 0.1, -0.5),
        new BABYLON.Vector3(-1.6, 0.3, -1.5)
    ];

    // Rotation angles in radians for each position (Euler angles: x,y,z)
    const rotations = [
        new BABYLON.Vector3(0, -2.1, 0),
        new BABYLON.Vector3(0, -2.4, 0),  // 90 degrees
        new BABYLON.Vector3(0, -2.4, 0)       // 180 degrees
    ];

    const targetPos = positions[position - 1];
    const targetRot = rotations[position - 1];

    // Animate position
    BABYLON.Animation.CreateAndStartAnimation(
        "wheelMove",
        component.wheel,
        "position",
        30,
        15,
        component.wheel.position.clone(),
        targetPos,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Animate rotation
    BABYLON.Animation.CreateAndStartAnimation(
        "wheelRotate",
        component.wheel,
        "rotation",
        30,
        15,
        component.wheel.rotation.clone(),
        targetRot,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
}

