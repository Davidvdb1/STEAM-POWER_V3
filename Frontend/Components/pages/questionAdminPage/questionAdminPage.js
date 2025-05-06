//#region IMPORTS
import "../../questions/adminQuestionComponent/adminQuestionComponent.js"
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
    <div id="top-controls">
        <button id="add-question">Vraag toevoegen</button>
        <div>
            <label for="errorMargin">Foutmarge (%): </label>
            <input name="errorMargin" id="error-margin-input" type="number" step="0.01" min="0" max="1">
            <button id="confirmUpdateErrorMargin" class="hidden">Bevestig</button>
        </div>
    </div>
    <div id="questions-container"></div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('questionadmin-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.originalErrorMargin = null;
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
        this.$errorMarginInput = this._shadowRoot.querySelector("#error-margin-input");
        this.$confirmUpdateErrorMarginButton = this._shadowRoot.querySelector("#confirmUpdateErrorMargin");

        this.$addQuestionButton.addEventListener('click', () => this.openQuestionModal());

        this.addEventListener("confirm-delete", (e) => this.deleteQuestion(e.detail.id))

        this.addEventListener("question-form:succes", async () => {
            await this.fetchQuestions();
        })

        this.fetchQuestions();

        this.$errorMarginInput.addEventListener("change", (e) => {
            const currentValue = parseFloat(e.target.value); 
            this.$confirmUpdateErrorMarginButton.classList.toggle("hidden", currentValue === this.originalErrorMargin);
        });

        this.$confirmUpdateErrorMarginButton.addEventListener("click", async () => {
            const newErrorMargin = parseFloat(this.$errorMarginInput.value);
            if (isNaN(newErrorMargin)) {
                alert("Foutmarge moet een getal zijn.");
                return;
            }

            try {
                const response = await fetch(`${window.env.BACKEND_URL}/questions/errormargin`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ errorMargin: newErrorMargin })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                this.originalErrorMargin = newErrorMargin; // Update the original error margin
                this.$confirmUpdateErrorMarginButton.classList.add("hidden");
            } catch (error) {
                console.error('Error updating error margin:', error);
            }
        });
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions`);

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const questions = await response.json();

            this.originalErrorMargin = questions[0].errorMargin; // Store the current error margin
            this.$errorMarginInput.value = this.originalErrorMargin; // Set the error margin input value to the first question's error margin


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
            questionElement.setAttribute('data-question-statement', question.questionStatement);
            questionElement.setAttribute('data-energy-type', question.energyType);
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
            questionForm.setAttribute('data-question-statement', question.questionStatement);
            questionForm.setAttribute('data-max-tries', question.maxTries);
            questionForm.setAttribute('data-wattage', question.wattage);
            questionForm.setAttribute('data-score', question.score);
            questionForm.setAttribute('data-active', question.active);
            questionForm.setAttribute('data-picture', question.picture);
        }

        questionModal.setBody(questionForm);

        questionModal.addEventListener("question-form:succes", async () => {
            questionModal.close();
        });
    }
});
//#endregion CLASS