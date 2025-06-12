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


        this.energyContext = "wind";
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

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


        customElements.whenDefined('question-list-れ').then(() => {
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
        
        // Update the radio button state
        this.$windRadio.checked = this.energyContext === "wind";
        this.$waterRadio.checked = this.energyContext === "water";
        this.$solarRadio.checked = this.energyContext === "solar";
        
        this.$questionList.energyContext = this.energyContext;
    }
});
//#endregion CLASS