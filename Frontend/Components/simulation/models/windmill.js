/**
 * Loads and positions the windmill model
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {SimulationComponent} component - The parent component for storing references
 * @param {number} bladeCount - Number of blades (0-5)
 */
export async function loadWindmill(scene, component, bladeCount = 3) {
    const fileName = `turbine_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;

    // Dispose previous windmill if exists
    if (component.windmill) {
        component.windmill.dispose();
        component.windmill = null;
    }

    return new Promise((resolve) => {
        BABYLON.SceneLoader.ImportMesh("", "", `../Frontend/Assets/GLBs/${fileName}`, scene, async (meshes) => {
            component.windmill = meshes.find(m => m.name === "__root__");
            if (component.windmill) {
                component.windmill.scaling = new BABYLON.Vector3(5, 5, 5);
                component.windmill.position = new BABYLON.Vector3(-1.1, -0.1, 0.5);

                try {
                    const degrees = await fetchWindDirection();
                    const initialDegrees = (degrees + 180) % 360;
                    component.initialWindmillDirection = initialDegrees;
                    const radians = BABYLON.Angle.FromDegrees(degrees + 180).radians();
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
    await loadWindmill(scene, component, bladeCount);
}

export async function updateWindmillRotation(scene, component, manualDegrees) {
    if (!component.windmill || component.initialWindmillDirection === undefined) return;

    // Calculate total rotation degrees
    const totalDegrees = (component.initialWindmillDirection + manualDegrees) % 360;

    // Convert to radians for Babylon
    const radians = BABYLON.Angle.FromDegrees(totalDegrees).radians();

    // Update the windmill rotation
    component.windmill.rotation.y = radians;
}

export async function updateAutoRotateChange(scene, component, enabled) {
    if (!component.windmill) return;

    if (enabled) {
        try {
            const degrees = await fetchWindDirection();
            const adjustedDegrees = (degrees + 180) % 360;

            component.initialWindmillDirection = adjustedDegrees;

            const radians = BABYLON.Angle.FromDegrees(adjustedDegrees).radians();

            // Reset windmill rotation to API direction
            component.windmill.rotation.y = radians;

            if (component.rotationSlider) {
                component.rotationSlider.value = 0;
            }
        } catch (error) {
            console.error("Error fetching wind direction:", error);
        }
    }
    // If disabled, nothing to do here (manual mode)
}

/**
 * Fetches current wind direction from the server
 * @returns {Promise<number>} Wind direction in degrees
 */
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
}
