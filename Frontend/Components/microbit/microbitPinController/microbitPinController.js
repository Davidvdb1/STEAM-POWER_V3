//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/microbit/microbitPinController/style.css';
    </style>
    <div>
        <form>
            <p>Pin 0:</p>
            <label for="pinSelect">Bron:</label>
            <select id="typeSelect">
                <option value="none">Geen</option>
                <option value="SOLAR">Zon</option>
                <option value="WIND">Wind</option>
                <option value="WATER">Water</option>
            </select>
            <button id="setPin0Button">Set Pin 0</button>
        </form>
        <form>
            <p>Pin 1:</p>
            <label for="pinSelect">Bron:</label>
            <select id="typeSelect">
                <option value="none">Geen</option>
                <option value="SOLAR">Zon</option>
                <option value="WIND">Wind</option>
                <option value="WATER">Water</option>
            </select>
            <button id="setPin1Button">Set Pin 1</button>
        </form>
        <form>
            <p>Pin 2:</p>
            <label for="pinSelect">Bron:</label>
            <select id="typeSelect">
                <option value="none">Geen</option>
                <option value="SOLAR">Zon</option>
                <option value="WIND">Wind</option>
                <option value="WATER">Water</option>
            </select>
            <button id="setPin2Button">Set Pin 2</button>
        </form>
    </div>
`;
//#endregion MICROBITPINCONTROLLER

//#region CLASS
window.customElements.define('microbitpincontroller-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.pinConfiguration = JSON.parse(sessionStorage.getItem('pinConfiguration'));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this._shadowRoot.getElementById('setPin0Button').addEventListener('click', (event) => this.setPin(event, 0));
        this._shadowRoot.getElementById('setPin1Button').addEventListener('click', (event) => this.setPin(event, 1));
        this._shadowRoot.getElementById('setPin2Button').addEventListener('click', (event) => this.setPin(event, 2));
    }

    async setPin(e, pin) {
        e.preventDefault();
        const form = e.target.closest('form');
        const typeSelect = form.querySelector('#typeSelect');
        const type = typeSelect.options[typeSelect.selectedIndex].value;
        if (type === 'none') {
            const data = {pin: pin, remove: true};
            const event = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
            document.dispatchEvent(event)
        } else {
            const data = {pin: pin, configuration: {io: 'input', ad: 'analog', type: type}};
            const event = new CustomEvent('setpinconfiguration', { detail: data, bubbles: true, composed: true });
            document.dispatchEvent(event);
        }
    }

    

});
//#endregion CLASS