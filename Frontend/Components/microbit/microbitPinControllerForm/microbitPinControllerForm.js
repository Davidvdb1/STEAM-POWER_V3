//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPINCONTROLLERFORM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/microbit/microbitPinControllerForm/style.css';
    </style>
    <form>
        <p>Pin <span id="pinNumber"></span></p>
        <select id="typeSelectPin">
            <option value="SOLAR">Zon</option>
            <option value="WIND">Wind</option>
            <option value="WATER">Water</option>
        </select>
        <div id="buttonContainer">
            <button type="button" id="activateButton">Aan</button>
            <button type="button" id="removeButton">Verwijder</button>
        </div>
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
            this._shadowRoot.querySelector('form').setAttribute('data-type', newValue);
        }
        if (name === 'active') {
            const activateButton = this._shadowRoot.getElementById('activateButton');
            activateButton.textContent = newValue === 'true' ? 'Uit' : 'Aan';
            const form = this._shadowRoot.querySelector('form');
            form.setAttribute('data-active', newValue);
            if (newValue === 'true') {
                activateButton.classList.add('deactivate');
            } else {
                activateButton.classList.remove('deactivate');
            }
        }
    }

    connectedCallback() {
        this._shadowRoot.getElementById('typeSelectPin').addEventListener('change', (event) => this.setPin(event.target.value, this.getAttribute('active')));
        this._shadowRoot.getElementById('activateButton').addEventListener('click', () => this.setPin(this.getAttribute('type'), this.getAttribute('active') === 'true' ? 'false' : 'true'));
        this._shadowRoot.getElementById('removeButton').addEventListener('click', () => this.removePin());
        const form = this._shadowRoot.querySelector('form');
        form.setAttribute('data-type', this.getAttribute('type'));
        form.setAttribute('data-active', this.getAttribute('active'));
    }

    setPin(type = this.getAttribute('type'), active = this.getAttribute('active')) {
        const pin = this.getAttribute('pin');
        const data = { pin: pin, configuration: { io: 'input', ad: 'analog', type: type, active: active } };

        const customEvent = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
        const rerenderEvent = new CustomEvent('rerender', { bubbles: true, composed: true });
        this.dispatchEvent(rerenderEvent);
    }

    removePin() {
        const pin = this.getAttribute('pin');
        const data = { pin: pin, remove: true };
        const customEvent = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
        const rerenderEvent = new CustomEvent('rerender', { bubbles: true, composed: true });
        this.dispatchEvent(rerenderEvent);
    }
});
//#endregion CLASS