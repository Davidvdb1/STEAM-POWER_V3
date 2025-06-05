import { createLine } from '../utils/uiElements.js';

/**
 * Creates the windmill settings UI section
 * @param {BABYLON.GUI.StackPanel} page1 - The parent page1 panel
 * @param {Function} onBladeCountChange - Callback for when blade count changes
 */
export function createWindmillSettings(page1, onBladeCountChange, onManualRotationChange, onAutoRotateChange) {
    // wind title
    const windTitle = new BABYLON.GUI.TextBlock();
    windTitle.text = "Windturbine";
    windTitle.fontSize = 22;
    windTitle.color = "white";
    windTitle.height = "50px";
    page1.addControl(windTitle);

    page1.addControl(createLine());

    const windText = new BABYLON.GUI.TextBlock();
    windText.text = "Pas het aantal wieken aan.";
    windText.fontSize = 18;
    windText.color = "white";
    windText.width = "90%";
    windText.height = "60px";
    page1.addControl(windText);

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
    bladeSlider.thumbColor = "white";
    bladeSlider.borderColor = "white";
    page1.addControl(bladeSlider);

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
    page1.addControl(tickGrid);

    // line
    page1.addControl(createLine());

    // Create the text block
    const rotate = new BABYLON.GUI.TextBlock();
    rotate.text = "Manueel draaien.";
    rotate.fontSize = 18;
    rotate.color = "white";
    rotate.width = "90%";
    rotate.height = "60px";
    page1.addControl(rotate);

    // Create the slider
    const slider = new BABYLON.GUI.Slider();
    slider.minimum = 0;
    slider.maximum = 360;
    slider.value = 0;
    slider.height = "20px";
    slider.width = "90%";
    slider.color = "white";
    slider.background = "gray";
    slider.thumbColor = "white";
    page1.addControl(slider);

    // Create the text block for the slider value
    const sliderValueText = new BABYLON.GUI.TextBlock();
    sliderValueText.text = "0°";
    sliderValueText.fontSize = 18;
    sliderValueText.color = "white";
    sliderValueText.height = "50px";
    sliderValueText.width = "90%";
    sliderValueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    sliderValueText.paddingBottom = "10px"
    page1.addControl(sliderValueText);

    slider.onValueChangedObservable.add((value) => {
        sliderValueText.text = `${Math.round(value)}°`;
        if (autoRotate) {
            autoRotate = false;
            toggleButton.textBlock.text = "Uit";
            onAutoRotateChange(false);
        }
        if (onManualRotationChange) {
            onManualRotationChange(value);
        }
    });

    page1.addControl(createLine());

    const rotateb = new BABYLON.GUI.TextBlock();
    rotateb.text = "Volg automatisch de wind.";
    rotateb.fontSize = 18;
    rotateb.color = "white";
    rotateb.width = "90%";
    rotateb.height = "60px";
    page1.addControl(rotateb);

    const toggleButton = BABYLON.GUI.Button.CreateSimpleButton("toggleBtn", "Aan");
    toggleButton.width = "90%";
    toggleButton.height = "40px";
    toggleButton.color = "black";
    toggleButton.background = "white"
    page1.addControl(toggleButton);

    let autoRotate = true;

    toggleButton.onPointerUpObservable.add(() => {
        autoRotate = !autoRotate;
        toggleButton.textBlock.text = autoRotate ? "Aan" : "Uit";

        if (autoRotate) {
            onAutoRotateChange(true);
        } else {
            onAutoRotateChange(false);
        }
    });
}
