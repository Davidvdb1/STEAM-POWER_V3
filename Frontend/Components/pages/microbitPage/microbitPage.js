//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/microbitGraphs/microbitGraphs.js';
import '../../energy/battery/battery.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/microbitPage/style.css';
    </style>
    <div id="bluetoothButtonsContainer">
        <button id="startButton">Start Bluetooth Connection</button>
        <button id="pauseButton">Pause Bluetooth Connection</button>
        <button id="endButton">End Bluetooth Connection</button>
    </div>
    
    <div class="energy-status">
        <battery-れ id="energyBattery" current-watt="0" required-watt="500"></battery-れ>
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
        this.energyBattery = this._shadowRoot.querySelector('#energyBattery');
        this.energyData = [];
        this.timerInterval = null;
        this.currentWattValue = 0;
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
        
        await this.getEnergyData();
    
        this.$rangeSelect.addEventListener('change', async (event) => {
            this.liveTeamData.setAttribute('range', event.target.value);
        });

        // Start the battery auto-increment timer
        this.startBatteryTimer();
    }
    
    disconnectedCallback() {
        // Clean up the timer when component is removed
        this.stopBatteryTimer();
    }

    startBatteryTimer() {
        // Clear any existing timer
        this.stopBatteryTimer();
        
        // Start a new timer that increments the battery every second
        this.timerInterval = setInterval(() => {
            this.currentWattValue++;
            this.energyBattery.setAttribute('current-watt', this.currentWattValue.toString());
            
            // Reset to 0 if it exceeds the required watt (for demonstration purposes)
            const requiredWatt = parseInt(this.energyBattery.getAttribute('required-watt') || '500');
            if (this.currentWattValue > requiredWatt) {
                this.currentWattValue = 0;
            }
        }, 1000); // 1000ms = 1 second
    }
    
    stopBatteryTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
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
        
        // If using real data, you might want to uncomment this and comment out the timer
        // if (data && (data.watt !== undefined || data.power !== undefined)) {
        //     const currentWatt = data.watt || data.power || 0;
        //     this.currentWattValue = currentWatt;
        //     this.energyBattery.setAttribute('current-watt', currentWatt.toString());
        // }
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