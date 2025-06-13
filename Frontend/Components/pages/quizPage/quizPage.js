//#region IMPORTS
import '../../quiz/questionList/questionList.js';
import '../../quiz/quizQuestionComponent/quizQuestionComponent.js';
import '../../quiz/answerFeedBackComponent/answerFeedbackComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/quizPage/style.css';
    </style>

    <div id="container">
        <answer-feedback-component-れ width="800" height="200"></answer-feedback-component-れ>
        <div id="energy-context-select-container">
            <label for="wind">
                <input type="radio" id="wind-radio" name="power-source" value="wind">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4A90E2" d="M5 10h11a1 1 0 100-2H5a1 1 0 100 2zm-2 4h15a1 1 0 100-2H3a1 1 0 100 2zm4 4h10a1 1 0 100-2H7a1 1 0 100 2z"/>
                <path fill="#4A90E2" d="M18 4a2 2 0 110 4 1 1 0 100 2 4 4 0 100-8 1 1 0 100 2z"/>
                </svg>
                Wind
            </label>
            <label for="water">
                <input type="radio" id="water-radio" name="power-source" value="water">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 18 8 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 8 12 2 12 2Z" fill="#4A90E2"/>
                    <path d="M12 4C12 4 16 9 16 14C16 16.21 14.21 18 12 18C9.79 18 8 16.21 8 14C8 9 12 4 12 4Z" fill="#87CEEB"/>
                    <ellipse cx="10" cy="12" rx="1" ry="1.5" fill="#FFFFFF" opacity="0.6"/>
                </svg>
                Water
            </label>
            <label for="solar">
                <input type="radio" id="solar-radio" name="power-source" value="solar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="6" fill="#FFD700"/>
                    <circle cx="12" cy="12" r="4" fill="#FFA500"/>
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Zon
            </label>
        <div id="error-container">
            <p id="error-message-text"></p>
        </div>
        
        <div id="groupSelectorContainer">
            <label for="groupSelector">Selecteer groep:</label>
            <select id="groupSelector">
                <option value="">Laden...</option>
            </select>
        </div>
        
        <div id="question-list-container">
            <question-list-れ></question-list-れ>
            <div class="answer-feedback-container">
                <answer-feedback-component-れ width="400" height="200"></answer-feedback-component-れ>
            </div>
        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$container = this.shadowRoot.querySelector("#container");
        this.$questionList = this.shadowRoot.querySelector("question-list-れ");
        this.$errorMessage = this.shadowRoot.querySelector("#error-container");
        this.$errorMessageText = this.shadowRoot.querySelector("#error-message-text");
        this.$errorMessage.style.display = "none";
        this.$energyDataValue = this.shadowRoot.querySelector("#energy-data-value");

        this.$radioEls = this.shadowRoot.querySelectorAll("input[name='power-source']");
        this.groupSelectorContainer = this._shadowRoot.getElementById('groupSelectorContainer');
        this.$windRadio = this.shadowRoot.querySelector("#wind-radio");
        this.$waterRadio = this.shadowRoot.querySelector("#water-radio");
        this.$solarRadio = this.shadowRoot.querySelector("#solar-radio");

        this.energyContext = "wind";
        this.groupId = null;
        this.energyMultiplier = 1;

        // Replace test counters with detected sensors array
        this._detectedSensors = new Set();
        this._testCompleted = false;

        // event handler binding
        this.boundHandleEnergyDataReadingQuizPhase = this.handleEnergyDataReadingQuizPhase.bind(this);
        this.boundHandleEnergyDataReadingTestPhase = this.handleEnergyDataReadingTestPhase.bind(this);
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    // Removed unused attributeChangedCallback implementation
    attributeChangedCallback(name, oldValue, newValue) {
        // No implementation needed
    }

    // New helper method to check login and role
    async checkLogin() {
        // Check if the user is logged in
        const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
            this.showErrorMessage("You are not logged in. Please log in to access this page.");
            return null;
        }

        // Set up quiz page based on user role
        const role = loggedInUser.role;
        if (role === "ADMIN" || role === "TEACHER") {
            this.shadowRoot.querySelector("#energy-data-container").style.display = "none";
            this.shadowRoot.querySelector(".answer-feedback-container").style.display = "none";
            this.shadowRoot.querySelector("#question-list-container").classList.add("admin-teacher-view");

            this.enableRadioButtons(this.$radioEls);

            await this.initGroupSelect();
        } else if (role === "GROUP" && loggedInUser.groupId) {
            this.groupId = loggedInUser.groupId;
            this.energyMultiplier = await fetch(`${window.env.BACKEND_URL}/groups/multiplier`).then(res => res.json()).then(data => data);
            this.setUpGroupQuizPage();
            this.setupEnergyReadingDisplay();
        }
        return loggedInUser;
    }

    enableRadioButtons(radioEls) {

        radioEls.forEach((radioEl) => {
            radioEl.disabled = false;
            const labelEl = radioEl.closest('label');
            if (labelEl) {
                // reset label color to default
                labelEl.style.color = 'inherit';
            }
            radioEl.checked = radioEl.value === this.energyContext;
            console.log("Radio button enabled:", radioEl.value, radioEl.disabled, radioEl.checked);
            radioEl.addEventListener("change", (e) => {
                this.energyContext = e.target.value;
                this.$energyDataValue.innerText = "loading...";
                this.$questionList && (this.$questionList.energyContext = this.energyContext);
                this.$questionList && (this.$questionList.fetchQuestions());
            });
        });

    }

    async connectedCallback() {

        this.$container = this.shadowRoot.querySelector("#container");
        this.$questionList = this.shadowRoot.querySelector("question-list-れ");

        this.$windRadio = this.shadowRoot.querySelector("#wind-radio");
        this.$waterRadio = this.shadowRoot.querySelector("#water-radio");
        this.$solarRadio = this.shadowRoot.querySelector("#solar-radio");
        
        this.$windLabel = this.shadowRoot.querySelector('label[for="wind"]');
        this.$waterLabel = this.shadowRoot.querySelector('label[for="water"]');
        this.$solarLabel = this.shadowRoot.querySelector('label[for="solar"]');
        
        switch (this.energyContext) {
            case "wind":
                this.$windRadio.checked = true;
                break;
            case "water":
                this.$waterRadio.checked = true;
                break;
            case "solar":
                this.$solarRadio.checked = true;
                break;
        }

        this.$windLabel.addEventListener("click", () => this.handlePowerSourceChange({target: {value: "wind"}}));
        this.$waterLabel.addEventListener("click", () => this.handlePowerSourceChange({target: {value: "water"}}));
        this.$solarLabel.addEventListener("click", () => this.handlePowerSourceChange({target: {value: "solar"}}));
        if (!(await this.checkLogin())) return;


        customElements.whenDefined('question-list-れ').then(() => {
            this.$questionList && (this.$questionList.groupId = this.groupId);
            this.$questionList && (this.$questionList.energyContext = this.energyContext);
        });

        this.addEventListener("update-error-indicator", (e) => {
            console.log("Update error indicator event:", e.detail.error);
            const error = e.detail.error;
            this.shadowRoot.querySelector("answer-feedback-component-れ")?.setAttribute("error", error);
        });
    }


    disconnectedCallback() {
        window.removeEventListener("energydatareading", this.boundHandleEnergyDataReading);
    }

    setupEnergyReadingDisplay() {
        window.addEventListener("energydatareading", this.boundHandleEnergyDataReadingTestPhase);
    };

    handleEnergyDataReadingTestPhase(e) {
        const data = e.detail;
        const energyType = data.type.toLowerCase();

        // For test phase, track which sensors have been detected
        if (!this._testCompleted) {
            // If an energy type already has been detected, this would mean all active sensors should have been detected
            if (!this._detectedSensors.has(energyType)) {
                this._detectedSensors.add(energyType);

                const radioEl = this.shadowRoot.querySelector(`#${energyType}-radio`);
                this.enableRadioButtons([radioEl]);
            } else {
                // then select the first available sensor.
                const firstAvailableRadio = Array.from(this.$radioEls).find(radio => !radio.disabled);
                if (firstAvailableRadio) {
                    firstAvailableRadio.checked = true;
                    this.energyContext = firstAvailableRadio.value;
                    this.$questionList && (this.$questionList.energyContext = this.energyContext);
                }

                // swap out test phase event handler for quiz phase
                window.removeEventListener("energydatareading", this.boundHandleEnergyDataReadingTestPhase);
                window.addEventListener("energydatareading", this.boundHandleEnergyDataReadingQuizPhase);
                this._testCompleted = true;

                console.log("Test completed. Energy context set to:", this.energyContext);
                console.log("Detected sensors:", Array.from(this._detectedSensors));
                this.$questionList && (this.$questionList.fetchQuestions());
            }
        }
    }

    handleEnergyDataReadingQuizPhase(e) {
        const data = e.detail;
        const energyType = data.type.toLowerCase();

        // Actual processing and displaying of energy data
        if (energyType === this.energyContext) {
            console.log("Energy data reading for context:");
            let voltage = data.value / 341; // Convert to volts
            let power = voltage * 0.5; // Convert to watts (assuming 0.5A current)
            let multipliedPower = power * this.energyMultiplier;
            let energy = multipliedPower * 2 / 3600; // Convert to kWh
            energy = parseFloat(energy.toFixed(3));
            this.$questionList && (this.$questionList.energyReading = energy);
            this.$energyDataValue.innerText = `${energy} Wh`;
        }
    }

    showErrorMessage(message) {
        this.$container.childNodes.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                child.style.display = "none";
            }
        });
        this.$errorMessage.style.display = "block";
        this.$errorMessageText.innerText = message;
    }

    async initGroupSelect() {
        try {
            const groupSelector = this._shadowRoot.getElementById('groupSelector');
            const groups = await this.getAllGroups();

            groupSelector.innerHTML = ''; // Clear loading option

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

            groupSelector.addEventListener('change', (e) => {
                console.log('Geselecteerde groep veranderd naar:', e.target.value);
                const selectedGroupId = e.target.value;
                this.$questionList.groupId = selectedGroupId;
                this.$questionList.fetchQuestions();
            })
        } catch (error) {
            this.showErrorMessage("Failed to fetch groups. Please try again later.");
        }
    }

    setUpGroupQuizPage() {
        this.groupSelectorContainer.remove();

        //remove group select from the page
        const bluetoothEnabled = JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
        if (!bluetoothEnabled) {
            // Create warning element instead of blocking access
            const warningDiv = document.createElement('div');
            warningDiv.id = 'bluetooth-warning';
            warningDiv.innerHTML = `
                <p class="warning-message">Bluetooth is niet ingeschakeld. Je kunt de quiz nog steeds gebruiken, maar zonder energiegegevens.</p>
            `;
            warningDiv.style.backgroundColor = '#ffcc00';
            warningDiv.style.padding = '10px';
            warningDiv.style.marginBottom = '15px';
            warningDiv.style.borderRadius = '5px';
            warningDiv.style.textAlign = 'center';

            // Insert warning at the top of the container
            this.$container.insertBefore(warningDiv, this.$container.firstChild);

            // Still set up energy display, but show a placeholder
            this.$energyDataValue.innerText = "Niet beschikbaar";
        }
        
        // Continue with quiz setup regardless of Bluetooth status
        this.$questionList && (this.$questionList.fetchQuestions());
    }

    //services
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
});
//#endregion CLASS