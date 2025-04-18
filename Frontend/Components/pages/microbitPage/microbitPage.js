//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/rangeIndicatorBar/rangeIndicatorBar.js';
import '../../microbit/liveLineGraph/liveLineGraph.js';
import '../../microbit/pinAssignmentCards/pinAssignmentCards.js';
import '../../microbit/microbitGraphs/microbitGraphs.js';
import '../../energy/battery/battery.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/microbitPage/style.css';
    </style>
    <div id="microbitPanel">
        <div id="switches">
            <div id="bluetoothToggleContainer">
                <img src="Assets/SVGs/bluetooth.svg" alt="Bluetooth" class="icon" style="height: 20px;"/>
                <label class="switch">
                    <input type="checkbox" id="bluetoothToggle">
                    <span class="slider bluetooth"></span>
                </label>
            </div>
            <div id="dataTypeToggleContainer">
                <img src="Assets/SVGs/voltage.svg" alt="microbit" class="icon" style="height: 20px;"/>
                <label class="switch">
                    <input type="checkbox" id="dataTypeToggle">
                    <span class="slider datatype"></span>
                </label>
                <img src="Assets/SVGs/microbit.png" alt="microbit" class="icon" style="height: 18px;"/>
            </div>
        </div>
        <pinAssignmentCards-れ></pinAssignmentCards-れ>
    </div>
    <div id= "fullscreenContainer">
        <div id="graphs">
            <div id="rangeButtons">
                <button data-range="minute">1m</button>
                <button data-range="tenMinutes">10m</button>
                <button data-range="oneHour">1u</button>
                <button data-range="sixHour">6u</button>
                <button data-range="oneDay" class="active">24u</button>
            </div>
            <img src="Assets/SVGs/fullscreen.png" alt="fullscreen" class="fullscreen" style="height: 25px;"/>
            <livelinegraph-れ></livelinegraph-れ>
            <div id="bars">
                <rangeindicatorbar-れ id="solar"></rangeindicatorbar-れ>
                <rangeindicatorbar-れ id="wind"></rangeindicatorbar-れ>
                <rangeindicatorbar-れ id="water"></rangeindicatorbar-れ>
            </div>
        </div>
    </div>
    <div class="energy-status">
        <battery-れ id="energyBattery" current-watt="0" required-watt="500"></battery-れ>
    </div>
`;
//#endregion MICROBITPAGE

//#region CLASS
window.customElements.define('microbitpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.liveTeamData = this._shadowRoot.querySelector('livelinegraph-れ');
        this.solarBar = this._shadowRoot.querySelector('#solar');
        this.windBar = this._shadowRoot.querySelector('#wind');
        this.waterBar = this._shadowRoot.querySelector('#water');
        this.fullscreenContainer = this._shadowRoot.querySelector('#fullscreenContainer');
        this.fullscreen = this._shadowRoot.querySelector('.fullscreen');
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
        this.fullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.fullscreenContainer.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        this.liveTeamData.setAttribute('mode', 'voltage');
        this.solarBar.setAttribute('mode', 'voltage');
        this.windBar.setAttribute('mode', 'voltage');
        this.waterBar.setAttribute('mode', 'voltage');

        const bluetoothToggle = this._shadowRoot.getElementById('bluetoothToggle');
        const dataTypeToggle = this._shadowRoot.getElementById('dataTypeToggle');
    
        // Houd visuele toggle in sync met sessionStorage
        const bluetoothWasOn = sessionStorage.getItem('bluetoothEnabled') === 'true';
        bluetoothToggle.checked = bluetoothWasOn;
    
        if (bluetoothWasOn) {
            this.setAttribute('bluetooth-enabled', '');
        } else {
            this.removeAttribute('bluetooth-enabled');
        }
    
        // Toggle event
        bluetoothToggle.addEventListener('change', () => {
            if (bluetoothToggle.checked) {
                this.startBluetoothConnection();
            } else {
                this.endBluetoothConnection();
            }
        });

        dataTypeToggle.addEventListener('change', () => {
            const mode = dataTypeToggle.checked ? 'microbit' : 'voltage';
            this.setAttribute('data-type-mode', mode);
        
            // doorgeven aan de kinderen
            this.liveTeamData.setAttribute('mode', mode);
            this.solarBar.setAttribute('mode', mode);
            this.windBar.setAttribute('mode', mode);
            this.waterBar.setAttribute('mode', mode);
        });
           
    
        document.addEventListener('energydatareading', this.updateEnergyData.bind(this));
        await this.getEnergyData();
    
        // Range buttons...
        this._shadowRoot.querySelectorAll('#rangeButtons button').forEach(button => {
            button.addEventListener('click', () => {
                const range = button.getAttribute('data-range');
                this.liveTeamData.setAttribute('range', range);
                this.solarBar.setAttribute('range', range);
                this.windBar.setAttribute('range', range);
                this.waterBar.setAttribute('range', range);
    
                this._shadowRoot.querySelectorAll('#rangeButtons button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
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
        sessionStorage.setItem('bluetoothEnabled', 'true');
        this.setAttribute('bluetooth-enabled', 'true');
        const event = new CustomEvent('startbluetoothconnection', { bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    endBluetoothConnection() {
        sessionStorage.setItem('bluetoothEnabled', 'false');
        this.removeAttribute('bluetooth-enabled');
        const event = new CustomEvent('stopbluetoothconnection', { bubbles: true, composed: true });
        document.dispatchEvent(event);
    }

    updateEnergyData(event) {
        const data = event.detail;
        this.energyData.push(data);
        this.liveTeamData.updateGraph(this.energyData, data);
    
        if (data.type === 'SOLAR') {
            const solarPoints = this.energyData.filter(d => d.type === 'SOLAR');
            this.solarBar.updateBar(solarPoints, data);
        }
    
        if (data.type === 'WIND') {
            const windPoints = this.energyData.filter(d => d.type === 'WIND');
            this.windBar.updateBar(windPoints, data);
        }
    
        if (data.type === 'WATER') {
            const waterPoints = this.energyData.filter(d => d.type === 'WATER');
            this.waterBar.updateBar(waterPoints, data);
        }
    }

    async getEnergyData() {
        try {
            const groupId = JSON.parse(sessionStorage.getItem('loggedInUser'))?.groupId;
            if (!groupId) throw new Error("Geen geldig groupId gevonden!");
    
            const response = await fetch(`${window.env.BACKEND_URL}/energydata/${groupId}`);
            
            if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
        
            this.energyData = await response.json();

            const solarPoints = this.energyData.filter(d => d.type === 'SOLAR');
            const windPoints = this.energyData.filter(d => d.type === 'WIND');
            const waterPoints = this.energyData.filter(d => d.type === 'WATER');

            this.solarBar.setFullData(solarPoints);
            this.windBar.setFullData(windPoints);
            this.waterBar.setFullData(waterPoints);

            this.liveTeamData.updateGraph(this.energyData);

        } catch (error) {
            console.error("Fout bij ophalen van energyData:", error);
            return [];
        }
    }
});
//#endregion CLASS