import { createLine } from '../utils/uiElements.js';

/**
 * Creates the location settings UI section
 * @param {BABYLON.GUI.StackPanel} layout - The parent layout panel
 * @param {Function} onLocationChange - Callback for when location changes
 */
export function createLocationSettings(layout, onLocationChange) {
    // location title
    const locationTitle = new BABYLON.GUI.TextBlock();
    locationTitle.text = "Locatie";
    locationTitle.fontSize = 25;
    locationTitle.color = "white";
    locationTitle.height = "50px";
    layout.addControl(locationTitle);
    
    // line
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
    street.text = "Geldenaaksebaan 335";
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
    city.text = "Leuven";
    layout.addControl(city);

    // postal code
    const postal = new BABYLON.GUI.InputText();
    postal.width = "90%";
    postal.height = "50px";
    postal.placeholderText = "Postcode...";
    postal.background = "white";
    postal.color = "black";
    postal.focusedBackground = "white";
    postal.paddingTop = "10px";
    postal.text = "3001";
    layout.addControl(postal);

    // "Change" button
    const changeButton = BABYLON.GUI.Button.CreateSimpleButton("changeBtn", "Wijzig");
    changeButton.width = "90%";
    changeButton.height = "70px";
    changeButton.color = "black";             
    changeButton.background = "white"; 
    changeButton.paddingTop = "10px";
    changeButton.paddingBottom = "20px";      
    layout.addControl(changeButton);

    changeButton.onPointerUpObservable.add(() => {
        if (onLocationChange) {
            onLocationChange(street.text, city.text, postal.text);
        }
    });

    layout.addControl(createLine());
}
