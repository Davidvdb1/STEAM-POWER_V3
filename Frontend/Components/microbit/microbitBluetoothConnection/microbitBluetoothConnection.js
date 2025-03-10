//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITBLUETOOTHCONNECTION
const IOPINSERVICE_SERVICE_UUID = "e95d127b-251d-470a-a062-fa1922dfa9a8";
const PINDATA_CHARACTERISTIC_UUID = "e95d8d00-251d-470a-a062-fa1922dfa9a8";
const PINADCONFIGURATION_CHARACTERISTIC_UUID = "e95d5899-251d-470a-a062-fa1922dfa9a8";
const PINIOCONFIGURATION_CHARACTERISTIC_UUID = "e95db9fe-251d-470a-a062-fa1922dfa9a8";

let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/microbit/microbitBluetoothConnection/style.css';
    </style>
`;
//#endregion MICROBITBLUETOOTHCONNECTION

//#region CLASS
window.customElements.define('microbitbluetoothconnection-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.device = null;
        this.server = null;
        this.ioPinService = null;
        this.pinDataCharacteristic = null;
        this.pinAdConfigurationCharacteristic = null;
        this.pinIoConfigurationCharacteristic = null;
        this.paused = false;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        document.addEventListener('startbluetoothconnection', this.init.bind(this));
        document.addEventListener('pausebluetoothconnection', this.pause.bind(this));
        document.addEventListener('stopbluetoothconnection', this.disconnect.bind(this));
    }

    async init() {
        this.paused = false;
        await this.requestDevice();
        await this.connectToDevice();
        await this.configurePins();
        await this.startMonitoring();
    }

    async pause() {
        this.paused = !this.paused;
        if (this.paused) {
            await this.stopMonitoring();
        } else {
            await this.startMonitoring();
        }
    }

    async disconnect() {
        this.paused = false;
        this.device.removeEventListener("gattserverdisconnected", this.connectToDevice);
        this.device.gatt.disconnect();
        this.services = [];
        this.characteristics = [];
        this.device = null;
        this.server = null;
    }

    async requestDevice() {
        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [IOPINSERVICE_SERVICE_UUID] // Nordic UART Service
        });
    }

    async connectToDevice() {
        this.server = await this.device.gatt.connect();
        
        this.ioPinService = await this.server.getPrimaryService(IOPINSERVICE_SERVICE_UUID); // IO Pin Service

        this.pinDataCharacteristic = await this.ioPinService.getCharacteristic(PINDATA_CHARACTERISTIC_UUID); // Pin Data Characteristic
        this.pinAdConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINADCONFIGURATION_CHARACTERISTIC_UUID); // Pin AD Configuration Characteristic
        this.pinIoConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINIOCONFIGURATION_CHARACTERISTIC_UUID); // Pin IO Configuration Characteristic

        this.pinDataCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        
    }

    async startMonitoring() {
        await this.pinDataCharacteristic.startNotifications();
        this.readPin0Value();
    }

    async stopMonitoring() {
        await this.pinDataCharacteristic.stopNotifications();
    }
    
    handleCharacteristicValueChanged(event) {
        const view = event.target.value;
        const value = new DataView(view.buffer).getUint8(1, true); // Get the analog value from the second byte
        const valueChangedEvent = new CustomEvent('pin0valuechanged', { detail: value, bubbles: true, composed: true });
        document.dispatchEvent(valueChangedEvent);
    }

    async readPin0Value() {
        const view = await this.pinDataCharacteristic.readValue();
        const analogValue = new DataView(view.buffer).getUint8(1, true);
        
        const event = new CustomEvent('pin0valuechanged', { detail: analogValue, bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    async configurePins() {
        try {
            // Configure Pin 0 as Analog (Update the Pin AD Configuration Bitmask)
            const adFlags = new Uint8Array([0x01, 0x00, 0x00, 0x00]); // Set bit 0 for Pin 0
            await this.pinAdConfigurationCharacteristic.writeValue(adFlags);
            console.log('Configured pin 0 as analog input');
    
            // Configure Pin 0 as Input (Update the Pin IO Configuration Bitmask)
            const ioFlagsIn = new Uint8Array([0x01, 0x00, 0x00, 0x00]); // Set bit 0 for Pin 0
            await this.pinIoConfigurationCharacteristic.writeValue(ioFlagsIn);
            console.log('Configured pin 0 as input');
        } catch (error) {
            console.error('Error configuring pin 0:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
//#endregion CLASS