//#region IMPORTS
import '../microbitAdvancedPinControllerForm/microbitAdvancedPinControllerForm.js';
//#endregion IMPORTS

//#region MICROBITADVANCEDPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/microbit/microbitAdvancedPinController/style.css';
    </style>
    <div id="pinAdderContainer">
        <select id="pinSelect">
            <!-- Options will be dynamically generated here -->
        </select>
        <button id="addPinButton">Add Pin</button>
    </div>
    <div id="pinFormsContainer">
        <!-- Forms will be dynamically generated here -->
    </div>
`;
//#endregion MICROBITADVANCEDPINCONTROLLER

//#region CLASS
window.customElements.define('microbitadvancedpincontroller-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.pinConfiguration = JSON.parse(sessionStorage.getItem('pinConfiguration')) || {};
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.renderPinConfiguration();
        this.renderPinOptions();
        this._shadowRoot.getElementById('addPinButton').addEventListener('click', () => this.addPin());
        this.addEventListener('rerender', this.render);
    }

    async render() {
        this.delay(200).then(() => {
            this.pinConfiguration = JSON.parse(sessionStorage.getItem('pinConfiguration')) || {};
            this.renderPinConfiguration();
            this.renderPinOptions();
        });
    }

    async renderPinConfiguration() {
        const container = this._shadowRoot.getElementById('pinFormsContainer');
        container.innerHTML = ''; // Clear existing forms
        for (let i = 0; i <= 18; i++) {
            if (this.pinConfiguration[i]) {
                const configuration = this.pinConfiguration[i];
                const formElement = document.createElement('microbitadvancedpincontrollerform-れ');
                formElement.setAttribute('pin', i);
                formElement.setAttribute('type', configuration.type);
                formElement.setAttribute('active', configuration.active);
                container.appendChild(formElement);
            }
        }
    }

    renderPinOptions() {
        const pinSelect = this._shadowRoot.getElementById('pinSelect');
        pinSelect.innerHTML = ''; // Clear existing options
        for (let i = 0; i <= 18; i++) {
            if (!this.pinConfiguration[i]) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Pin ${i}`;
                pinSelect.appendChild(option);
            }
        }
    }

    addPin() {
        const pinSelect = this._shadowRoot.getElementById('pinSelect');
        const selectedPin = pinSelect.value;
        if (selectedPin !== '') {
            const event = new CustomEvent('setpinconfiguration', { detail: { pin: selectedPin, configuration: { ad: 'analog', io: 'input', type: 'SOLAR', active: false } }, bubbles: true, composed: true });
            document.dispatchEvent(event);
        }
        this.render();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
//#endregion CLASS