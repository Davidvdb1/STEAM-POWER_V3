import { loadSolarPanel, orientSolarPanelTowardsSun } from './solarPanel.js';
import { loadWindmill } from './windmill.js';
import { loadWaterWheel } from './waterWheel.js';
import { getSunPosition, sunPositionToCartesian } from '../utils/sunCalculator.js';
import { updateAutoRotateChange } from './windmill.js';

/**
 * Loads all models needed for the simulation
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 */
export async function loadModels(scene, component) {
    // Load environment
    BABYLON.SceneLoader.Append("", "./Assets/GLBs/environment.glb", scene, function () {});

    // Load House
    BABYLON.SceneLoader.ImportMesh("", "", "./Assets/GLBs/House.glb", scene, (meshes) => {
        const houseRoot = meshes.find(m => m.name === "__root__");
        if (houseRoot) {
            houseRoot.scaling = new BABYLON.Vector3(0.00009, 0.00009, 0.00009);
            houseRoot.position = new BABYLON.Vector3(0.92, 0, -0.225);
            houseRoot.rotation = new BABYLON.Vector3(0, -0.41, 0);
        }
    });

    // Load sun model
    loadSun(scene, component);

    // Load renewable energy models
    loadWindmill(scene, component, 3); // Default 3 blades
    loadWaterWheel(scene, component);
    await loadSolarPanel(scene, component);
}

/**
 * Loads the sun model and positions it based on real-world data
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 */
function loadSun(scene, component) {
    BABYLON.SceneLoader.ImportMesh("", "", "./Assets/GLBs/sun3.glb", scene, async (meshes) => {
        const street = "Geldenaaksebaan 335";
        const city = "Leuven";
        const postal = "3001";
        
        try {
            component.sunRoot = meshes.find(m => m.name === "__root__");
            if (component.sunRoot) {
                const { azimuth, altitude } = await getSunPosition(street, city, postal);
                const position = sunPositionToCartesian(azimuth, altitude, 4);
                
                component.sunRoot.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
                component.sunRoot.position = position;
                component.sunRoot.rotation = new BABYLON.Vector3(0, 0.8, 0);
            }
        } catch (error) {
            console.error("Error positioning sun:", error);
        }
    });
}

/**
 * Updates the sun and solar panel positions based on location
 * @param {SimulationComponent} component - The parent component with references
 * @param {string} street - Street address
 * @param {string} city - City name
 * @param {string} postal - Postal code
 */
export async function updateSunAndSolarPanel(component, street, city, postal) {
    try {
        const { azimuth, altitude } = await getSunPosition(street, city, postal);
        const sunPosition = sunPositionToCartesian(azimuth, altitude, 4);
        
        // Update sun position
        if (component.sunRoot) {
            component.sunRoot.position = sunPosition;
        }
        
        // Update solar panel orientation
        if (component.solarPanel) {
            await orientSolarPanelTowardsSun(component.solarPanel, street, city, postal);
        }
        /* -------------------  WINDMOLEN MEE DRAAIEN  -------------------- */
        if (component.windmill) {
            await updateAutoRotateChange(
                component.scene,
                component,
                true,                // auto-mode aan
                street, city, postal // adres dat net werd ingegeven
            );
        }
    } catch (error) {
        console.error("Failed to update sun and solar panel:", error);
    }
}
