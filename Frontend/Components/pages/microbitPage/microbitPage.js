//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/microbitGraphs/microbitGraphs.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/microbitPage/style.css';
    </style>
    <p>Microbit Page</p>
    <p>last 5 measurements: </p>
    <ul id="measurementList"></ul>
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
    <microbitpincontroller-れ></microbitpincontroller-れ>
    <label for="rangeSelect">tijdspanne selecteren:</label>
    <select id="rangeSelect">
    <option value="halfMinute">30 seconden</option>
    <option value="tenMinutes">10 minuten</option>
    <option value="oneHour">1 uur</option>
    <option value="sixHour">6 uur</option>
    <option value="oneDay" selected>24 uur</option>
    </select>
    <microbitgraphs-れ></microbitgraphs-れ>
`;
//#endregion MICROBITPAGE

//#region CLASS
window.customElements.define('microbitpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.liveTeamData = this._shadowRoot.querySelector('microbitgraphs-れ');
        this.$rangeSelect = this._shadowRoot.querySelector('#rangeSelect');
        this.energyData = [];
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    async connectedCallback() {
        this._shadowRoot.getElementById('startButton').addEventListener('click', () => this.startBluetoothConnection());
        this._shadowRoot.getElementById('pauseButton').addEventListener('click', () => this.pauseBluetoothConnection());
        this._shadowRoot.getElementById('endButton').addEventListener('click', () => this.endBluetoothConnection());
        this._shadowRoot.getElementById('intervalSelect').addEventListener('change', (event) => this.setBluetoothDataInterval(event));
        
        document.addEventListener('energydatareading', this.updateEnergyData.bind(this));
        
        await this.getEnergyData()
    
        this.$rangeSelect.addEventListener('change', async (event) => {
            this.liveTeamData.setAttribute('range', event.target.value);
        });
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

    updateEnergyData(event) {
        const data = event.detail;
        this.energyData.push(data);
        this.liveTeamData.updateGraph(this.energyData, data);
    }

    setBluetoothDataInterval(event) {
        if (event.target.value === 'none') return;
        const interval = parseInt(event.target.value, 10);
        const customEvent = new CustomEvent('setbluetoothdatainterval', { detail: interval, bubbles: true, composed: true });
        document.dispatchEvent(customEvent);
    }

    initGraphs() {
        this.liveTeamData.updateGraph(this.energyData);
    }

    
    // 🔹 Functie die alleen de fetch uitvoert en data teruggeeft
    async getEnergyData() {
        try {
            const groupId = JSON.parse(sessionStorage.getItem('loggedInUser'))?.groupId;
            if (!groupId) throw new Error("Geen geldig groupId gevonden!");
    
            const response = await fetch(`${window.env.BACKEND_URL}/energydata/${groupId}`);
            
            if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
        
            this.energyData = await response.json();
            this.initGraphs();
        } catch (error) {
            console.error("Fout bij ophalen van energyData:", error);
            return [];
        }
    }
});
//#endregion CLASS