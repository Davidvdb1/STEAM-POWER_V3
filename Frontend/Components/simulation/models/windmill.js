/* === Nieuw: optimale offset ===================================== */
const OPT_OFFSET = 15;   // ° vóór de ware windrichting
/* ================================================================ */

import { geocodeAddress } from '../utils/geocode.js';
import { fetchWindDirection } from '../utils/weatherData.js';
export async function loadWindmill(scene, component, bladeCount = 3, modelVersion = 1) {
    let fileName;
    if (modelVersion === 1) {
        fileName = `turbine_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;
    } else {
        fileName = `turbine_v${modelVersion}_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;
    }

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

export async function updateWindmillBlades(scene, component, bladeCount) {
    const currentRotY = component.windmill ? component.windmill.rotation.y : null;

    component.bladeCount = bladeCount;
    const modelVersion = component.modelVersion || 1;
    await loadWindmill(scene, component, bladeCount, modelVersion);

    if (currentRotY !== null && component.windmill) {
        component.windmill.rotation.y = currentRotY;
        component.initialWindmillDirection = BABYLON.Angle.FromRadians(currentRotY).degrees();
    }
}

export async function updateWindmillModel(scene, component, model) {
    component.modelVersion = model;
    await loadWindmill(scene, component, component.bladeCount || 3, model);
}

export async function updateWindmillRotation(scene, component, manualDegrees) {
    if (!component.windmill || component.initialWindmillDirection === undefined) return;
    const totalDegrees = (component.initialWindmillDirection + manualDegrees) % 360;
    const radians = BABYLON.Angle.FromDegrees(totalDegrees).radians();
    component.windmill.rotation.y = radians;
}

export async function updateAutoRotateChange(scene, component, enabled, street = "Geldenaaksebaan 335", city = "Leuven", postal = "3001") {
    if (!component.windmill || !enabled) return;
    try {
        const { lat, lon } = await geocodeAddress(street, city, postal);
        const deg = await fetchWindDirection(lat, lon);
        const facingDeg = (deg - 90) % 360;
        const targetDeg  = (facingDeg + OPT_OFFSET) % 360;     // ✱ offset toepassen

        component.initialWindmillDirection = targetDeg;
        animateRotationY(component.windmill, BABYLON.Angle.FromDegrees(facingDeg).radians());
    } catch (err) {
        console.error("Auto-rotatie windmolen mislukt:", err);
    }
}

function animateRotationY(mesh, targetRadians, frameRate = 30, totalFrames = 15) {
    const animation = new BABYLON.Animation("rotationYAnimation", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: mesh.rotation.y },
        { frame: totalFrames, value: targetRadians }
    ];
    animation.setKeys(keys);
    mesh.animations = [];
    mesh.animations.push(animation);
    mesh.getScene().beginAnimation(mesh, 0, totalFrames, false);
}

/* Optioneel fetchWindDirection als fallback (zonder geocode)
async function fetchWindDirection() {
    try {
        const lat = 50.8798;
        const lon = 4.7005;
        const response = await fetch(`http://localhost:3000/weather/windrichting?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Failed to fetch wind direction');
        const data = await response.json();
        return data.wind_direction_deg;
    } catch (error) {
        console.error("Error fetching wind direction:", error);
        return 0;
    }
}*/


