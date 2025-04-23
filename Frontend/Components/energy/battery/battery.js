//#region IMPORTS
//#endregion IMPORTS

//#region BATTERY
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/energy/battery/style.css';
    </style>
    <div class="battery-container">
        <div class="battery-head"></div>
        <div class="battery-body">
            <div class="battery-fill"></div>
        </div>
        <div class="battery-info">
            <span class="current-watt">0</span>/<span class="required-watt">0</span> W
        </div>
    </div>
`;
//#endregion BATTERY

//#region CLASS
window.customElements.define('battery-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.batteryFill = this._shadowRoot.querySelector('.battery-fill');
        this.currentWattElement = this._shadowRoot.querySelector('.current-watt');
        this.requiredWattElement = this._shadowRoot.querySelector('.required-watt');
    }

    // component attributes
    static get observedAttributes() {
        return ['current-watt', 'required-watt'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'current-watt':
                this.currentWattElement.textContent = newValue;
                this.updateBatteryFill();
                break;
            case 'required-watt':
                this.requiredWattElement.textContent = newValue;
                this.updateBatteryFill();
                break;
        }
    }

    connectedCallback() {
        // Initialize with default values if attributes aren't set
        if (!this.hasAttribute('current-watt')) {
            this.setAttribute('current-watt', '0');
        }
        if (!this.hasAttribute('required-watt')) {
            this.setAttribute('required-watt', '100');
        }
        
        this.updateBatteryFill();
    }
    
    updateBatteryFill() {
        const currentWatt = parseInt(this.getAttribute('current-watt') || '0');
        const requiredWatt = parseInt(this.getAttribute('required-watt') || '100');
        
        // Calculate fill percentage (capped at 100%)
        let fillPercentage = Math.min((currentWatt / requiredWatt) * 100, 100);
        
        // Update the fill height
        this.batteryFill.style.height = `${fillPercentage}%`;
        
        // Update fill color based on percentage
        if (fillPercentage >= 90) {
            this.batteryFill.style.backgroundColor = 'var(--battery-full-color, #4CAF50)';
        } else if (fillPercentage >= 40) {
            this.batteryFill.style.backgroundColor = 'var(--battery-mid-color, #FFC107)';
        } else {
            this.batteryFill.style.backgroundColor = 'var(--battery-low-color, #F44336)';
        }
    }
});
//#endregion CLASS