//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/questions/questionForm/style.css';
    </style>
            <form id="new-question-form">
                <label for="title">Titel:</label>
                <input type="text" id="title" name="title" required>
                <span class="error-message" id="title-error"></span>

                <label for="description">Beschrijving:</label>
                <textarea id="description" name="description" required></textarea>
                <span class="error-message" id="description-error"></span>

                <label for="wind-question">Vraag voor windmolens:</label>
                <textarea id="wind-question" name="windQuestion" required></textarea>
                <span class="error-message" id="wind-question-error"></span>

                <label for="water-question">Vraag voor waterturbines:</label>
                <textarea id="water-question" name="waterQuestion" required></textarea>
                <span class="error-message" id="water-question-error"></span>

                <label for="solar-question">Vraag voor zonnepanelen:</label>
                <textarea id="solar-question" name="solarQuestion" required></textarea>
                <span class="error-message" id="solar-question-error"></span>

                <label for="wattage">Wattage:</label>
                <input type="number" id="wattage" name="wattage" min="0" required>
                <span class="error-message" id="wattage-error"></span>

                <label for="score">Score:</label>
                <input type="number" id="score" name="score" min="0" required>
                <span class="error-message" id="score-error"></span>

                <label for="no-tries">Aantal beurten (0=geen limiet):</label>
                <input type="number" id="no-tries" name="maxTries" min="0" required>
                <span class="error-message" id="no-tries-error"></span>

                <div class="picture-box">
                    <img id="picture-preview" src="" alt="Question Picture" />
                </div>
                <label for="picture">Afbeelding:</label>
                <input type="file" id="picture" name="picture">
                <span class="error-message" id="picture-error"></span>

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
        return ['data-id', 'data-title', 'data-description', 'data-wind-question', 'data-water-question', 'data-solar-question', 'data-wattage', 'data-max-tries', 'data-picture', 'data-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-title':
                this._shadowRoot.querySelector('#title').value = newValue;
                break;
            case 'data-description':
                this._shadowRoot.querySelector('#description').value = newValue;
                break;
            case 'data-wind-question':
                this._shadowRoot.querySelector('#wind-question').value = newValue;
                break;
            case 'data-water-question':
                this._shadowRoot.querySelector('#water-question').value = newValue;
                break;
            case 'data-solar-question':
                this._shadowRoot.querySelector('#solar-question').value = newValue;
                break;
            case 'data-wattage':
                this._shadowRoot.querySelector('#wattage').value = newValue;
                break;
            case 'data-picture':
                this._shadowRoot.querySelector('#picture-preview').src = newValue;
                break;
            case 'data-max-tries':
                this._shadowRoot.querySelector('#no-tries').value = newValue;
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
            this.$pictureInput.setAttribute('required', 'required');
        } else {
            this.$pictureInput.removeAttribute('required');
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
        const fields = ['title', 'description', 'wind-question', 'water-question', 'solar-question', 'wattage', 'score'];
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
        const method = id ? 'PUT' : 'POST';
        const url = `${window.env.BACKEND_URL}/questions${id ? `/${id}` : ''}`;

        console.log(data);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent("question-form:succes", {
                    bubbles: true,
                    composed: true
                }))
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error saving question:', error);
        }
    }
});
//#endregion CLASS