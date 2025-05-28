import { createLocationSettings } from './locationSettings.js';
import { createWindmillSettings } from './windmillSettings.js';
import { createLine } from '../utils/uiElements.js';

/**
 * Creates the main settings panel UI
 * @param {BABYLON.Scene} scene - The BabylonJS scene
 * @param {Function} onBladeCountChange - Callback for when blade count changes
 * @returns {BABYLON.GUI.AdvancedDynamicTexture} The GUI texture
 */
export function createSettingsPanel(scene, onBladeCountChange) {
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

    // settings title
    const title = new BABYLON.GUI.TextBlock();
    title.text = "Instellingen";
    title.fontSize = 30;
    title.color = "white";
    title.height = "80px";
    layout.addControl(title);
    
    // separator line
    layout.addControl(createLine());

    // Add location settings section
    createLocationSettings(layout);
    
    // Add windmill settings section
    createWindmillSettings(layout, onBladeCountChange);

    return GUI;
}
