/**
 * Creates and configures a BabylonJS scene
 * @param {BABYLON.Engine} engine - The BabylonJS engine
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @returns {BABYLON.Scene} The configured scene
 */
export function setupScene(engine, canvas) {
    // Create scene
    const scene = new BABYLON.Scene(engine);
    
    // Set sky color
    scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);

    // Create camera
    const camera = new BABYLON.ArcRotateCamera(
        "Camera", 
        Math.PI / 2, // Alpha (rotation around Y axis)
        Math.PI / 4, // Beta (rotation around X axis)
        10,          // Radius (distance from target)
        new BABYLON.Vector3(0, 0, 0), // Target position
        scene
    );
    
    // Attach camera controls
    camera.attachControl(canvas, true);
    
    // Set camera limits
    camera.upperRadiusLimit = 10;
    camera.lowerRadiusLimit = 3;
    
    // Add main light
    const light = new BABYLON.HemisphericLight(
        "light", 
        new BABYLON.Vector3(1, 1, 0), 
        scene
    );
    
    return scene;
}
