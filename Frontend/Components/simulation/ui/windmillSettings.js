import { createLine } from '../utils/uiElements.js';

/**
 * Creates the windmill settings UI section
 * @param {BABYLON.GUI.StackPanel} layout - The parent layout panel
 * @param {Function} onBladeCountChange - Callback for when blade count changes
 */
export function createWindmillSettings(layout, onBladeCountChange) {
    // wind title
    const windTitle = new BABYLON.GUI.TextBlock();
    windTitle.text = "Windturbine";
    windTitle.fontSize = 25;
    windTitle.color = "white";
    windTitle.height = "50px";
    layout.addControl(windTitle);

    layout.addControl(createLine());

    const windText = new BABYLON.GUI.TextBlock();
    windText.text = "Pas het aantal wieken aan.";
    windText.fontSize = 20;
    windText.color = "white";
    windText.width = "90%";
    windText.height = "50px";
    layout.addControl(windText);

    // Slider for blade count
    const bladeSlider = new BABYLON.GUI.Slider();
    bladeSlider.minimum = 0;
    bladeSlider.maximum = 5;
    bladeSlider.step = 1;
    bladeSlider.value = 3;
    bladeSlider.height = "20px";
    bladeSlider.width = "90%";
    bladeSlider.color = "white";
    bladeSlider.background = "gray";
    bladeSlider.thumbColor = "rgba(30, 30, 30, 1.0)";
    bladeSlider.borderColor = "rgba(30, 30, 30, 1.0)";
    layout.addControl(bladeSlider);

    bladeSlider.onValueChangedObservable.add((value) => {
        if (onBladeCountChange) {
            onBladeCountChange(value);
        }
    });

    // Grid for tick labels
    const tickGrid = new BABYLON.GUI.Grid();
    tickGrid.width = "100%";
    tickGrid.height = "50px";
    tickGrid.paddingTop = "10px";
    tickGrid.paddingBottom = "20px";

    // Create 6 columns (for 0 to 5)
    for (let i = 0; i <= 5; i++) {
        tickGrid.addColumnDefinition(1 / 6); // Each column is 1/6th of the width
    }

    // Add labels to the grid
    for (let i = 0; i <= 5; i++) {
        const tick = new BABYLON.GUI.TextBlock();
        tick.text = i.toString();
        tick.color = "white";
        tick.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        tickGrid.addControl(tick, 0, i); // row 0, column i
    }
    layout.addControl(tickGrid);

    // line
    layout.addControl(createLine());
}
