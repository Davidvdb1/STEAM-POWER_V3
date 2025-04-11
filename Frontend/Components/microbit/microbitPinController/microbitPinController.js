//#region IMPORTS
import '../microbitAdvancedPinController/microbitAdvancedPinController.js';
import '../microbitBasicPinController/microbitBasicPinController.js';
//#endregion IMPORTS

//#region MICROBITPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/microbit/microbitPinController/style.css';
    </style>
    <button id="toggleViewButton">Switch to Advanced</button>
    <div id="pinControllerContainer">
        
    </div>
`;
//#endregion MICROBITPINCONTROLLER

//#region CLASS
window.customElements.define('microbitpincontroller-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.isAdvancedView = sessionStorage.getItem('isAdvancedView') === 'true';
        this.pinControllerContainer = this._shadowRoot.getElementById('pinControllerContainer');
        this.toggleViewButton = this._shadowRoot.getElementById('toggleViewButton');
    }

    connectedCallback() {
        if (this.isAdvancedView) {
            this.showAdvancedView();
        } else {
            this.showBasicView();
        }
        this._shadowRoot.getElementById('toggleViewButton').addEventListener('click', () => this.toggleView());
    }

    toggleView() {
        this.isAdvancedView = !this.isAdvancedView;
        sessionStorage.setItem('isAdvancedView', this.isAdvancedView); // Store view state in sessionStorage
        if (this.isAdvancedView) {
            this.showAdvancedView();
        } else {
            this.showBasicView();
        }
    }

    showBasicView() {
        this.pinControllerContainer.innerHTML = '';
        const basicPinController = document.createElement('microbitbasicpincontroller-れ');
        this.pinControllerContainer.appendChild(basicPinController);

        this.toggleViewButton.textContent = 'Toon geavanceerde opties';
    }

    showAdvancedView() {
        this.pinControllerContainer.innerHTML = '';
        const advancedPinController = document.createElement('microbitadvancedpincontroller-れ');
        this.pinControllerContainer.appendChild(advancedPinController);

        this.toggleViewButton.textContent = 'Toon basis opties';
    }
});
//#endregion CLASS
