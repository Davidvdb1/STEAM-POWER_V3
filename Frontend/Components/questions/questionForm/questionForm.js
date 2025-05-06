//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/questions/questionForm/style.css';
    </style>
    <form id="new-question-form">
        <label for="title">Titel:</label>
        <input type="text" id="title" name="title" required>
        <span class="error-message" id="title-error"></span>

        <label for="description">Beschrijving:</label>
        <textarea id="description" name="description" required></textarea>
        <span class="error-message" id="description-error"></span>

        <div id="edit-question">
            <div id="edit-question-container" style="display: block">
                <label for="question-statement">Vraag:</label>
                <textarea id="question-statement" name="questionStatement" required></textarea>
                <span class="error-message" id="question-statement-error"></span>    
            </div>
        </div>

        <div id="create-questions">
            <h3>Vragen:</h3>

            <!-- Added general question field -->
            <div id="general-question-container" style="display: block">
                <label for="general-question">Algemene vraag:</label>
                <textarea id="general-question" name="generalQuestion" required></textarea>
                <span class="error-message" id="general-question-error"></span>    
            </div>

            <!-- Specific questions container, hidden by default -->
            <div id="specific-questions-container" style="display: none;">
                <label for="wind-question">Vraag voor windmolens:</label>
                <textarea id="wind-question" name="windQuestion"></textarea>
                <span class="error-message" id="wind-question-error"></span>
                <br>
                <label for="water-question">Vraag voor waterturbines:</label>
                <textarea id="water-question" name="waterQuestion"></textarea>
                <span class="error-message" id="water-question-error"></span>
                <br>
                <label for="solar-question">Vraag voor zonnepanelen:</label>
                <textarea id="solar-question" name="solarQuestion"></textarea>
                <span class="error-message" id="solar-question-error"></span>
            </div>

            
            <!-- Toggle button for specific questions -->
            <button type="button" id="toggle-specific-questions">Pas specifieke vragen aan</button>
        </div>

        <label for="wattage">Wattage:</label>
        <input type="number" id="wattage" name="wattage" min="0" required>
        <span class="error-message" id="wattage-error"></span>

        <label for="score">Score:</label>
        <input type="number" id="score" name="score" min="0" required>
        <span class="error-message" id="score-error"></span>

        <label for="max-tries">Aantal beurten (0=geen limiet):</label>
        <input type="number" id="max-tries" name="maxTries" min="0" required>
        <span class="error-message" id="max-tries-error"></span>

        <div class="picture-box">
            <img id="picture-preview" src="" alt="Question Picture" />
        </div>
        <label for="picture">Afbeelding:</label>
        <input type="file" id="picture" name="picture">
        <span class="error-message" id="picture-error"></span>

        <div class="response-error-message">Bliep Bloep</div>

        <button id="submit-button">Save Question</button>
    </form>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('newquestionform-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['data-id', 'data-title', 'data-description', 'data-question-statement', 'data-wattage', 'data-max-tries', 'data-picture', 'data-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-id':
                // if id is set, remove the create questions section and leave the edit question section
                this._shadowRoot.querySelector("#create-questions").remove();
            case 'data-title':
                this._shadowRoot.querySelector('#title').value = newValue;
                break;
            case 'data-description':
                this._shadowRoot.querySelector('#description').value = newValue;
                break;
            case 'data-question-statement':
                this._shadowRoot.querySelector('#question-statement').value = newValue;
                break;
            case 'data-wattage':
                this._shadowRoot.querySelector('#wattage').value = newValue;
                break;
            case 'data-picture':
                this._shadowRoot.querySelector('#picture-preview').src = newValue;
                break;
            case 'data-max-tries':
                this._shadowRoot.querySelector('#max-tries').value = newValue;
                break;
            case 'data-score':
                this._shadowRoot.querySelector('#score').value = newValue;
                break;
        }
    }

    connectedCallback() {
        this.$submitButton = this._shadowRoot.querySelector('#submit-button');
        this.$form = this._shadowRoot.querySelector('#new-question-form');

        this.$submitButton.addEventListener('click', this.handleSubmit.bind(this));

        this.$pictureInput = this._shadowRoot.querySelector('input[type="file"]');
        this.$picturePreview = this._shadowRoot.querySelector('.picture-box img');

        this.$pictureInput.addEventListener('change', this.handlePicturePreview.bind(this));

        // Make picture input required only if data-id is not set
        if (!this.hasAttribute('data-id')) {
            // if no id is set, remove the edit question section and leave the create questions section
            this.$pictureInput.setAttribute('required', 'required');
            this.shadowRoot.querySelector('#edit-question').remove();

            // Added general question listener
            this.$generalQuestionContainer = this._shadowRoot.querySelector("#general-question-container");
            this.$generalQuestion = this._shadowRoot.querySelector('#general-question');
            this.$generalQuestion.addEventListener('input', this.handleGeneralQuestion.bind(this));

            // Added toggle for specific questions container
            this.$toggleSpecific = this._shadowRoot.querySelector('#toggle-specific-questions');
            this.$specificContainer = this._shadowRoot.querySelector('#specific-questions-container');

            const isDisplayed = (el) => el.style.display === 'block';

            this.$toggleSpecific.addEventListener('click', () => {
                const specificQuestionEls = this.$specificContainer.querySelectorAll("textarea");
                if (!isDisplayed(this.$generalQuestionContainer)) {
                    this.$generalQuestionContainer.style.display = 'block';
                    this.$generalQuestion.setAttribute("required", "");
                    specificQuestionEls.forEach((el) => {
                        el.removeAttribute("required");
                    });
                    this.$specificContainer.style.display = 'none';
                    this.$toggleSpecific.textContent = "Pas specifieke vragen aan"
                } else {
                    this.$generalQuestionContainer.style.display = 'none';
                    this.$generalQuestion.removeAttribute("required");
                    specificQuestionEls.forEach((el) => {
                        el.setAttribute("required", "");
                    });
                    this.$specificContainer.style.display = 'block';
                    this.$toggleSpecific.textContent = "Pas algemene vraag aan"
                }
            });
        } else {
            this.$pictureInput.removeAttribute('required');
        }
    }

    handleGeneralQuestion(event) {
        const value = event.target.value;
        if (value.trim() !== '') {
            this._shadowRoot.querySelector('#wind-question').value = value;
            this._shadowRoot.querySelector('#water-question').value = value;
            this._shadowRoot.querySelector('#solar-question').value = value;
        }
    }

    handlePicturePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.$picturePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    validateForm() {
        let isValid = true;
        let fields = ['title', 'description', 'wattage', 'score', 'max-tries'];
        if (this.hasAttribute('data-id')) {
            fields = [...fields, 'question-statement'];
        }
        else if (this.$generalQuestionContainer.style.display === 'none') {
            fields = [...fields, 'wind-question', 'water-question', 'solar-question']
        } else {
            fields = [...fields, 'general-question']
        }
        console.log(fields);
        fields.forEach(field => {
            const input = this._shadowRoot.querySelector(`#${field}`);
            const errorMessage = this._shadowRoot.querySelector(`#${field}-error`);
            if (!input.checkValidity()) {
                errorMessage.textContent = input.validationMessage;
                isValid = false;
            } else {
                errorMessage.textContent = '';
            }
        });

        // Validate picture input only if required
        const pictureInput = this._shadowRoot.querySelector('#picture');
        const pictureErrorMessage = this._shadowRoot.querySelector('#picture-error');
        if (pictureInput.hasAttribute('required') && !pictureInput.checkValidity()) {
            pictureErrorMessage.textContent = pictureInput.validationMessage;
            isValid = false;
        } else {
            pictureErrorMessage.textContent = '';
        }

        return isValid;
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        const formData = new FormData(this.$form);
        const data = Object.fromEntries(formData.entries());

        if (this.$pictureInput.files.length > 0) {
            const file = this.$pictureInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                data.picture = e.target.result;
                await this.saveQuestion(data);
            };
            reader.readAsDataURL(file);
        } else {
            if (!this.hasAttribute('data-id')) {
                alert('Please upload an image.');
                return;
            }
            data.picture = this.getAttribute('data-picture'); // Ensure old picture is passed
            await this.saveQuestion(data);
        }
    }

    async saveQuestion(data) {
        const id = this.getAttribute('data-id');
        let url = `${window.env.BACKEND_URL}/questions`;
        const reqData = [];
        let method = "";

        if (id) {
            url += `/${id}`;
            method = 'PUT';
            reqData.push(data);
        } else {
            method = 'POST';

            const energyTypeToQuestionMapping = { "WIND": "windQuestion", "WATER": "waterQuestion", "SOLAR": "solarQuestion" };

            for (const [key, value] of Object.entries(energyTypeToQuestionMapping)) {
                reqData.push({
                    title: data.title,
                    description: data.description,
                    picture: data.picture,
                    wattage: data.wattage,
                    score: data.score,
                    maxTries: data.maxTries,
                    active: data.active,
                    energyType: key,
                    questionStatement: data[value]
                });
            }
        }

        console.log(reqData);

        try {
            for (const question of reqData) {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(question)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            this.dispatchEvent(new CustomEvent("question-form:succes", {
                bubbles: true,
                composed: true
            }));

        } catch (error) {
            console.error('Error saving question:', error);
            const errorMessage = this._shadowRoot.querySelector('.response-error-message');
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Error saving question: ' + error.message;
        }
    }
});
//#endregion CLASS