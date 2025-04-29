//#region IMPORTS
import '../../quiz/questionList/questionList.js';
import '../../quiz/quizQuestionComponent/quizQuestionComponent.js';
import '../../quiz/answerFeedbackComponent/answerFeedbackComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/quizPage/style.css';
    </style>

    <div id="container">
        <div id="error-container">
            <p id="error-message-text"></p>
        </div>

        <div id="energy-context-select-container">
            <h2 id="energy-context-select-label">Energie bron:</h2>
            <div id="energy-context-select">
                <label for="wind"><input type="radio" id="wind-radio" name="power-source" value="wind" disabled>Wind</label>
                <label for="water"><input type="radio" id="water-radio" name="power-source" value="water" disabled>Water</label>
                <label for="solar"><input type="radio" id="solar-radio" name="power-source" value="solar" disabled>Zon</label>
            </div>
            <div id="energy-data-container">Opgewekte waarde:<span id="energy-data-value">loading...</span></div>
        </div>

        <div id="group-select">
            <label for="group">Groep:</label>
            <select id="group" name="group">
                <option value="" disabled selected>Loading...</option>
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

        this.energyContext = "wind";
        this.groupId = null;

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
            await this.initGroupSelect();
        } else if (role === "GROUP" && loggedInUser.groupId) {
            this.groupId = loggedInUser.groupId;
            await this.setUpGroupQuizPage();
        }
        return loggedInUser;
    }

    async connectedCallback() {
        if (!(await this.checkLogin())) return;

        this.setupEnergyReadingDisplay();

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

        console.log("testing ", energyType);

        // For test phase, track which sensors have been detected
        if (!this._testCompleted) {
            // If an energy type already has been detected, this would mean all active sensors should have been detected
            if (!this._detectedSensors.has(energyType)) {
                this._detectedSensors.add(energyType);

                const radioEl = this.shadowRoot.querySelector(`#${energyType}-radio`);
                if (radioEl) {
                    radioEl.disabled = false;
                    const labelEl = radioEl.closest('label');
                    if (labelEl) {
                        // reset label color to default
                        labelEl.style.color = 'inherit';
                    }
                    radioEl.addEventListener("change", (e) => {
                        this.energyContext = e.target.value;
                        this.$energyDataValue.innerText = "loading...";
                        this.$questionList && (this.$questionList.energyContext = this.energyContext);
                    });
                }
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

        console.log("Energy data reading:", energyType, data.value);

        // Actual processing and displaying of energy data
        if (energyType === this.energyContext) {
            console.log("Energy data reading for context:");
            let voltage = data.value / 341; // Convert to volts
            let power = voltage * 0.5; // Convert to watts (assuming 0.5A current)
            power = parseFloat(power.toFixed(3));
            this.$questionList && (this.$questionList.energyReading = power);
            this.$energyDataValue.innerText = `${power} W`;
        }
    }

    handleSomeEvent(data) {
        console.log("Event data:", data);
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
            const response = await fetch(`${window.env.BACKEND_URL}/groups`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const groups = await response.json();
            const groupSelect = this.shadowRoot.querySelector("#group");
            groupSelect.innerHTML = ""; // Clear existing options

            const defaultOption = document.createElement("option");
            defaultOption.selected = true;
            defaultOption.disabled = true;
            defaultOption.value = "";
            defaultOption.textContent = "Select a group";
            groupSelect.appendChild(defaultOption);

            groups.forEach(group => {
                const option = document.createElement("option");
                option.value = group.id;
                option.textContent = `Group ${group.name}`;
                groupSelect.appendChild(option);
            });

            groupSelect.addEventListener("change", (e) => {
                this.groupId = e.target.value;
                this.$questionList && (this.$questionList.groupId = this.groupId);
            });

            this.groupId = groupSelect.value;
            this.$questionList && (this.$questionList.groupId = this.groupId);

            this.$questionList.fetchQuestions()
        } catch (error) {
            this.showErrorMessage("Failed to fetch groups. Please try again later.");
        }
    }

    async setUpGroupQuizPage() {
        //remove group select from the page
        this.shadowRoot.querySelector("#group-select").style.display = "none";

        const bluetoothEnabled = true //JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
        if (!bluetoothEnabled) {
            this.showErrorMessage("Bluetooth is not enabled. Please enable Bluetooth to access this page.");
            return;
        }
    }

});
//#endregion CLASS