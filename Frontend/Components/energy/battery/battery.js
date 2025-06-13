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
        
        this.groupId = null;
        this.pollingInterval = null;
    }

    // component attributes
    static get observedAttributes() {
        return ['group-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'group-id':
                this.groupId = newValue;
                this.startPolling();
                break;
        }
    }

    formatWattHour(value) {
        // Parse to float and round to 2 decimal places - only for current value
        return parseFloat(value).toFixed(2);
    }

    connectedCallback() {
        // Check if we have a group ID from session storage if not explicitly set
        if (!this.groupId) {
            const user = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
            this.groupId = user.groupId;
        }
        
        // Start polling if we have a group ID
        if (this.groupId) {
            this.startPolling();
        }
    }
    
    disconnectedCallback() {
        // Clean up interval when component is removed
        this.stopPolling();
    }
    
    startPolling() {
        // Clear any existing interval first
        this.stopPolling();
        
        // Only start polling if we have a group ID
        if (this.groupId) {
            // Fetch immediately, then every 5 seconds
            this.fetchBatteryData();
            this.pollingInterval = setInterval(() => {
                this.fetchBatteryData();
            }, 5000);
        }
    }
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    async fetchBatteryData() {
        if (!this.groupId) return;
        
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/groups/${this.groupId}/energy`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch battery data: ${response.status}`);
            }
            
            const groupData = await response.json();
            
            // Use batteryLevel and batteryCapacity from group data
            const currentWattHour = groupData.batteryLevel || 0;
            const requiredWattHour = groupData.batteryCapacity || 100;
            
            // Update the display
            this.currentWattHourElement.textContent = this.formatWattHour(currentWattHour);
            this.requiredWattHourElement.textContent = parseFloat(requiredWattHour);
            
            // Update battery fill
            this.updateBatteryFill(currentWattHour, requiredWattHour);
            
        } catch (error) {
            console.error('Error fetching battery data:', error);
        }
    }
    
    updateBatteryFill(currentWattHour, requiredWattHour) {
        // Calculate fill percentage (capped at 100%)
        let fillPercentage = Math.min((currentWattHour / requiredWattHour) * 100, 100);
        
        // Update the fill width
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