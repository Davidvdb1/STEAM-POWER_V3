//#region IMPORTS
//#endregion IMPORTS

//#region BATTERY
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/energy/battery/style.css';
    </style>
    <div class="battery-container">
        <div class="battery-body">
            <div class="battery-fill"></div>
            <div class="battery-info">
                <span class="current-watt-hour">0</span>/<span class="required-watt-hour">0</span> Wh
            </div>
        </div>
        <div class="battery-head"></div>
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
        this.currentWattHourElement = this._shadowRoot.querySelector('.current-watt-hour');
        this.requiredWattHourElement = this._shadowRoot.querySelector('.required-watt-hour');
    }

    // component attributes
    static get observedAttributes() {
        return ['current-watt-hour', 'required-watt-hour'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'current-watt-hour':
                this.currentWattHourElement.textContent = this.formatWattHour(newValue);
                this.updateBatteryFill();
                break;
            case 'required-watt-hour':
                // Display maximum capacity without rounding
                this.requiredWattHourElement.textContent = parseFloat(newValue);
                this.updateBatteryFill();
                break;
        }
    }

    formatWattHour(value) {
        // Parse to float and round to 3 decimal places - only for current value
        return parseFloat(value).toFixed(3);
    }

    connectedCallback() {
        // Initialize with default values if attributes aren't set
        if (!this.hasAttribute('current-watt-hour')) {
            this.setAttribute('current-watt-hour', '0');
        }
        if (!this.hasAttribute('required-watt-hour')) {
            this.setAttribute('required-watt-hour', '100');
        }
        
        this.updateBatteryFill();
    }
    
    updateBatteryFill() {
        // Ensure we're always parsing string values to floats for precise calculation
        const currentWattHour = parseFloat(this.getAttribute('current-watt-hour') || '0');
        const requiredWatthour = parseFloat(this.getAttribute('required-watt-hour') || '100');
        
        // Calculate fill percentage (capped at 100%)
        let fillPercentage = Math.min((currentWattHour / requiredWatthour) * 100, 100);
        
        // Update the fill width instead of height
        this.batteryFill.style.width = `${fillPercentage}%`;
        
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