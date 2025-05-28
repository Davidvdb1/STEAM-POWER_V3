import { createLine } from '../utils/uiElements.js';

/**
 * Creates the location settings UI section
 * @param {BABYLON.GUI.StackPanel} layout - The parent layout panel
 */
export function createLocationSettings(layout) {
    // location title
    const locationTitle = new BABYLON.GUI.TextBlock();
    locationTitle.text = "Locatie";
    locationTitle.fontSize = 25;
    locationTitle.color = "white";
    locationTitle.height = "50px";
    layout.addControl(locationTitle);
    
    // separator line
    layout.addControl(createLine());

    // location text
    const locationText = new BABYLON.GUI.TextBlock();
    locationText.text = "Verander de huidige locatie.";
    locationText.fontSize = 20;
    locationText.color = "white";
    locationText.width = "90%";
    locationText.height = "50px";
    locationText.paddingTop = "10px";
    layout.addControl(locationText);

    // street
    const street = new BABYLON.GUI.InputText();
    street.width = "90%";
    street.height = "50px";
    street.placeholderText = "Straat...";
    street.background = "white";
    street.color = "black";
    street.focusedBackground = "white";
    street.paddingTop = "10px";
    layout.addControl(street);
    
    // city
    const city = new BABYLON.GUI.InputText();
    city.width = "90%";
    city.height = "50px";
    city.placeholderText = "Stad...";
    city.background = "white";
    city.color = "black";
    city.focusedBackground = "white";
    city.paddingTop = "10px";
    layout.addControl(city);

    // postal code
    const code = new BABYLON.GUI.InputText();
    code.width = "90%";
    code.height = "50px";
    code.placeholderText = "Postcode...";
    code.background = "white";
    code.color = "black";
    code.focusedBackground = "white";
    code.paddingTop = "10px";
    layout.addControl(code);

    // "Change" button
    const changeButton = BABYLON.GUI.Button.CreateSimpleButton("changeBtn", "Wijzig");
    changeButton.width = "90%";
    changeButton.height = "70px";
    changeButton.color = "black";             
    changeButton.background = "white"; 
    changeButton.paddingTop = "10px";
    changeButton.paddingBottom = "20px";      
    layout.addControl(changeButton);

    layout.addControl(createLine());
}
