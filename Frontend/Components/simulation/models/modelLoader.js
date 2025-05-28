import { loadSolarPanel } from './solarPanel.js';
import { loadWindmill } from './windmill.js';
import { loadWaterWheel } from './waterWheel.js';
import SunCalc from '../solar.js';

/**
 * Loads all models needed for the simulation
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 */
export async function loadModels(scene, component) {
    // Load environment
    BABYLON.SceneLoader.Append("", "../Frontend/Assets/GLBs/environment.glb", scene, function () {});

    // Load House
    BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/house.glb", scene, (meshes) => {
        const houseRoot = meshes.find(m => m.name === "__root__");
        if (houseRoot) {
            houseRoot.scaling = new BABYLON.Vector3(0.00009, 0.00009, 0.00009);
            houseRoot.position = new BABYLON.Vector3(0.92, 0, -0.225);
            houseRoot.rotation = new BABYLON.Vector3(0, -0.41, 0);
        }
    });

    // Load sun model
    loadSun(scene);

    // Load renewable energy models
    loadWindmill(scene, component, 3); // Default 3 blades
    loadWaterWheel(scene, component);
    await loadSolarPanel(scene, component);
}

/**
 * Loads the sun model and positions it based on real-world data
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 */
function loadSun(scene) {
    BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/sun3.glb", scene, async (meshes) => {
        const street = "Geldenaaksebaan 335";
        const city = "Leuven";
        const postal = "3001";
        const date = new Date();
        
        try {
            const { azimuth, altitude } = await SunCalc.getSolarPositionForLocation(street, city, postal, date);
            const x = Math.cos(altitude) * Math.sin(azimuth);
            const y = Math.sin(altitude);
            const z = Math.cos(altitude) * Math.cos(azimuth);
            
            const sunRoot = meshes.find(m => m.name === "__root__");

            if (sunRoot) {
                const distance = 4;
                sunRoot.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
                sunRoot.position = new BABYLON.Vector3(x * distance, y * distance, z * distance);
                sunRoot.rotation = new BABYLON.Vector3(0, 0.8, 0);
            }
        } catch (error) {
            console.error("Error positioning sun:", error);
        }
    });
}
