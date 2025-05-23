//#region IMPORTS
import '../../microbit/microbitPinController/microbitPinController.js';
import '../../microbit/rangeIndicatorBar/rangeIndicatorBar.js';
import '../../microbit/liveLineGraph/liveLineGraph.js';
import '../../microbit/totalEnergyGroupsBar/totalEnergyGroupsBar.js';
import '../../microbit/averageValueGroupsBar/averageValueGroupsBar.js';
import '../../microbit/pinAssignmentCards/pinAssignmentCards.js';
import '../../energy/battery/battery.js';
//#endregion IMPORTS

//#region MICROBITPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/microbitPage/style.css';
    </style>
    <div id="microbitPanel">
        <div id="switches">
            <div id="bluetoothToggleContainer">
                <img src="Assets/SVGs/bluetooth-off.svg" alt="Bluetooth" class="icon" style="height: 23px;"/>
                <label class="switch">
                    <input type="checkbox" id="bluetoothToggle">
                    <span class="slider bluetooth"></span>
                </label>
                <img src="Assets/SVGs/bluetooth.svg" alt="Bluetooth" class="icon" style="height: 23px;"/>
            </div>
            <div id="dataTypeToggleContainer">
                <img src="Assets/SVGs/voltage.svg" alt="microbit" class="icon" style="height: 20px; margin-right: 2px; margin-left: 2px;"/>
                <label class="switch">
                    <input type="checkbox" id="dataTypeToggle">
                    <span class="slider datatype"></span>
                </label>
                <img src="Assets/SVGs/microbit.png" alt="microbit" class="icon" style="height: 18px;"/>
            </div>
        </div>
        <pinAssignmentCards-れ></pinAssignmentCards-れ>
        <div id="groupSelectorContainer">
            <label for="groupSelector">Selecteer groep:</label>
            <select id="groupSelector">
                <option value="">Laden...</option>
            </select>
        </div>
        <div class="energy-status">
            <battery-れ id="energyBattery"></battery-れ>
        </div>
    </div>
    <div id= "fullscreenContainer">
        <div id="graphs">
            <div id="rangeButtons">
                <button data-range="minute" class="active">1m</button>
                <button data-range="tenMinutes">10m</button>
                <button data-range="oneHour">1u</button>
                <button data-range="sixHour">6u</button>
                <button data-range="oneDay">24u</button>
            </div>
            <img src="Assets/SVGs/fullscreen.png" alt="fullscreen" class="fullscreen" style="height: 25px;"/>
            <livelinegraph-れ></livelinegraph-れ>
            <div id="bars">
                <rangeindicatorbar-れ id="solar"></rangeindicatorbar-れ>
                <rangeindicatorbar-れ id="wind"></rangeindicatorbar-れ>
                <rangeindicatorbar-れ id="water"></rangeindicatorbar-れ>
            </div>
            <totalenergygroupsbar-れ></totalenergygroupsbar-れ>	
            <averageValueGroupsBar-れ range="oneDay"></averageValueGroupsBar-れ>
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
        this.averageValue = this._shadowRoot.querySelector('averageValueGroupsBar-れ');
        this.totalEnergyBar = this._shadowRoot.querySelector('totalenergygroupsbar-れ');
        this.fullscreenContainer = this._shadowRoot.querySelector('#fullscreenContainer');
        this.fullscreen = this._shadowRoot.querySelector('.fullscreen');
        this.energyBattery = this._shadowRoot.querySelector('#energyBattery');
        this.groupSelectorContainer = this._shadowRoot.getElementById('groupSelectorContainer');
        this.energyData = [];
        this.currentWattValue = 0;
        this.groupPollInterval = null;
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

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                this.fullscreen.src = 'Assets/SVGs/exit-fullscreen.svg'; 
            } else {
                this.fullscreen.src = 'Assets/SVGs/fullscreen.png'; 
            }
        });

        this.liveTeamData.setAttribute('mode', 'voltage');
        this.solarBar.setAttribute('mode', 'voltage');
        this.windBar.setAttribute('mode', 'voltage');
        this.waterBar.setAttribute('mode', 'voltage');
        this.averageValue.setAttribute('mode', 'voltage');

        const bluetoothToggle = this._shadowRoot.getElementById('bluetoothToggle');
        const dataTypeToggle = this._shadowRoot.getElementById('dataTypeToggle');
    
        this._shadowRoot.querySelectorAll('#rangeButtons button').forEach(button => {
            button.addEventListener('click', () => {
                const range = button.getAttribute('data-range');
                this.liveTeamData.setAttribute('range', range);
                this.solarBar.setAttribute('range', range);
                this.windBar.setAttribute('range', range);
                this.waterBar.setAttribute('range', range);
                this.averageValue.setAttribute('range', range);
    
                this._shadowRoot.querySelectorAll('#rangeButtons button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
        });
    
        const bluetoothWasOn = sessionStorage.getItem('bluetoothEnabled') === 'true';
        bluetoothToggle.checked = bluetoothWasOn;
    
        if (bluetoothWasOn) {
            this.setAttribute('bluetooth-enabled', '');
        } else {
            this.removeAttribute('bluetooth-enabled');
        }
    
        bluetoothToggle.addEventListener('change', () => {
            if (bluetoothToggle.checked) {
                this.startBluetoothConnection();
            } else {
                this.endBluetoothConnection();
            }
        });

        window.addEventListener('bluetoothconnectionfailed', () => {
            const bluetoothToggle = this._shadowRoot.getElementById('bluetoothToggle');
            if (bluetoothToggle) {
                bluetoothToggle.checked = false;
            }
            sessionStorage.setItem('bluetoothEnabled', 'false');
            this.removeAttribute('bluetooth-enabled');
        });

        dataTypeToggle.addEventListener('change', () => {
            const mode = dataTypeToggle.checked ? 'microbit' : 'voltage';
            this.setAttribute('data-type-mode', mode);
        
            this.liveTeamData.setAttribute('mode', mode);
            this.solarBar.setAttribute('mode', mode);
            this.windBar.setAttribute('mode', mode);
            this.waterBar.setAttribute('mode', mode);
            this.averageValue.setAttribute('mode', mode);
        });
           
    
        document.addEventListener('energydatareading', this.updateEnergyData.bind(this));
        await this.getEnergyData();

        const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
        const isAdmin = user.role === "ADMIN";
        const isTeacher = user.role === "TEACHER";
        const userGroupId = user.groupId;

        // Set initial group ID for the battery
        if (userGroupId) {
            this.energyBattery.setAttribute('group-id', userGroupId);
        }

        if (!isAdmin && !isTeacher) {
            this.groupSelectorContainer.remove();   
        } 

        const groupSelector = this._shadowRoot.getElementById('groupSelector');
        const groups = await this.getAllGroups();

        groupSelector.innerHTML = ''; 

        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Selecteer groep';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        groupSelector.appendChild(placeholderOption);

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name || `Groep ${group.id}`;
            groupSelector.appendChild(option);
        });

        groupSelector.addEventListener('change', () => {
            const selectedGroupId = groupSelector.value;
            if (!selectedGroupId) return;

            clearInterval(this.groupPollInterval);
        
            this.fetchAndRenderGroupData(selectedGroupId);

            this.averageValue.setAttribute('groupId', selectedGroupId);
            this.totalEnergyBar.setAttribute('groupId', selectedGroupId);
        
            this.groupPollInterval = setInterval(() => {
                this.fetchAndRenderGroupData(selectedGroupId);
            }, 2000);
        });        
    }
    
    disconnectedCallback() {
        document.removeEventListener('energydatareading', this.updateEnergyData.bind(this));
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

        const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
        const selectedGroupId = this._shadowRoot.getElementById('groupSelector')?.value || user.groupId;
        
        if (data.groupId?.toString() !== selectedGroupId?.toString()) return;
        
        this.energyData.push(data);
        this.liveTeamData.updateGraph(this.energyData, data);

        if (data.type === 'SOLAR') {
            this.solarBar.updateBar(data);
        }

        if (data.type === 'WIND') {
            this.windBar.updateBar(data);
        }

        if (data.type === 'WATER') {
            this.waterBar.updateBar(data);
        }
    }

    //services
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

            this.liveTeamData.updateGraph(this.energyData, null);

        } catch (error) {
            console.error("Fout bij ophalen van energyData:", error);
            return [];
        }
    }

    async getAllGroups() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/groups/`);
            const groups = await response.json();
            return groups;
        } catch (error) {
            console.error("Fout bij ophalen van groepen:", error);
            return [];
        }
    }

    async fetchAndRenderGroupData(groupId) {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/energydata/${groupId}`);
            if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
    
            this.energyData = await response.json();
    
            const solarPoints = this.energyData.filter(d => d.type === 'SOLAR');
            const windPoints = this.energyData.filter(d => d.type === 'WIND');
            const waterPoints = this.energyData.filter(d => d.type === 'WATER');
    
            this.solarBar.setFullData(solarPoints);
            this.windBar.setFullData(windPoints);
            this.waterBar.setFullData(waterPoints);
    
            const lastSolar = solarPoints.at(-1);
            const lastWind = windPoints.at(-1);
            const lastWater = waterPoints.at(-1);
    
            this.solarBar.updateBar(solarPoints, lastSolar);
            this.windBar.updateBar(windPoints, lastWind);
            this.waterBar.updateBar(waterPoints, lastWater);
    
            this.liveTeamData.updateGraph(this.energyData, null);
            this.averageValue.setAttribute('range', this.averageValue.getAttribute('range'));

            // Update battery component with the selected group ID
            this.energyBattery.setAttribute('group-id', groupId);
    
        } catch (error) {
            console.error("Fout bij ophalen van energyData voor groep", groupId, ":", error);
        }
    }    
});
//#endregion CLASS