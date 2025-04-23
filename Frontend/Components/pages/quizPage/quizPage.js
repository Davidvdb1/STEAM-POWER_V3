//#region IMPORTS
import '../../quiz/questionList/questionList.js';
import '../../quiz/quizQuestionComponent/quizQuestionComponent.js';
import '../../quiz/answerFeedBackComponent/answerFeedbackComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/quizPage/style.css';
    </style>

    <div id="container">
        <answer-feedback-component-れ width="800" height="200"></answer-feedback-component-れ>
        <div id="energy-context-select-container">
            <label for="wind"><input type="radio" id="wind-radio" name="power-source" value="wind">Wind</label>
            <label for="water"><input type="radio" id="water-radio" name="power-source" value="water">Water</label>
            <label for="solar"><input type="radio" id="solar-radio" name="power-source" value="solar">Zon</label>
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

        this.energyContext = "wind";
        this.groupId = null;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    async connectedCallback() {
        this.$container = this.shadowRoot.querySelector("#container");

        const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
            this.$container.innerHTML = `
                <div class="error-message"> 
                    <p>You are not logged in. Please log in to use this feature.</p>
                </div>`
            return;
        }

        const role = loggedInUser.role;
        if (role === "ADMIN" || role === "TEACHER") {
            await this.setUpAdminQuizPage();
        } else if (role === "GROUP") {
            this.groupId = loggedInUser.groupId;
        }

        // const bluetoothEnabled = JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
        // if (!bluetoothEnabled) {
        //     this.shadowRoot.querySelector("#container").innerHTML = `
        //         <div class="error-message">
        //             <p>Bluetooth is not enabled. Please enable Bluetooth to use this feature.</p>
        //         </div>`
        //     return;
        // }

        this.$questionList = this.shadowRoot.querySelector("question-list-れ");

        this.$windRadio = this.shadowRoot.querySelector("#wind-radio");
        this.$waterRadio = this.shadowRoot.querySelector("#water-radio");
        this.$solarRadio = this.shadowRoot.querySelector("#solar-radio");
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

        this.$windRadio.addEventListener("change", this.handlePowerSourceChange.bind(this));
        this.$waterRadio.addEventListener("change", this.handlePowerSourceChange.bind(this));
        this.$solarRadio.addEventListener("change", this.handlePowerSourceChange.bind(this));


        customElements.whenDefined('question-list-れ').then(() => {
            this.$questionList.groupId = this.groupId;
            this.$questionList.energyContext = this.energyContext;
        });

        this.addEventListener("update-error-indicator", (e) => {
            const error = e.detail.error;
            const $answerFeedbackComponent = this.shadowRoot.querySelector("answer-feedback-component-れ");
            $answerFeedbackComponent.setAttribute("error", error);
        });
    }

    handlePowerSourceChange(e) {
        this.energyContext = e.target.value;
        this.$questionList.energyContext = this.energyContext;
    }

    async setUpAdminQuizPage() {
        const response = await fetch(`${window.env.BACKEND_URL}/groups`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const groups = data;;

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
            this.$questionList.groupId = this.groupId;
        });


    }

});
//#endregion CLASS