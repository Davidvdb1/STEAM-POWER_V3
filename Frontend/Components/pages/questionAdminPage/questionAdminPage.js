//#region IMPORTS
import "../../questions/adminQuestionComponent/adminQuestionComponent.js"
import "../../questions/newQuestionModal/newQuestionModal.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/questionAdminPage/style.css';
    </style>
    <h1>Vragenlijst aanpassen</h1>
    <button id="add-question">Vraag toevoegen</button>
    <div id="questions-container"></div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('questionadmin-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$addQuestionButton = this._shadowRoot.querySelector("#add-question");
        this.$questionsContainer = this._shadowRoot.querySelector("#questions-container");

        this.$addQuestionButton.addEventListener('click', () => {
            const newQuestionModal = document.createElement("newquestionmodal-れ");
            this._shadowRoot.appendChild(newQuestionModal);
        });

        this.addEventListener("question-modal:succes", async () => {
            await this.fetchQuestions();
        })

        this.fetchQuestions();
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions`);
            const questions = await response.json();
            this.renderQuestions(questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    renderQuestions(questions) {
        this.$questionsContainer.innerHTML = '';
        questions.forEach(question => {
            const questionElement = document.createElement('adminquestioncomponent-れ');
            questionElement.setAttribute('data-id', question.id);
            questionElement.setAttribute('data-title', question.title);
            questionElement.setAttribute('data-description', question.description);
            questionElement.setAttribute('data-wattage', question.wattage);
            questionElement.setAttribute('data-score', question.score);
            questionElement.setAttribute('data-active', question.active);
            questionElement.addEventListener('edit', () => this.editQuestion(question));
            this.$questionsContainer.appendChild(questionElement);
        });
    }

    editQuestion(question) {
        const editQuestionModal = document.createElement("newquestionmodal-れ");
        editQuestionModal.setAttribute('data-id', question.id);
        editQuestionModal.setAttribute('data-title', question.title);
        editQuestionModal.setAttribute('data-description', question.description);
        editQuestionModal.setAttribute('data-wattage', question.wattage);
        editQuestionModal.setAttribute('data-image', question.image);
        editQuestionModal.setAttribute('data-score', question.score);
        editQuestionModal.setAttribute('data-active', question.active);
        this._shadowRoot.appendChild(editQuestionModal);
    }
});
//#endregion CLASS