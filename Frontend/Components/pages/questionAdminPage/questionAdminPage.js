//#region IMPORTS
import "../../questions/adminQuestionComponent/adminQuestionComponent.js"
import "../../questions/newQuestionModal/newQuestionModal.js"
import "../../questions/modal/genericModal.js"
import "../../questions/questionForm/questionForm.js"
import "../../questions/confirmDeleteForm/confirmDeleteForm.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/questionAdminPage/style.css';
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

        this.$addQuestionButton.addEventListener('click', () => this.openQuestionModal());

        this.addEventListener("confirm-delete", (e) => this.deleteQuestion(e.detail.id))

        this.addEventListener("question-form:succes", async () => {

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
            questionElement.setAttribute('data-wind-question', question.windQuestion);
            questionElement.setAttribute('data-water-question', question.waterQuestion);
            questionElement.setAttribute('data-solar-question', question.solarQuestion);
            questionElement.setAttribute('data-max-tries', question.maxTries);
            questionElement.setAttribute('data-wattage', question.wattage);
            questionElement.setAttribute('data-score', question.score);
            questionElement.setAttribute('data-active', question.active);
            questionElement.setAttribute('data-picture', question.picture); // Add this line
            questionElement.addEventListener('edit', () => this.openQuestionModal(question));
            questionElement.addEventListener('request-delete', () => this.openDeleteQuestionModal(question.id));
            this.$questionsContainer.appendChild(questionElement);
        });
    }

    async deleteQuestion(id) {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await this.fetchQuestions();
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    }

    openDeleteQuestionModal(id) {
        const confirmationModal = document.createElement("generic-modal-れ");
        const confirmationForm = document.createElement("confirmQuestionDeleteForm-れ");
        confirmationForm.setAttribute("id", id);
        this._shadowRoot.appendChild(confirmationModal);

        confirmationModal.addEventListener("confirm-delete", () => confirmationModal.remove());
        confirmationModal.addEventListener("cancel-delete", () => confirmationModal.remove());

        confirmationModal.setTitle("Ben je zeker?")
        confirmationModal.setBody(confirmationForm);
    }

    openQuestionModal(question) {
        const questionModal = document.createElement("generic-modal-れ");
        const questionForm = document.createElement("newquestionform-れ");
        this._shadowRoot.appendChild(questionModal);

        questionModal.setTitle("Voeg vraag toe");
        if (question) {
            questionModal.setTitle("Pas vraag aan");

            questionForm.setAttribute('data-id', question.id);
            questionForm.setAttribute('data-title', question.title);
            questionForm.setAttribute('data-description', question.description);
            questionForm.setAttribute('data-wind-question', question.windQuestion);
            questionForm.setAttribute('data-water-question', question.waterQuestion);
            questionForm.setAttribute('data-solar-question', question.solarQuestion);
            questionForm.setAttribute('data-max-tries', question.maxTries);
            questionForm.setAttribute('data-wattage', question.wattage);
            questionForm.setAttribute('data-score', question.score);
            questionForm.setAttribute('data-active', question.active);
            questionForm.setAttribute('data-picture', question.picture);
        }

        questionModal.setBody(questionForm);

        questionModal.addEventListener("question-form:succes", async () => {
            setTimeout(() => questionModal.close(), 1000);
        });
    }

    editQuestion(question) {
        const editQuestionModal = document.createElement("newquestionmodal-れ");
        editQuestionModal.setAttribute('data-id', question.id);
        editQuestionModal.setAttribute('data-title', question.title);
        editQuestionModal.setAttribute('data-description', question.description);
        editQuestionModal.setAttribute('data-wind-question', question.windQuestion);
        editQuestionModal.setAttribute('data-water-question', question.waterQuestion);
        editQuestionModal.setAttribute('data-solar-question', question.solarQuestion);
        editQuestionModal.setAttribute('data-max-tries', question.maxTries);
        editQuestionModal.setAttribute('data-wattage', question.wattage);
        editQuestionModal.setAttribute('data-score', question.score);
        editQuestionModal.setAttribute('data-active', question.active);
        editQuestionModal.setAttribute('data-picture', question.picture); // Add this line
        this._shadowRoot.appendChild(editQuestionModal);
    }

    addQuestion() {
        const newQuestionModal = document.createElement("generic-modal-れ");
        const newQuestionForm = document.createElement("newquestionform-れ");
        this._shadowRoot.appendChild(newQuestionModal);
        newQuestionModal.setTitle("Voeg vraag toe");
        newQuestionModal.setBody(newQuestionForm);
        newQuestionModal.addEventListener("question-form:succes", async () => {
            newQuestionModal.close();
        });
    }
});
//#endregion CLASS