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
        document.addEventListener('setbluetoothdatainterval', this.setIntervalTime.bind(this));
    }

    async init() {
        if (!navigator.bluetooth) return; // TODO: Show error message "Bluetooth not supported on this browser"
        
        console.log('Connecting...');
        this.paused = false;
        await this.requestDevice();
        await this.connectToDevice();
        console.log('Configuring device...');
        await this.configurePins();
        console.log('Starting monitoring...');
        await this.startMonitoring();
    }

    async pause() {
        this.paused = !this.paused;
        if (this.paused) {
            console.log('Pausing connection...');
            await this.stopMonitoring();
        } else {
            console.log('Unpausing connection...');
            await this.startMonitoring();
        }
    }

    async disconnect() {
        console.log('Disconnecting...');
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
            optionalServices: [IOPINSERVICE_SERVICE_UUID]
        });
    }

    async connectToDevice() {
        this.server = await this.device.gatt.connect();
        
        this.ioPinService = await this.server.getPrimaryService(IOPINSERVICE_SERVICE_UUID);

        this.pinDataCharacteristic = await this.ioPinService.getCharacteristic(PINDATA_CHARACTERISTIC_UUID);
        this.pinAdConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINADCONFIGURATION_CHARACTERISTIC_UUID);
        this.pinIoConfigurationCharacteristic = await this.ioPinService.getCharacteristic(PINIOCONFIGURATION_CHARACTERISTIC_UUID);
    }

    async startMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            if (!this.paused) {
                await this.readPin0Value();
            }
        }, this.intervalTime || 2000);
    }

    async stopMonitoring() {
        clearInterval(this.monitoringInterval);
    }

    async readPin0Value() { // TODO: Read all pins and make function tos set which pins are read
        const view = await this.pinDataCharacteristic.readValue();
        const value = new DataView(view.buffer).getUint8(1, true);

        // const groupId = localStorage.getItem('groupId');
        const groupId = "20e2ab26-b9e3-4655-af75-d050145fe1a2"
        const time = new Date().toISOString();
        const data = { groupId, value, time };
        
        const event = new CustomEvent('energydatareading', { detail: data, bubbles: true, composed: true });
        document.dispatchEvent(event);

        this.postEnergyData(data);
    }

    async configurePins() {
        try {
            // Configure Pin 0 as Analog (Update the Pin AD Configuration Bitmask)
            const adFlags = new Uint8Array([0x01, 0x00, 0x00, 0x00]); // Set bit 0 and bit 1 for Pin 0 and Pin 1
            await this.pinAdConfigurationCharacteristic.writeValue(adFlags);
            console.log('Configured pin 0 and pin 1 as analog input');

            // Configure Pin 0 as Input (Update the Pin IO Configuration Bitmask)
            const ioFlagsIn = new Uint8Array([0x01, 0x00, 0x00, 0x00]);
            await this.pinIoConfigurationCharacteristic.writeValue(ioFlagsIn);
            console.log('Configured pin 0 and pin 1 as input');
        } catch (error) {
            console.error('Error configuring pins:', error);
        }
    }

    async setIntervalTime(event) {
        this.intervalTime = event.detail;
        console.log('Interval time set to:', this.intervalTime);
        if (this.monitoringInterval) {
            await this.stopMonitoring();
            await this.startMonitoring();
        }
    }

    // service
    async postEnergyData(data = { groupId, value, time }) {
        try {
            const jwt = localStorage.getItem('token');
            response = await fetch(window.env.BACKEND_URL + '/energydata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error(error);
        }
    }
});
//#endregion CLASS