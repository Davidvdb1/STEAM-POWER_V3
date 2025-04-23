//#region IMPORTS
import '../quizQuestionComponent/quizQuestionComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/questionList/style.css';
    </style>

    <div id="container">
    
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

        this._groupId = null;
    }

    set groupId(value) {
        this._groupId = value;
        this.fetchQuestions();
    }

    set energyContext(value) {
        this._energyContext = value;

        this.shadowRoot.querySelectorAll("quiz-question-れ").forEach((question) => {
            question.energyContext = value;
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
        this.groupId = JSON.parse(sessionStorage.getItem("loggedInUser")).groupId;
        this.fetchQuestions();
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions/group/${this._groupId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log("data", data);

            this.initQuestions(data);

        } catch (error) {
            //TODO: Handle error in the fronted
            console.error("Error fetching questions:", error);
        }
    }

    initQuestions(questionData) {
        for (let key in questionData) {
            const question = document.createElement('quiz-question-れ');
            this.shadowRoot.querySelector("#container").appendChild(question);

            question.energyContext = this._energyContext;
            question.groupId = this._groupId;
            question.initQuestion(questionData[key]);
        }
    }

});
//#endregion CLASS