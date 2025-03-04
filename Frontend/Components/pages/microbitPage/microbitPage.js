//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPAGE
const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/microbitPage/style.css';
    </style>
    <p>Microbit Page</p>
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
        this.connectToDevice();
    }

    async connectToDevice() {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [ NORDIC_UART_SERVICE_UUID ] // Nordic UART Service
        });

        const server = await device.gatt.connect();

        const uartService = await server.getPrimaryService(NORDIC_UART_SERVICE_UUID); // Nordic UART Service
        const rxCharacteristic = await uartService.getCharacteristic(RX_CHARACTERISTIC_UUID); // RX Characteristic

        await rxCharacteristic.startNotifications();
        rxCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
    }
    
    handleCharacteristicValueChanged(event) {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Received data:', value);
    }
});//#endregion CLASS