import { fetchWindDirection }     from '../utils/weatherData.js';
import { geocodeAddress }         from '../utils/geocode.js';
/**
 * Loads and positions the windmill model
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 * @param {number} bladeCount - Number of blades (0-5)
 * 
 */
export async function loadWindmill(scene, component, bladeCount = 3) {
    const fileName = `turbine_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;

    // Dispose previous windmill if exists
    if (component.windmill) {
        component.windmill.dispose();
        component.windmill = null;
    }

    return new Promise((resolve) => {
        BABYLON.SceneLoader.ImportMesh("", "", `./Assets/GLBs/${fileName}`, scene, async (meshes) => {
            component.windmill = meshes.find(m => m.name === "__root__");
            if (component.windmill) {
                component.windmill.scaling = new BABYLON.Vector3(5, 5, 5);
                component.windmill.position = new BABYLON.Vector3(-1.1, -0.1, 0.5);

                try {
                    const degrees = await fetchWindDirection();
                    const initialDegrees = (degrees - 90) % 360;
                    component.initialWindmillDirection = initialDegrees;
                    const radians = BABYLON.Angle.FromDegrees(degrees - 90).radians();
                    component.windmill.rotation = new BABYLON.Vector3(0, radians, 0);
                } catch (error) {
                    console.error("Error setting windmill direction:", error);
            }

                component.dragBehaviorWind = new BABYLON.PointerDragBehavior();
                component.dragBehaviorWind.useObjectOrientationForDragging = false;
                component.dragBehaviorWind.enabled = false;
                component.windmill.addBehavior(component.dragBehaviorWind);
                
                resolve();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Updates the windmill model with a new blade count
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 * @param {number} bladeCount - Number of blades (0-5)
 */
export async function updateWindmillBlades(scene, component, bladeCount) {
// onthoud huidige oriëntatie (radians)
  const currentRotY = component.windmill ? component.windmill.rotation.y : null;

  await loadWindmill(scene, component, bladeCount);

  // herstel oriëntatie
  if (currentRotY !== null && component.windmill) {
    component.windmill.rotation.y = currentRotY;
    // voorkom dat initialWindmillDirection weer overschreven wordt
    component.initialWindmillDirection = BABYLON.Angle.FromRadians(
      currentRotY
    ).degrees();
  }}

export async function updateWindmillRotation(scene, component, manualDegrees) {
    if (!component.windmill || component.initialWindmillDirection === undefined) return;

    // Calculate total rotation degrees
    const totalDegrees = (component.initialWindmillDirection + manualDegrees) % 360;

    // Convert to radians for Babylon
    const radians = BABYLON.Angle.FromDegrees(totalDegrees).radians();

    // Update the windmill rotation
    component.windmill.rotation.y = radians;
}

/**
 * Draait de windmolen ± automatisch naar de actuele windrichting
 * (wind komt *uit* graden X ⇒ molen moet naar X + 90°) kijken).
 *
 * @param {BABYLON.Scene} scene
 * @param {SimulationComponent} component
 * @param {boolean} enabled           – true = auto-mode aan
 * @param {string}  street|city|postal – adres van de gebruiker
 */
export async function updateAutoRotateChange(
        scene, component,
        enabled,
        street = "Geldenaaksebaan 335",
        city   = "Leuven",
        postal = "3001") {

    if (!component.windmill) return;

    if (!enabled) return;          // handmatige modus: niets doen

    try {
        // 1) Adres → coördinaten
        const { lat, lon } = await geocodeAddress(street, city, postal);

        // 2) Coördinaten → windrichting (graden vanwaar de wind komt)
        const deg = await fetchWindDirection(lat, lon);

        // 3) Turbine moet *tegen* de wind in staan ⇒ +180°
        const facingDeg = (deg - 90) % 360;
        component.initialWindmillDirection = facingDeg;

        // 4) Vloeiende animatie naar nieuwe hoek
        animateRotationY(
            component.windmill,
            BABYLON.Angle.FromDegrees(facingDeg).radians()
        );

    } catch (err) {
        console.error("Auto-rotatie windmolen mislukt:", err);
    }
}


/**
 * Animates rotation on the Y-axis from current value to target radians
 * @param {BABYLON.Mesh} mesh 
 * @param {number} targetRadians 
 * @param {number} frameRate - Frames per second
 * @param {number} totalFrames - Duration of animation in frames
 */
function animateRotationY(mesh, targetRadians, frameRate = 30, totalFrames = 15) {
    const animation = new BABYLON.Animation(
        "rotationYAnimation",
        "rotation.y",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [
        { frame: 0, value: mesh.rotation.y },
        { frame: totalFrames, value: targetRadians }
    ];

    animation.setKeys(keys);

    mesh.animations = [];
    mesh.animations.push(animation);

    mesh.getScene().beginAnimation(mesh, 0, totalFrames, false);
}

/**
 * Fetches current wind direction from the server
 * @returns {Promise<number>} Wind direction in degrees
 *
async function fetchWindDirection() {
    try {
        const lat = 50.8798;  // Leuven
        const lon = 4.7005;
        const response = await fetch(`http://localhost:3000/weather/windrichting?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch wind direction');
        }
        
        const data = await response.json();
        return data.wind_direction_deg;
    } catch (error) {
        console.error("Error fetching wind direction:", error);
        return 0; // Default direction
    }
}*/
