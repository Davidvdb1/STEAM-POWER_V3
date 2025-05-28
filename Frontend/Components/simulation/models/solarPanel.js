import SunCalc from '../solar.js';

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
                await orientSolarPanelTowardsSun(component.solarPanel);
                
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
 */
async function orientSolarPanelTowardsSun(solarPanel) {
    try {
        const street = "Geldenaaksebaan 335";
        const city = "Leuven";
        const postal = "3001";
        const date = new Date();

        const { azimuth, altitude } = await SunCalc.getSolarPositionForLocation(street, city, postal, date);
        const x = Math.cos(altitude) * Math.sin(azimuth);
        const y = Math.sin(altitude);
        const z = Math.cos(altitude) * Math.cos(azimuth);
        const target = new BABYLON.Vector3(x * 4, y * 4, z * 4);

        const dir = target.subtract(solarPanel.position).normalize();
        const yaw = Math.atan2(dir.x, dir.z) + 1;
        const pitch = Math.asin(dir.y);

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
