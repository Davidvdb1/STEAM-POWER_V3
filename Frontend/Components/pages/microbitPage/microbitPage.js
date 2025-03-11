//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPAGE
const IOPINSERVICE_SERVICE_UUID = "e95d127b-251d-470a-a062-fa1922dfa9a8";
const PINDATA_CHARACTERISTIC_UUID = "e95d8d00-251d-470a-a062-fa1922dfa9a8";
const PINADCONFIGURATION_CHARACTERISTIC_UUID = "e95d5899-251d-470a-a062-fa1922dfa9a8";
const PINIOCONFIGURATION_CHARACTERISTIC_UUID = "e95db9fe-251d-470a-a062-fa1922dfa9a8";

let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/microbitPage/style.css';
    </style>
    <p>Microbit Page</p>
    <p>Pin 0 Value: <span id="pin0Value">0</span></p>
    <button id="startButton">Start Bluetooth Connection</button>
    <button id="pauseButton">Pause Bluetooth Connection</button>
    <button id="endButton">End Bluetooth Connection</button>
    <label for="intervalSelect">Select Interval:</label>
    <select id="intervalSelect">
        <option value="none"></option>
        <option value="500">0.5 seconde</option>
        <option value="1000">1 seconde</option>
        <option value="2000">2 seconden</option>
        <option value="5000">5 seconden</option>
        <option value="10000">10 seconden</option>
        <option value="30000">30 seconden</option>
        <option value="60000">1 minuut</option>
        <option value="120000">2 minuten</option>
        <option value="300000">5 minuten</option>
        <option value="600000">10 minuten</option>
    </select>
`;
//#endregion MICROBITPAGE

//#region CLASS
window.customElements.define('microbitpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this._shadowRoot.getElementById('startButton').addEventListener('click', () => this.startBluetoothConnection());
        this._shadowRoot.getElementById('pauseButton').addEventListener('click', () => this.pauseBluetoothConnection());
        this._shadowRoot.getElementById('endButton').addEventListener('click', () => this.endBluetoothConnection());
        this._shadowRoot.getElementById('intervalSelect').addEventListener('change', (event) => this.setBluetoothDataInterval(event));

        document.addEventListener('pin0valuechanged', this.updatePin0Value.bind(this));
    }

    startBluetoothConnection() {
        const event = new CustomEvent('startbluetoothconnection', { bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    pauseBluetoothConnection() {
        const event = new CustomEvent('pausebluetoothconnection', { bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    endBluetoothConnection() {
        const event = new CustomEvent('stopbluetoothconnection', { bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    updatePin0Value(event) {
        const pin0Value = event.detail;
        this._shadowRoot.getElementById('pin0Value').textContent = pin0Value;
    }

    setBluetoothDataInterval(event) {
        if (event.target.value === 'none') return;
        const interval = parseInt(event.target.value, 10);
        const customEvent = new CustomEvent('setbluetoothdatainterval', { detail: interval, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
    }
});
//#endregion CLASS