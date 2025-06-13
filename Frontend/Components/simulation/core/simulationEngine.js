/**
 * Creates and configures a BabylonJS engine
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @returns {BABYLON.Engine} - The configured BabylonJS engine
 */
export function createEngine(canvas) {
    return new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        adaptToDeviceRatio: true
    });
}

/**
 * Starts the render loop for the scene
 * @param {BABYLON.Engine} engine - The BabylonJS engine
 * @param {BABYLON.Scene} scene - The BabylonJS scene to render
 */
export function startRenderLoop(engine, scene) {
    if (engine && scene) {
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
