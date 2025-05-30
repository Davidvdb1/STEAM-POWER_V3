import SunCalc from '../solar.js';
import { getSunPosition, sunPositionToCartesian } from '../utils/sunCalculator.js';

/**
 * Loads and positions the solar panel model
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 * @returns {Promise<void>}
 */
export async function loadSolarPanel(scene, component) {
    return new Promise((resolve) => {
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/solar.glb", scene, async (meshes) => {
            component.solarPanel = meshes.find(m => m.name === "__root__");
            if (component.solarPanel) {
                component.solarPanel.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
                component.solarPanel.position = new BABYLON.Vector3(1.12, 0.55, -0.6);
                component.solarPanel.rotation = new BABYLON.Vector3(0, 0, 0);
                component.dragBehaviorSolar = new BABYLON.PointerDragBehavior();
                component.dragBehaviorSolar.useObjectOrientationForDragging = false;
                component.dragBehaviorSolar.enabled = false;
                component.solarPanel.addBehavior(component.dragBehaviorSolar);

                // Position solar panel towards the sun
                await orientSolarPanelTowardsSun(component.solarPanel, "Geldenaaksebaan 335", "Leuven", "3001");
                
                // Calculate power output
                calculateSolarPowerOutput(component.solarPanel);
                
                resolve();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Orients the solar panel to face the sun based on current location and time
 * @param {BABYLON.Mesh} solarPanel - The solar panel mesh
 * @param {string} street - Street address
 * @param {string} city - City name
 * @param {string} postal - Postal code
 */
export async function orientSolarPanelTowardsSun(solarPanel, street, city, postal) {
    try {
        const { azimuth, altitude } = await getSunPosition(street, city, postal);
        
        // Calculate the sun position in 3D space
        const distance = 4;
        const target = sunPositionToCartesian(azimuth, altitude, distance);

        // Calculate the direction from the solar panel to the sun
        const dir = target.subtract(solarPanel.position).normalize();
        
        // Calculate yaw (rotation around y-axis) and pitch (rotation around x-axis)
        const yaw = Math.atan2(dir.x, dir.z) + 1; // +1 is an adjustment for the model orientation
        const pitch = Math.asin(dir.y);

        // Set solar panel rotation
        solarPanel.rotation = new BABYLON.Vector3(pitch, yaw, 0);
    } catch (error) {
        console.error("Error orienting solar panel:", error);
    }
}

/**
 * Calculates the estimated solar power output based on panel orientation and sun position
 * @param {BABYLON.Mesh} solarPanel - The solar panel mesh
 * @returns {number} The estimated power output in watts
 */
function calculateSolarPowerOutput(solarPanel) {
    // Create a normalized vector representing the panel's normal direction
    const panelNormal = new BABYLON.Vector3(0, 0, 1);
    const worldMatrix = solarPanel.getWorldMatrix();
    const worldNormal = BABYLON.Vector3.TransformNormal(panelNormal, worldMatrix).normalize();
    
    // Get sun direction (needs to be calculated or obtained from the scene)
    // For now, using a placeholder
    const sunDirection = new BABYLON.Vector3(0, 1, 0).normalize();
    
    // Calculate angle factor (cosine of angle between panel normal and sun direction)
    const angleFactor = BABYLON.Vector3.Dot(worldNormal, sunDirection);
    
    // Calculate power output
    const irradiance = 1000; // W/m² at peak conditions
    const area = 1.6; // m² panel area
    const efficiency = 0.2; // 20% efficiency
    
    const powerOutput = Math.max(0, irradiance * area * efficiency * angleFactor);
    console.log("Estimated solar power output (W):", powerOutput.toFixed(2));
    
    return powerOutput;
}
