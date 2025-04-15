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
});
//#endregion CLASS