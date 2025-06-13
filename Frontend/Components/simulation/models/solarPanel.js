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
        BABYLON.SceneLoader.ImportMesh("", "", "./Assets/GLBs/solar.glb", scene, async (meshes) => {
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
                
                
                
                
                resolve();
            } else {
                resolve();
            }
        });
    });
}

export async function updateSolarRotation(scene, component, manualDegrees) {
    if (!component.solarPanel || component.autoRotateSolar) return;

    // Make sure base rotation is stored
    if (!component.baseSolarRotation) {
        // Store current rotation as base
        component.baseSolarRotation = component.solarPanel.rotation.clone();
    }

    // Convert degrees to radians
    const radians = BABYLON.Angle.FromDegrees(manualDegrees).radians();

    // Apply manual rotation relative to sun-facing base rotation
    component.solarPanel.rotation.y = component.baseSolarRotation.y + radians;

    
    
}

export async function updateAutoRotateChangeSolar(scene, component, enabledSolar) {
    if (!component.solarPanel) return;

    component.autoRotateSolar = enabledSolar;

    if (enabledSolar) {
        const { azimuth, altitude } = await getSunPosition("Geldenaaksebaan 335", "Leuven", "3001");
        const target = sunPositionToCartesian(azimuth, altitude, 4);
        const dir = target.subtract(component.solarPanel.position).normalize();

        const yaw = Math.atan2(dir.x, dir.z) + (Math.PI) / 2;
        const pitch = Math.asin(dir.y);

        // Animate rotation instead of snapping
        animateRotation(component.solarPanel, new BABYLON.Vector3(0,yaw, 0), 30, 20);

        if (component.dragBehaviorSolar) {
            component.dragBehaviorSolar.enabled = false;
        }
    } else {
        if (component.dragBehaviorSolar) {
            component.dragBehaviorSolar.enabled = true;
        }
    }

    
}

/**
 * Animates the rotation of a mesh from current rotation to target rotation
 * @param {BABYLON.Mesh} mesh 
 * @param {BABYLON.Vector3} targetRotation 
 * @param {number} frameRate - Frames per second
 * @param {number} totalFrames - Duration of animation in frames
 */
function animateRotation(mesh, targetRotation, frameRate = 30, totalFrames = 15) {
    // Create animation
    const animation = new BABYLON.Animation(
        "rotationAnimation",
        "rotation",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Animation keys from current to target rotation
    const keys = [
        { frame: 0, value: mesh.rotation.clone() },
        { frame: totalFrames, value: targetRotation }
    ];
    animation.setKeys(keys);

    // Run animation
    mesh.animations = [];
    mesh.animations.push(animation);

    mesh.getScene().beginAnimation(mesh, 0, totalFrames, false);
}

/**
 * Orients the solar panel to face the sun based on current location and time.
 * @param {BABYLON.Mesh} solarPanel - The solar panel mesh
 * @param {string} street - Street address
 * @param {string} city - City name
 * @param {string} postal - Postal code
 * @returns {BABYLON.Vector3} The calculated panel normal direction (world space)
 */
export async function orientSolarPanelTowardsSun(solarPanel, street, city, postal) {
    const { azimuth, altitude } = await getSunPosition(street, city, postal);

    const distance = 4;
    const target = sunPositionToCartesian(azimuth, altitude, distance);
    const dir = target.subtract(solarPanel.position).normalize();
    
    const yaw = Math.atan2(dir.x, dir.z) + (Math.PI) / 2; // Adjust for model orientation

    solarPanel.rotation = new BABYLON.Vector3(0, yaw, 0);
    

    return yaw;
}



export async function calculateSolarPowerOutput(solarPanel, sunRoot) {
    console.log("=== Solar Power Calculation Start ===");

    // Normalize a *copy* of sunRoot's position to avoid modifying it
    const sunDirVec = BABYLON.Vector3.Normalize(sunRoot.position.clone());
    console.log("sunDirVec:", sunDirVec);

    // Panel tilt angle (fixed)
    const tilt = Math.PI / 4; // 45 degrees

    // Adjust for panel model orientation (panel front is rotated by +π/2)
    const panelYaw = solarPanel.rotation.y - Math.PI / 2;

    // Compute panel normal vector (based on yaw and fixed tilt)
    const panelNormal = {
        x: Math.sin(panelYaw) * Math.cos(tilt),
        y: Math.sin(tilt),
        z: Math.cos(panelYaw) * Math.cos(tilt)
    };

    // Convert sunDirVec from Babylon to plain object
    const sunDir = {
        x: sunDirVec.x,
        y: sunDirVec.y,
        z: sunDirVec.z
    };

    // Compute dot product
    const dot = sunDir.x * panelNormal.x + sunDir.y * panelNormal.y + sunDir.z * panelNormal.z;
    const incidenceFactor = Math.max(0, dot); // Clamp to [0, 1]

    // Constants
    const irradiance = 1000; // W/m²
    const area = 1.6; // m²
    const efficiency = 0.2; // 20%

    // Power calculation
    const effectiveIrradiance = irradiance * incidenceFactor;
    const powerOutput = effectiveIrradiance * area * efficiency;

    console.log("Sun Direction Vector:", sunDir);
    console.log("Panel Normal Vector:", panelNormal);
    console.log("Incidence Factor (cos(angle)):", incidenceFactor.toFixed(4));
    console.log("Effective Irradiance (W/m²):", effectiveIrradiance.toFixed(2));
    console.log("Estimated Solar Power Output (W):", powerOutput.toFixed(2));
    console.log("=== Solar Power Calculation End ===\n");

    return powerOutput;
}

    





