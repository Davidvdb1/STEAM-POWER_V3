//#region IMPORTS
import '../quizQuestionComponent/quizQuestionComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/quiz/questionList/style.css';
    </style>

    <div id="container">
        Loading...
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('question-list-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._energyContext = null;
        this._energyReading = null;

        this._groupId = null;

    }

    set groupId(value) {
        this._groupId = value;
        this.fetchQuestions();
    }

    set energyContext(value) {
        this._energyContext = value;
        const container = this.shadowRoot.querySelector("#container");
        container.querySelectorAll("quiz-question-れ").forEach(question => {
            question.energyContext = value;
        });
    }

    set energyReading(value) {
        this._energyReading = value;
        const container = this.shadowRoot.querySelector("#container");
        container.querySelectorAll("quiz-question-れ").forEach(question => {
            question.energyReading = value;
        });
    }

    get energyContext() {
        return this._energyContext;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions/group/${this._groupId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            this.initQuestions(data);

        } catch (error) {
            //TODO: Handle error in the fronted
            console.error("Error fetching questions:", error);
        }
    }

    initQuestions(questionData) {
        const container = this.shadowRoot.querySelector("#container");
        container.innerHTML = ""; // Clear previous questions
        Object.values(questionData).forEach(content => {
            const question = document.createElement('quiz-question-れ');
            container.appendChild(question);

            question.energyContext = this._energyContext;
            question.groupId = this._groupId;
            question.initQuestion(content);
        });
    }

});
//#endregion CLASS