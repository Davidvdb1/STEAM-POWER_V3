//#region IMPORTS
//#endregion IMPORTS

//#region GAMECONTROLPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/game/gameControlPanel/style.css';
    </style>

    <div>
        <label for="batteryInput">Batterijcapaciteit (Wh):</label>
        <input type="number" id="batteryInput" />
        <button id="confirmButton" class="hidden">Bevestig</button>
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
        this.confirmButton = this._shadowRoot.querySelector('#confirmButton');

        this.originalValue = null;

        this.onInputChange = this.onInputChange.bind(this);
        this.onConfirmClick = this.onConfirmClick.bind(this);
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        fetch(`${window.env.BACKEND_URL}/groups/battery`)
            .then(res => res.json())
            .then(data => {
                this.originalValue = parseInt(data);
                this.batteryInput.value = this.originalValue;
            })
            .catch(console.error);

        this.batteryInput.addEventListener('input', this.onInputChange);
        this.confirmButton.addEventListener('click', this.onConfirmClick);
    }

    onInputChange() {
        const currentValue = parseInt(this.batteryInput.value);
        if (currentValue !== this.originalValue) {
            this.confirmButton.classList.remove('hidden');
        } else {
            this.confirmButton.classList.add('hidden');
        }
    }

    onConfirmClick() {
        const newValue = parseInt(this.batteryInput.value);
        fetch(`${window.env.BACKEND_URL}/groups/battery`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batteryCapacity: newValue })
        })
            .then(response => {
                if (!response.ok) throw new Error('Update failed');
                this.originalValue = newValue;
                this.confirmButton.classList.add('hidden');
            })
            .catch(console.error);
    }
});
//#endregion CLASS