import { createLocationSettings } from './locationSettings.js';
import { createWindmillSettings } from './windmillSettings.js';
import { createSolarPanelSettings } from './solarPanelSettings.js';
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
export function createSettingsPanel(onBladeCountChange, onLocationChange, onManualRotationChange, onAutoRotateChange, onManualRotationChangeSolar, onAutoRotateChangeSolar) {
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

    // panel to hold both pages
    const pagesContainer = new BABYLON.GUI.StackPanel();
    pagesContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    settingsPanel.addControl(pagesContainer);

    // Page 1
    const page1 = new BABYLON.GUI.StackPanel();
    page1.isVisible = true;
    pagesContainer.addControl(page1);

    // Page 2
    const page2 = new BABYLON.GUI.StackPanel();
    page2.isVisible = false;
    pagesContainer.addControl(page2);

    // NAVIGATION BUTTONS CONTAINER
    const navContainer = new BABYLON.GUI.Rectangle();
    navContainer.height = "50px";
    navContainer.thickness = 0;
    navContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    navContainer.paddingBottom = "10px";
    settingsPanel.addControl(navContainer);

    const navGrid = new BABYLON.GUI.Grid();
    navGrid.addColumnDefinition(0.5);
    navGrid.addColumnDefinition(0.5);
    navContainer.addControl(navGrid);

    // BACK button (left)
    const backBtn = BABYLON.GUI.Button.CreateSimpleButton("backBtn", "←");
    backBtn.width = "70px";
    backBtn.height = "40px";
    backBtn.color = "black";
    backBtn.background = "white";
    backBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    backBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    backBtn.paddingLeft = "20px";
    backBtn.paddingBottom = "10px";
    backBtn.isVisible = false;
    navGrid.addControl(backBtn, 0, 0);

    // NEXT button (right)
    const nextBtn = BABYLON.GUI.Button.CreateSimpleButton("nextBtn", "→");
    nextBtn.width = "70px";
    nextBtn.height = "40px";
    nextBtn.color = "black";
    nextBtn.background = "white";
    nextBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    nextBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    nextBtn.paddingRight = "20px";
    nextBtn.paddingBottom = "10px";
    navGrid.addControl(nextBtn, 0, 1);

    // Button logic
    nextBtn.onPointerUpObservable.add(() => {
        page1.isVisible = false;
        page2.isVisible = true;
        backBtn.isVisible = true;
        nextBtn.isVisible = false;
    });

    backBtn.onPointerUpObservable.add(() => {
        page1.isVisible = true;
        page2.isVisible = false;
        backBtn.isVisible = false;
        nextBtn.isVisible = true;
    });
    
    // separator line

    const spacer = new BABYLON.GUI.TextBlock();
    spacer.height = "20px"; // Adjust the height as needed
    spacer.text = "";
    page1.addControl(spacer);
    page1.addControl(createLine());

    // Add location settings section with new callback
    createLocationSettings(page1, onLocationChange);
    
    // Add windmill settings section
    createWindmillSettings(page1, onBladeCountChange, onManualRotationChange, onAutoRotateChange)

    createSolarPanelSettings(page2, onManualRotationChangeSolar, onAutoRotateChangeSolar)

    return GUI;
}
