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
        this.pinConfiguration = new Map();
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
        if (!navigator.bluetooth) return; // TODO: Show error message "Bluetooth not supported on this browser"
        
        console.log('Searvhing for devices...');
        this.paused = false;
        await this.requestDevice();
        console.log('Connecting to device...');
        await this.connectToDevice();
        console.log('Configuring device...');
        await this.configurePins();
        console.log('Starting monitoring...');
        await this.startMonitoring();
        
        document.addEventListener('setbluetoothdatainterval', this.setIntervalTime.bind(this));
        document.addEventListener('setpinconfiguration', this.setPinConfiguration.bind(this));
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
        this.device = null;
        this.server = null;
        this.ioPinService = null;
        this.pinDataCharacteristic = null;
        this.pinAdConfigurationCharacteristic = null;
        this.pinIoConfigurationCharacteristic = null;
        this.pinConfiguration = Map();
        
        this.device.removeEventListener("gattserverdisconnected", this.connectToDevice);
        this.device.gatt.disconnect();

        await this.stopMonitoring();

        document.removeEventListener('setbluetoothdatainterval', this.setIntervalTime);
        document.removeEventListener('setpinconfiguration', this.setPinConfiguration);
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
                await this.readPinValues();
            }
        }, this.intervalTime || 2000);
    }

    async stopMonitoring() {
        clearInterval(this.monitoringInterval);
    }

    async setIntervalTime(event) {
        this.intervalTime = event.detail;
        console.log('Interval time set to:', this.intervalTime);
        if (this.monitoringInterval) {
            await this.stopMonitoring();
            await this.startMonitoring();
        }
    }

    async setPinConfiguration(event) {
        if (event.detail.remove) {
            this.pinConfiguration.delete(event.detail.pin);
        } else {
            this.pinConfiguration.set(event.detail.pin, event.detail.configuration);
        }
        await this.configurePins();
        sessionStorage.setItem('pinConfiguration', JSON.stringify(Object.fromEntries(this.pinConfiguration)));
    }

    async configurePins() {
        let adFlags = 0b00000000000000000000; // 20 bits for 20 pins
        let ioFlags = 0b00000000000000000000;
        this.pinConfiguration.forEach(async (configuration, pin) => {
            if (configuration.ad == 'analog') {
                adFlags |= 1 << pin;
            }
            if (configuration.io == 'input') {
                ioFlags |= 1 << pin;
            }
        });
        const adFlagsBuffer = new Uint16Array([adFlags]).buffer;
        const ioFlagsBuffer = new Uint16Array([ioFlags]).buffer;
        await this.pinIoConfigurationCharacteristic.writeValue(adFlagsBuffer);
        await this.pinAdConfigurationCharacteristic.writeValue(ioFlagsBuffer);
    }

    async readPinValues() {
        const groupId = JSON.parse(sessionStorage.getItem('loggedInUser')).groupId;

        const view = await this.pinDataCharacteristic.readValue(); // list of 2 byte pairs: [pinNumber, pinValue]
        const pinValues = new Map();
        for (let i = 0; i < view.byteLength; i += 2) {
            const pinNumber = view.getUint8(i);
            const pinValue = view.getUint8(i + 1);
            pinValues.set(pinNumber, {groupId, value: pinValue, type: this.pinConfiguration.get(pinNumber).type, time: new Date().toISOString()});
        }
        
        pinValues.forEach(async (data, pin) => { // TODO: adapt functions to handle map instead of single value
            const response = await this.postEnergyData({...data, pin});
            const body = await response.json();
            const datapoint = body.energyData;
            
            const event = new CustomEvent('energydatareading', { detail: datapoint, bubbles: true, composed: true });
            document.dispatchEvent(event);

        });
    }

    // service
    async postEnergyData(data = { groupId, value, time, type }) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/energydata', {
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