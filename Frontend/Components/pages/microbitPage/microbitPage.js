//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/microbitGraphs/microbitGraphs.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/microbitPage/style.css';
    </style>
    <div id="bluetoothButtonsContainer">
        <button id="startButton">Start Bluetooth Connection</button>
        <button id="pauseButton">Pause Bluetooth Connection</button>
        <button id="endButton">End Bluetooth Connection</button>
    </div>
    
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