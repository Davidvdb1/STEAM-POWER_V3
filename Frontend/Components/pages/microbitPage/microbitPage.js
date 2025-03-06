//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPAGE
const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

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
    <button id="button">button</button>
`;
//#endregion MICROBITPAGE

//#region CLASS
window.customElements.define('microbitpage-れ', class extends HTMLElement {
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
        this.handleCharacteristicValueChanged = this.handleCharacteristicValueChanged.bind(this);
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.connectToDevice();
        this._shadowRoot.getElementById('button').addEventListener('click', () => this.onButtonPress());
    }

    async configurePin0AsAnalogInput() {
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

    async onButtonPress() {
        try {
            const view = await this.pinDataCharacteristic.readValue();
            console.log(view)
            const analogValue = new DataView(view.buffer).getUint8(1, true);
            console.log('Received data:', analogValue);
        } catch (error) {
            console.error('Error reading pin data:', error);
        }
    }

    async connectToDevice() {
        console.log(0);
        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [
                IOPINSERVICE_SERVICE_UUID, // IO Pin Service
            ]
        });
        console.log(1);
        
        this.server = await this.device.gatt.connect();
        this.delay(2000)
        console.log(2);
        this.ioPinService = await this.server.getPrimaryService(IOPINSERVICE_SERVICE_UUID); // IO Pin Service
        this.pinDataCharacteristic = await this.ioPinService.getCharacteristic(PINDATA_CHARACTERISTIC_UUID); // Pin Data Characteristic
        this.pinAdConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINADCONFIGURATION_CHARACTERISTIC_UUID); // Pin AD Configuration Characteristic
        this.pinIoConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINIOCONFIGURATION_CHARACTERISTIC_UUID); // Pin IO Configuration Characteristic
        console.log(3);

        await this.pinDataCharacteristic.startNotifications();
        this.pinDataCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        console.log(4);
        this.delay(2000);
        this.configurePin0AsAnalogInput();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    handleCharacteristicValueChanged(event) {
        const value = new DataView(event.target.value.buffer).getUint8(1, true);
        console.log('Received analog data:', value);
    }
});//#endregion CLASS