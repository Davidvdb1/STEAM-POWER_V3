import { createLine } from '../utils/uiElements.js';

export function createSolarPanelSettings(page2, onManualRotationChangeSolar, onAutoRotateChangeSolar) {
    const spacer = new BABYLON.GUI.TextBlock();
    spacer.height = "20px"; // Adjust the height as needed
    spacer.text = "";
    page2.addControl(spacer);
    page2.addControl(createLine());

    const solarTitle = new BABYLON.GUI.TextBlock();
    solarTitle.text = "Zonnepaneel";
    solarTitle.fontSize = 22;
    solarTitle.color = "white";
    solarTitle.height = "50px";
    page2.addControl(solarTitle);
    
    // line
    page2.addControl(createLine());

    // Create the text block
    const rotate = new BABYLON.GUI.TextBlock();
    rotate.text = "Manueel draaien.";
    rotate.fontSize = 18;
    rotate.color = "white";
    rotate.width = "90%";
    rotate.height = "60px";
    page2.addControl(rotate);

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
    page2.addControl(slider);

    // Create the text block for the slider value
    const sliderValueText = new BABYLON.GUI.TextBlock();
    sliderValueText.text = "0°";
    sliderValueText.fontSize = 18;
    sliderValueText.color = "white";
    sliderValueText.height = "50px";
    sliderValueText.width = "90%";
    sliderValueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    sliderValueText.paddingBottom = "10px"
    page2.addControl(sliderValueText);

    slider.onValueChangedObservable.add((value) => {
        sliderValueText.text = `${Math.round(value)}°`;
        if (autoRotate) {
            autoRotate = false;
            toggleButton.textBlock.text = "Uit";
            onAutoRotateChangeSolar(false);
        }
        if (onManualRotationChangeSolar) {
            onManualRotationChangeSolar(value);
        }
    });

    page2.addControl(createLine());

    const rotateb = new BABYLON.GUI.TextBlock();
    rotateb.text = "Volg automatisch de zon.";
    rotateb.fontSize = 18;
    rotateb.color = "white";
    rotateb.width = "90%";
    rotateb.height = "60px";
    page2.addControl(rotateb);

    const toggleButton = BABYLON.GUI.Button.CreateSimpleButton("toggleBtn", "Aan");
    toggleButton.width = "90%";
    toggleButton.height = "40px";
    toggleButton.color = "black";
    toggleButton.background = "white"
    page2.addControl(toggleButton);

    let autoRotate = true;

    toggleButton.onPointerUpObservable.add(() => {
        autoRotate = !autoRotate;
        toggleButton.textBlock.text = autoRotate ? "Aan" : "Uit";

        if (autoRotate) {
            onAutoRotateChangeSolar(true);
        } else {
            onAutoRotateChangeSolar(false);
        }
    });
}