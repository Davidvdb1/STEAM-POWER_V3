import { createLocationSettings } from './locationSettings.js';
import { createWindmillSettings } from './windmillSettings.js';
import { createLine } from '../utils/uiElements.js';
import { getSunPosition } from '../utils/sunCalculator.js';
import { sunPositionToCartesian } from '../utils/sunCalculator.js';

/**
 * Creates the main settings panel UI
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {Function} onBladeCountChange - Callback for when blade count changes
 * @param {Function} onLocationChange - Callback for when location changes
 * @returns {BABYLON.GUI.AdvancedDynamicTexture} The GUI texture
 */
export function createSettingsPanel(onBladeCountChange, onLocationChange, onManualRotationChange) {
    // creates a full-screen 2D GUI layer over the whole 3D scene
    const GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // settings container
    const settingsPanel = new BABYLON.GUI.Rectangle();
    settingsPanel.background = "rgba(0, 0, 0, 0.5)";
    settingsPanel.width = "400px";
    settingsPanel.height = "800px";
    settingsPanel.color = "gray";
    settingsPanel.cornerRadius = "10";
    settingsPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    settingsPanel.paddingRight = "50px";
    GUI.addControl(settingsPanel);

    // layout container
    const layout = new BABYLON.GUI.StackPanel();
    layout.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    settingsPanel.addControl(layout);
    
    // separator line

    const spacer = new BABYLON.GUI.TextBlock();
    spacer.height = "20px"; // Adjust the height as needed
    spacer.text = "";
    layout.addControl(spacer);
    layout.addControl(createLine());

    // Add location settings section with new callback
    createLocationSettings(layout, onLocationChange);
    
    // Add windmill settings section
    createWindmillSettings(layout, onBladeCountChange, onManualRotationChange)

    return GUI;
}
