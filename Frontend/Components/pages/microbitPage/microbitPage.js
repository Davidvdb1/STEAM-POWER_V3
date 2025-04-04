//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/rangeIndicatorBar/rangeIndicatorBar.js';
import '../../microbit/liveLineGraph/liveLineGraph.js';
import '../../microbit/pinAssignmentCards/pinAssignmentCards.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/microbitPage/style.css';
    </style>
    <div id="bluetoothButtonsContainer">
        <button id="startButton">Start Bluetooth Connection</button>
        <button id="endButton">End Bluetooth Connection</button>
    </div>
    <pinAssignmentCards-れ></pinAssignmentCards-れ>
    <div id="rangeButtons">
        <button data-range="minute">1m</button>
        <button data-range="tenMinutes">10m</button>
        <button data-range="oneHour">1u</button>
        <button data-range="sixHour">6u</button>
        <button data-range="oneDay" class="active">24u</button>
    </div>
    <div id="graphs">
        <livelinegraph-れ></livelinegraph-れ>
        <div id="bars">
            <rangeindicatorbar-れ id="solar"></rangeindicatorbar-れ>
            <rangeindicatorbar-れ id="wind"></rangeindicatorbar-れ>
            <rangeindicatorbar-れ id="water"></rangeindicatorbar-れ>
        </div>
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
        this._shadowRoot.getElementById('endButton').addEventListener('click', () => this.endBluetoothConnection());
        
        document.addEventListener('energydatareading', this.updateEnergyData.bind(this));
        
        await this.getEnergyData()
    
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
        
    }
    

    startBluetoothConnection() {
        const event = new CustomEvent('startbluetoothconnection', { bubbles: true, composed: true });
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
    
    // initGraphs() {
    //     this.liveTeamData.updateGraph(this.energyData);
    
    //     const solarPoints = this.energyData.filter(d => d.type === 'SOLAR');
    //     const windPoints = this.energyData.filter(d => d.type === 'WIND');
    //     const waterPoints = this.energyData.filter(d => d.type === 'WATER');
    
    //     this.solarBar.updateBar(solarPoints, solarPoints.at(-1));
    //     this.windBar.updateBar(windPoints, windPoints.at(-1));
    //     this.waterBar.updateBar(waterPoints, waterPoints.at(-1));
    // }

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