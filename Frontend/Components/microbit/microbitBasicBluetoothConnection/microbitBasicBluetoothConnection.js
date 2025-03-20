//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITBASICBLUETOOTHCONNECTION
const IOPINSERVICE_SERVICE_UUID = "e95d127b-251d-470a-a062-fa1922dfa9a8";
const PINDATA_CHARACTERISTIC_UUID = "e95d8d00-251d-470a-a062-fa1922dfa9a8";
const PINADCONFIGURATION_CHARACTERISTIC_UUID = "e95d5899-251d-470a-a062-fa1922dfa9a8";
const PINIOCONFIGURATION_CHARACTERISTIC_UUID = "e95db9fe-251d-470a-a062-fa1922dfa9a8";

const MONITOR_INTERVAL = 2000;

let template = document.createElement('template');
template.innerHTML = "";
//#endregion MICROBITBASICBLUETOOTHCONNECTION

//#region CLASS
window.customElements.define('microbitbasicbluetoothconnection-れ', class extends HTMLElement {
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
        if (!navigator.bluetooth) return; // TODO: Show error message "Bluetooth not supported on this browser"
        
        console.log('Searching for devices...');
        this.paused = false;
        await this.requestDevice();
        console.log('Connecting to device...');
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
        this.server = null;
        this.ioPinService = null;
        this.pinDataCharacteristic = null;
        this.pinAdConfigurationCharacteristic = null;
        this.pinIoConfigurationCharacteristic = null;
        
        this.device.removeEventListener('gattserverdisconnected', this.disconnect.bind(this));
        this.device.gatt.disconnect();

        this.device = null;

        await this.stopMonitoring();
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
        }, MONITOR_INTERVAL || 2000);
    }

    async stopMonitoring() {
        clearInterval(this.monitoringInterval);
    }

    async configurePins() {
        let adFlags = 0b111;
        let ioFlags = 0b111;
        const adFlagsBuffer = new Uint8Array([Number(adFlags)]).buffer;
        const ioFlagsBuffer = new Uint8Array([Number(ioFlags)]).buffer;
        await this.pinIoConfigurationCharacteristic.writeValue(adFlagsBuffer);
        await this.pinAdConfigurationCharacteristic.writeValue(ioFlagsBuffer);
    }

    async readPinValues() {
        const groupId = JSON.parse(sessionStorage.getItem('loggedInUser'))?.groupId;

        const view = await this.pinDataCharacteristic.readValue(); // list of 2 byte pairs: [pinNumber, pinValue]

        const time = new Date().toISOString();

        const extract10BitValue = (byte) => {
            const highBits = (byte & 0b11000000) >> 6; // Extract the first 2 bits
            const value = (byte << 2) | highBits; // Combine to form a 10-bit number
            return value;
        };

        const pinValues = [];
        pinValues.push({pin: 0, groupId, value: extract10BitValue(view.getUint8(1)), type: 'SOLAR', time});
        pinValues.push({pin: 1, groupId, value: extract10BitValue(view.getUint8(3)), type: 'WIND', time});
        pinValues.push({pin: 2, groupId, value: extract10BitValue(view.getUint8(5)), type: 'WATER', time});
        pinValues.forEach(async (data) => {
            const response = await this.postEnergyData(data);
            const body = await response.json();
            const datapoint = body.energyData;
            
            const event = new CustomEvent('energydatareading', { detail: datapoint, bubbles: true, composed: true });
            document.dispatchEvent(event);
        });
    }

    // service
    async postEnergyData(data = { groupId, value, time, type, pin }) {
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