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
    locationTitle.fontSize = 22;
    locationTitle.color = "white";
    locationTitle.height = "50px";
    layout.addControl(locationTitle);
    
    // line
    layout.addControl(createLine());

    // location text
    const locationText = new BABYLON.GUI.TextBlock();
    locationText.text = "Verander de huidige locatie.";
    locationText.fontSize = 18;
    locationText.color = "white";
    locationText.width = "90%";
    locationText.height = "60px";
    layout.addControl(locationText);

    // street
    const street = new BABYLON.GUI.InputText();
    street.width = "90%";
    street.height = "40px";
    street.placeholderText = "Straat...";
    street.background = "white";
    street.color = "black";
    street.focusedBackground = "white";
    street.text = "Geldenaaksebaan 335";
    street.paddingBottom = "5px"
    layout.addControl(street);
    
    // city
    const city = new BABYLON.GUI.InputText();
    city.width = "90%";
    city.height = "40px";
    city.placeholderText = "Stad...";
    city.background = "white";
    city.color = "black";
    city.focusedBackground = "white";
    city.text = "Leuven";
    city.paddingBottom = "5px"
    layout.addControl(city);

    // postal code
    const postal = new BABYLON.GUI.InputText();
    postal.width = "90%";
    postal.height = "40px";
    postal.placeholderText = "Postcode...";
    postal.background = "white";
    postal.color = "black";
    postal.focusedBackground = "white";
    postal.text = "3001";
    postal.paddingBottom = "5px"
    layout.addControl(postal);

    // "Change" button
    const changeButton = BABYLON.GUI.Button.CreateSimpleButton("changeBtn", "Verplaats");
    changeButton.width = "90%";
    changeButton.height = "55px";
    changeButton.color = "black";             
    changeButton.background = "white"; 
    changeButton.paddingBottom = "20px"    
    layout.addControl(changeButton);

    changeButton.onPointerUpObservable.add(() => {
        if (onLocationChange) {
            onLocationChange(street.text, city.text, postal.text);
        }
    });

    layout.addControl(createLine());
}
