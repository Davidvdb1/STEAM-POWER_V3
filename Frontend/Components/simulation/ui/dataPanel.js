export function createDataPanel() {
    const GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const dataPanel = new BABYLON.GUI.Rectangle();
    dataPanel.background = "rgba(0, 0, 0, 0.5)";
    dataPanel.width = "250px";
    dataPanel.height = "300px";
    dataPanel.color = "white";
    dataPanel.cornerRadius = 10;
    dataPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    dataPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    dataPanel.paddingBottom = "60px";
    dataPanel.paddingLeft = "50px";
    GUI.addControl(dataPanel);

    const stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.width = "100%";
    stackPanel.isVertical = true;
    stackPanel.height = "100%"
    dataPanel.addControl(stackPanel);

    // --- ZONNE-ENERGIE ---
    const solarTitle = new BABYLON.GUI.TextBlock();
    solarTitle.text = "Zonne-energie";
    solarTitle.fontSize = 18;
    solarTitle.color = "white";
    solarTitle.height = "45px";
    solarTitle.paddingBottom = "5px";
    solarTitle.paddingTop = "15px"
    stackPanel.addControl(solarTitle);

    const solarRect = new BABYLON.GUI.Rectangle();
    solarRect.width = "90%";
    solarRect.height = "30px";
    solarRect.cornerRadius = 10;
    solarRect.color = "white";
    solarRect.thickness = 1;
    solarRect.background = "white";
    solarRect.marginBottom = "10px";
    stackPanel.addControl(solarRect);

    const solarValue = new BABYLON.GUI.TextBlock();
    solarValue.text = "0 kW";
    solarValue.color = "black";
    solarValue.fontSize = 16;
    solarRect.addControl(solarValue);

    // --- WATERKRACHT ---
    const waterTitle = new BABYLON.GUI.TextBlock();
    waterTitle.text = "Waterkracht";
    waterTitle.fontSize = 18;
    waterTitle.color = "white";
    waterTitle.height = "40px";
    waterTitle.paddingBottom = "5px";
    waterTitle.paddingTop = "10px"
    stackPanel.addControl(waterTitle);

    const waterRect = new BABYLON.GUI.Rectangle();
    waterRect.width = "90%";
    waterRect.height = "30px";
    waterRect.cornerRadius = 10;
    waterRect.color = "white";
    waterRect.thickness = 1;
    waterRect.background = "white";
    waterRect.marginBottom = "10px";
    stackPanel.addControl(waterRect);

    const waterValue = new BABYLON.GUI.TextBlock();
    waterValue.text = "0 kW";
    waterValue.color = "black";
    waterValue.fontSize = 16;
    waterRect.addControl(waterValue);

    // --- WINDENERGIE ---
    const windTitle = new BABYLON.GUI.TextBlock();
    windTitle.text = "Windenergie";
    windTitle.fontSize = 18;
    windTitle.color = "white";
    windTitle.height = "40px";
    windTitle.paddingBottom = "5px";
    windTitle.paddingTop = "10px"
    stackPanel.addControl(windTitle);

    const windRect = new BABYLON.GUI.Rectangle();
    windRect.width = "90%";
    windRect.height = "30px";
    windRect.cornerRadius = 10;
    windRect.color = "white";
    windRect.thickness = 1;
    windRect.background = "white";
    windRect.marginBottom = "10px";
    stackPanel.addControl(windRect);

    const windValue = new BABYLON.GUI.TextBlock();
    windValue.text = "0 kW";
    windValue.color = "black";
    windValue.fontSize = 16;
    windRect.addControl(windValue);

    return {
        gui: GUI,
        setSolarValue(val) { solarValue.text = `${val} kW`; },
        setWaterValue(val) { waterValue.text = `${val} kW`; },
        setWindValue (val) { windValue .text = `${val} kW`; }
    };
}
