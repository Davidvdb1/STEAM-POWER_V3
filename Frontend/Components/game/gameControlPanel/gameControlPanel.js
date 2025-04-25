//#region IMPORTS
//#endregion IMPORTS

//#region GAMECONTROLPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/game/gameControlPanel/style.css';
        .hidden { display: none; }
    </style>

    <div>
        <label for="batteryInput">Batterijcapaciteit (Wh):</label>
        <input type="number" id="batteryInput" />
        <button id="confirmCapacityButton" class="hidden">Bevestig</button>
    </div>

    <div>
        <label for="multiplierInput">Energie-multiplier:</label>
        <input type="number" id="multiplierInput" step="0.01" />
        <button id="confirmMultiplierButton" class="hidden">Bevestig</button>
    </div>
`;
//#endregion GAMECONTROLPANEL

//#region CLASS
window.customElements.define('gamecontrolpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.batteryInput = this._shadowRoot.querySelector('#batteryInput');
        this.confirmCapacityButton = this._shadowRoot.querySelector('#confirmCapacityButton');
        this.multiplierInput = this._shadowRoot.querySelector('#multiplierInput');
        this.confirmMultiplierButton = this._shadowRoot.querySelector('#confirmMultiplierButton');

        this.originalBatteryValue = null;
        this.originalMultiplierValue = null;

        this.onBatteryInputChange = this.onBatteryInputChange.bind(this);
        this.onConfirmBatteryClick = this.onConfirmBatteryClick.bind(this);
        this.onMultiplierInputChange = this.onMultiplierInputChange.bind(this);
        this.onConfirmMultiplierClick = this.onConfirmMultiplierClick.bind(this);
    }

    connectedCallback() {
        // Init battery capacity
        fetch(`${window.env.BACKEND_URL}/groups/battery`)
            .then(res => res.json())
            .then(data => {
                this.originalBatteryValue = parseInt(data);
                this.batteryInput.value = this.originalBatteryValue;
            })
            .catch(console.error);

        // Init energy multiplier
        fetch(`${window.env.BACKEND_URL}/groups/Multiplier`)
            .then(res => res.json())
            .then(data => {
                this.originalMultiplierValue = parseFloat(data);
                this.multiplierInput.value = this.originalMultiplierValue;
            })
            .catch(console.error);

        // Event listeners
        this.batteryInput.addEventListener('input', this.onBatteryInputChange);
        this.confirmCapacityButton.addEventListener('click', this.onConfirmBatteryClick);
        this.multiplierInput.addEventListener('input', this.onMultiplierInputChange);
        this.confirmMultiplierButton.addEventListener('click', this.onConfirmMultiplierClick);
    }

    onBatteryInputChange() {
        const current = parseInt(this.batteryInput.value);
        this.toggleButton(this.confirmCapacityButton, current !== this.originalBatteryValue);
    }

    onConfirmBatteryClick() {
        const newValue = parseInt(this.batteryInput.value);
        fetch(`${window.env.BACKEND_URL}/groups/battery`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batteryCapacity: newValue })
        })
            .then(response => {
                if (!response.ok) throw new Error('Update failed');
                this.originalBatteryValue = newValue;
                this.confirmCapacityButton.classList.add('hidden');
            })
            .catch(console.error);
    }

    onMultiplierInputChange() {
        const current = parseFloat(this.multiplierInput.value);
        this.toggleButton(this.confirmMultiplierButton, current !== this.originalMultiplierValue);
    }

    onConfirmMultiplierClick() {
        const newValue = parseFloat(this.multiplierInput.value);
        fetch(`${window.env.BACKEND_URL}/groups/Multiplier`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ energyMultiplier: newValue })
        })
            .then(response => {
                if (!response.ok) throw new Error('Update failed');
                this.originalMultiplierValue = newValue;
                this.confirmMultiplierButton.classList.add('hidden');
            })
            .catch(console.error);
    }

    toggleButton(button, condition) {
        if (condition) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    }
});
//#endregion CLASS
