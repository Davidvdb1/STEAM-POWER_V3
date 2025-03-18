//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPINCONTROLLERFORM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/microbit/microbitPinControllerForm/style.css';
    </style>
    <form>
        <p>Pin <span id="pinNumber"></span>:</p>
        <label for="pinSelect">Bron:</label>
        <select id="typeSelectPin">
            <option value="none">Geen</option>
            <option value="SOLAR">Zon</option>
            <option value="WIND">Wind</option>
            <option value="WATER">Water</option>
        </select>
        <button type="button" id="activateButton">Activate</button>
        <button type="button" id="removeButton">Remove</button>
    </form>
`;
//#endregion MICROBITPINCONTROLLERFORM

//#region CLASS
window.customElements.define('microbitpincontrollerform-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['pin', 'type', 'active'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'pin') {
            this._shadowRoot.getElementById('pinNumber').textContent = newValue;
        }
        if (name === 'type') {
            this._shadowRoot.getElementById('typeSelectPin').value = newValue;
        }
        if (name === 'active') {
            const activateButton = this._shadowRoot.getElementById('activateButton');
            activateButton.textContent = newValue === 'true' ? 'Deactivate' : 'Activate';
        }
    }

    connectedCallback() {
        this._shadowRoot.getElementById('typeSelectPin').addEventListener('change', () => this.setPin());
        this._shadowRoot.getElementById('activateButton').addEventListener('click', () => this.toggleActive());
        this._shadowRoot.getElementById('removeButton').addEventListener('click', () => this.removePin());
    }

    setPin() {
        const type = this._shadowRoot.getElementById('typeSelectPin').value;
        const pin = this.getAttribute('pin');
        const isActive = this.getAttribute('active') === 'true';
        const data = { pin: pin, configuration: { io: 'input', ad: 'analog', type: type, active: isActive } };

        const customEvent = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
    }

    toggleActive() {
        const isActive = this.getAttribute('active') === 'true';
        this.setAttribute('active', !isActive);

        this.setPin();
    }

    removePin() {
        const pin = this.getAttribute('pin');
        const data = { pin: pin, remove: true };
        const customEvent = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);

        this.remove();
    }
});
//#endregion CLASS