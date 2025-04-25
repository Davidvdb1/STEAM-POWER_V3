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
        <div id="error-container">
            <p id="error-message-text"></p>
        </div>

        <answer-feedback-component-れ width="800" height="200"></answer-feedback-component-れ>
        <div id="energy-context-select-container">
            <div id="energy-context-select">
                <label for="wind"><input type="radio" id="wind-radio" name="power-source" value="wind">Wind</label>
                <label for="water"><input type="radio" id="water-radio" name="power-source" value="water">Water</label>
                <label for="solar"><input type="radio" id="solar-radio" name="power-source" value="solar">Zon</label>
            </div>
            <div>Opgewekte waarde:<span id="energy-data-value">loading...</span></div>
        </div>
        <div id="group-select">
            <label for="group">Groep:</label>
            <select id="group" name="group">
                <option value="1">Groep 1</option>
                <option value="2">Groep 2</option>
                <option value="3">Groep 3</option>
            </select>
        </div>
        <question-list-れ></question-list-れ>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$container = null;
        this.$errorMessage = null;
        this.$errorMessageText = null;

        this.energyContext = "wind";
        this.groupId = null;

        // Initialize test counters for first three sensor events
        this._testEventCount = 0;
        this._testCompleted = false;

        // event <handlers></handlers>
        this.boundHandleEnergyDataReading = this.handleEnergyDataReading.bind(this);
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
            await this.initGroupSelect();
        } else if (role === "GROUP" && loggedInUser.groupId) {
            this.groupId = loggedInUser.groupId;
            await this.setUpGroupQuizPage();
        }
        return loggedInUser;
    }

    async connectedCallback() {
        this.$container = this.shadowRoot.querySelector("#container");
        this.$questionList = this.shadowRoot.querySelector("question-list-れ");
        this.$errorMessage = this.shadowRoot.querySelector("#error-container");
        this.$errorMessageText = this.shadowRoot.querySelector("#error-message-text");
        this.$errorMessage.style.display = "none";
        this.$energyDataValue = this.shadowRoot.querySelector("#energy-data-value");

        if (!(await this.checkLogin())) return;

        this.setupEnergyReadingDisplay();

        customElements.whenDefined('question-list-れ').then(() => {
            this.$questionList && (this.$questionList.groupId = this.groupId);
            this.$questionList && (this.$questionList.energyContext = this.energyContext);
        });

        this.addEventListener("update-error-indicator", (e) => {
            const error = e.detail.error;
            this.shadowRoot.querySelector("answer-feedback-component-れ")?.setAttribute("error", error);
        });
    }

    disconnectedCallback() {
        window.removeEventListener("energydatareading", this.boundHandleEnergyDataReading);
    }

    // Refactored: Replace individual radio setups with an array loop
    setupEnergySourceSelect() {
        const radios = [
            { selector: "#wind-radio", value: "wind" },
            { selector: "#water-radio", value: "water" },
            { selector: "#solar-radio", value: "solar" }
        ];
        radios.forEach(radio => {
            const radioEl = this.shadowRoot.querySelector(radio.selector);
            radioEl.checked = (this.energyContext === radio.value);
            radioEl.addEventListener("change", (e) => {
                this.energyContext = e.target.value;
                this.$energyDataValue.innerText = "loading...";
                this.$questionList && (this.$questionList.energyContext = this.energyContext);
            });
        });
    }

    setupEnergyReadingDisplay() {
        this.setupEnergySourceSelect();
        window.addEventListener("energydatareading", this.boundHandleEnergyDataReading);

    };

    handleEnergyDataReading(e) {
        const data = e.detail;
        const energyType = data.type.toLowerCase();
        console.log("Energy data reading:", data);
        // Update the corresponding radio element's disabled state and label color
        const radioEl = this.shadowRoot.querySelector(`#${energyType}-radio`);
        if (radioEl) {
            const disabled = (data.value === 0 || data.value == null);
            radioEl.disabled = disabled;
            const labelEl = radioEl.closest('label');
            if (labelEl) {
                labelEl.style.color = disabled ? 'grey' : '';
            }
        }

        // For first three events (test phase), do not update questionList energy reading
        if (!this._testCompleted) {
            this._testEventCount++;
            if (this._testEventCount === 3) {
                // Test complete: check if the currently selected radio is disabled; then select the first available sensor.
                const currentRadio = this.shadowRoot.querySelector(`#${this.energyContext}-radio`);
                if (currentRadio && currentRadio.disabled) {
                    const radioTypes = ["wind", "water", "solar"];
                    for (const type of radioTypes) {
                        const radio = this.shadowRoot.querySelector(`#${type}-radio`);
                        if (radio && !radio.disabled) {
                            this.energyContext = type;
                            radio.checked = true;
                            this.$questionList && (this.$questionList.energyContext = type);
                            break;
                        }
                    }
                }
                this._testCompleted = true;
                console.log("Test completed. Energy context set to:", this.energyContext);
                this.$questionList && (this.$questionList.testCompleted = true);

                // Logic to replace the event handler after the test phase
                // Might be useful to handle loading states
                // window.removeEventListener("energydatareading", this.boundHandleEnergyDataReading);
                // this.boundHandleEnergyDataReading = null;
                // this.boundHandleEnergyDataReading = this.handleSomeEvent.bind(this);
                // window.addEventListener("energydatareading", this.boundHandleEnergyDataReading);
            }
            return;
        }


        // Actual processing and displaying of energy data
        if (energyType === this.energyContext) {
            let voltage = data.value / 341; // Convert to volts
            let power = voltage * 0.5; // Convert to watts (assuming 0.5A current)
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