/**
 * Loads the water wheel model
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component
 */
export function loadWaterWheel(scene, component) {
    BABYLON.SceneLoader.ImportMesh("", "", "./Assets/GLBs/wheel.glb", scene, (meshes) => {
        component.wheel = meshes.find(m => m.name === "__root__");

        if (component.wheel) {
            component.wheel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

            // Use the same position and rotation as position 1
            const position1 = new BABYLON.Vector3(1, 0.01, 0.7);
            const rotation1 = new BABYLON.Vector3(0, -2.1, 0);

            component.wheel.position = position1.clone();
            component.wheel.rotation = rotation1.clone();

            // Set the current wheel position to 1 so updateWaterWheelDepth works correctly
            component.currentWheelPosition = 1;

            component.dragBehaviorWheel = new BABYLON.PointerDragBehavior();
            component.dragBehaviorWheel.useObjectOrientationForDragging = false;
            component.dragBehaviorWheel.enabled = false;
            component.wheel.addBehavior(component.dragBehaviorWheel);
        }
    });
}

/**
 * Updates the vertical depth (Y position) of the water wheel
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component
 * @param {number} depth - A value between 0 and 1 indicating how much to lower the wheel
 */
export async function updateWaterWheelDepth(scene, component, delta) {
    if (!component.wheel || !component.currentWheelPosition) return;

    component.currentWheelDepth = delta;

    const baseYPositions = [0.01, 0.06, 0.25];
    const posIndex = component.currentWheelPosition - 1;
    const baseY = baseYPositions[posIndex];

    // Apply delta directly: negative = lower, positive = higher
    component.wheel.position.y = baseY + delta;
}



export async function updateWaterWheelPosition(scene, component, position) {
    component.currentWheelPosition = position;
    component.currentWheelDepth = 0;
    if (!component.wheel) return;

    // Define the target positions and rotations for each slot (position 1, 2, 3)
    const positions = [
        new BABYLON.Vector3(1, 0.01, 0.7),
        new BABYLON.Vector3(-0.68, 0.06, -0.5),
        new BABYLON.Vector3(-1.6, 0.25, -1.5)
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

