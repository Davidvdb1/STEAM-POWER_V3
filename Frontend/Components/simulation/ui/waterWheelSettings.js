import { createLine } from '../utils/uiElements.js';

export function createWaterWheelSettings(page2, positionCB, depthCB) {
    const waterTitle = new BABYLON.GUI.TextBlock();
    waterTitle.text = "Waterrad";
    waterTitle.fontSize = 22;
    waterTitle.color = "white";
    waterTitle.height = "50px";
    page2.addControl(waterTitle);

    page2.addControl(createLine());

    const waterTitle2 = new BABYLON.GUI.TextBlock();
    waterTitle2.text = "Verander de positie.";
    waterTitle2.fontSize = 18;
    waterTitle2.color = "white";
    waterTitle2.height = "60px";
    page2.addControl(waterTitle2);

    // === Grid setup ===
    const stepperGrid = new BABYLON.GUI.Grid();
    stepperGrid.width = "90%";
    stepperGrid.height = "60px";
    stepperGrid.addColumnDefinition(0.2);
    stepperGrid.addColumnDefinition(0.6);
    stepperGrid.addColumnDefinition(0.2);
    stepperGrid.background = "transparent";
    stepperGrid.paddingBottom = "20px";
    page2.addControl(stepperGrid);

    let currentPosition = 1;
    const minPosition = 1;
    const maxPosition = 3;

    const leftButton = BABYLON.GUI.Button.CreateSimpleButton("leftButton", "←");
    leftButton.width = "100%";
    leftButton.height = "100%";
    leftButton.color = "black";
    leftButton.background = "white";
    stepperGrid.addControl(leftButton, 0, 0);

    const valueBox = new BABYLON.GUI.Rectangle();
    valueBox.width = "100%";
    valueBox.height = "100%";
    valueBox.color = "black";
    valueBox.background = "white";

    const valueText = new BABYLON.GUI.TextBlock();
    valueText.text = `Positie ${currentPosition}`;
    valueText.color = "black";
    valueText.fontSize = 18;
    valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    valueBox.addControl(valueText);
    stepperGrid.addControl(valueBox, 0, 1);

    const rightButton = BABYLON.GUI.Button.CreateSimpleButton("rightButton", "→");
    rightButton.width = "100%";
    rightButton.height = "100%";
    rightButton.color = "black";
    rightButton.background = "white";
    stepperGrid.addControl(rightButton, 0, 2);

    leftButton.onPointerUpObservable.add(() => {
        if (currentPosition > minPosition) {
            currentPosition--;
      valueText.text = `Positie ${currentPosition}`;
      positionCB(currentPosition);

      depthSlider.value = 0;
      depthValueLabel.text = '0.00';
      depthCB(0);

        }
    });

    rightButton.onPointerUpObservable.add(() => {
        if (currentPosition < maxPosition) {
            currentPosition++;
      valueText.text = `Positie ${currentPosition}`;
      positionCB(currentPosition);

      depthSlider.value = 0;
      depthValueLabel.text = '0.00';
      depthCB(0);

        }
    });
    

    page2.addControl(createLine());

    const waterTitle3 = new BABYLON.GUI.TextBlock();
    waterTitle3.text = "Verander de diepte.";
    waterTitle3.fontSize = 18;
    waterTitle3.color = "white";
    waterTitle3.height = "60px";
    page2.addControl(waterTitle3);

    const depthSlider = new BABYLON.GUI.Slider();
    depthSlider.minimum = -0.1;
    depthSlider.maximum = 0.1;
    depthSlider.value = 0; // Middle (default)
    depthSlider.step = 0.005;
    depthSlider.height = "20px";
    depthSlider.width = "90%";
    depthSlider.color = "white";
    depthSlider.background = "gray";
    depthSlider.thumbColor = "white";
    page2.addControl(depthSlider);

    // === Display value below slider ===
    const depthValueLabel = new BABYLON.GUI.TextBlock();
    depthValueLabel.text = `${depthSlider.value.toFixed(2)}`;
    depthValueLabel.fontSize = 18;
    depthValueLabel.color = "white";
    depthValueLabel.height = "60px";
    depthValueLabel.paddingBottom = "10px";
    page2.addControl(depthValueLabel);

    // === Update value label and callback ===
    depthSlider.onValueChangedObservable.add((value) => {
        depthValueLabel.text = `${value.toFixed(2)}`;
        depthCB(value); // Calls updateWaterWheelDepth with positive or negative delta
    });
}
