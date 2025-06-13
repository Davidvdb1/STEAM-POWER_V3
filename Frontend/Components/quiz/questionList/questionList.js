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
        <div class="question-list-container">
            Loading...
        </div>
       
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
        console.log("Fetching questions for group ID:", this._groupId);
        try {
            if (!this._groupId) throw new Error("Group ID is not set.");
            const response = await fetch(`${window.env.BACKEND_URL}/questions/group/${this._groupId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const activeQuestions = data.filter(question => { return question.active === true && question.energyType.toLowerCase() === this._energyContext; });

            this.initQuestions(activeQuestions);

        } catch (error) {
            //TODO: Handle error in the fronted
            console.error("Error fetching questions:", error);
        }
    }

    initQuestions(questionData) {
        const questionContainer = this.shadowRoot.querySelector(".question-list-container");
        questionContainer.innerHTML = ""; // Clear previous questions
        Object.values(questionData).forEach(content => {
            const question = document.createElement('quiz-question-れ');
            questionContainer.appendChild(question);

            question.energyContext = this._energyContext;
            question.groupId = this._groupId;
            question.initQuestion(content);
        });
    }


});
//#endregion CLASS