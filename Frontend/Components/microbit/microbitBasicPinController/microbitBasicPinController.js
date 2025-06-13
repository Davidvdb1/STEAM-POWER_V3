//#region IMPORTS
import '../microbitBasicPinController/microbitBasicPinController.js';
//#endregion IMPORTS

//#region MICROBITBASICPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/microbit/microbitBasicPinController/style.css';
    </style>
    <div id="pinFormsContainer">
        <!-- Forms will be dynamically generated here -->
    </div>
`;
//#endregion MICROBITBASICPINCONTROLLER

//#region CLASS
window.customElements.define('microbitbasicpincontroller-れ', class extends HTMLElement {
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
        this.adaptPinConfiguration();
        this.render();
    }

    adaptPinConfiguration() {
        for (let i = 0; i <= 18; i++) {
            if (i < 3) {
                const type = this.pinConfiguration[i]?.type || ['SOLAR', 'WIND', 'WATER'][i];
                const pinConfig = { type, active: true, io: 'input', ad: 'analog' };
                const customEvent = new CustomEvent('setpinconfiguration', { detail: { pin: i, configuration: pinConfig }, bubbles: true, composed: true });
                document.dispatchEvent(customEvent);
            } else if (this.pinConfiguration[i]) {
                const pinconfig = { ...this.pinConfiguration[i], active: false };
                const customEvent = new CustomEvent('setpinconfiguration', { detail: { pin: i, configuration: pinconfig }, bubbles: true, composed: true });
                document.dispatchEvent(customEvent);
            }
        }
    }

    async render() {
        this.delay(200).then(() => {
            this.pinConfiguration = JSON.parse(sessionStorage.getItem('pinConfiguration')) || {};
            this.renderPinController();
        });
    }

    async renderPinController() {
        const container = this._shadowRoot.getElementById('pinFormsContainer');
        container.innerHTML = ''; // Clear existing forms
        [0, 1, 2].forEach((pin) => {
            const configuration = this.pinConfiguration[pin];
            const formElement = document.createElement('div');
            formElement.innerHTML = `
                <p>Pin ${pin}</p>
                <select id="typeSelectPin${pin}">
                    <option value="SOLAR" ${configuration.type === 'SOLAR' ? 'selected' : ''}>Zon</option>
                    <option value="WIND" ${configuration.type === 'WIND' ? 'selected' : ''}>Wind</option>
                    <option value="WATER" ${configuration.type === 'WATER' ? 'selected' : ''}>Water</option>
                </select>
            `; // TODO: make this a component
            container.appendChild(formElement);

            this._shadowRoot.getElementById(`typeSelectPin${pin}`).addEventListener('change', (event) => this.setPin(pin, event.target.value));
        });
    }

    setPin(pin, type) {
        const data = { pin: pin, configuration: { io: 'input', ad: 'analog', type: type, active: true } };
        const customEvent = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
        this.render();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
//#endregion CLASS