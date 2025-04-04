//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/questions/newQuestionModal/style.css';
    </style>
    <div class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modal-title">Add New Question</h2>
            <form id="new-question-form">

                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>

                <label for="description">Description:</label>
                <textarea id="description" name="description" required></textarea>

                <label for="wattage">Wattage:</label>
                <input type="number" id="wattage" name="wattage" required>


                <div class="picture-box">
                    <img id="picture-preview" src="" alt="Question Picture" />
                </div>
                <label for="picture">Picture:</label>
                <input type="file" id="picture" name="picture" required>

                <label for="score">Score:</label>
                <input type="number" id="score" name="score" required>

                <button id="submit-button">Save Question</button>
            </form>
        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('newquestionmodal-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['data-id', 'data-title', 'data-description', 'data-wattage', 'data-picture', 'data-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-title':
                this._shadowRoot.querySelector('#title').value = newValue;
                break;
            case 'data-description':
                this._shadowRoot.querySelector('#description').value = newValue;
                break;
            case 'data-wattage':
                this._shadowRoot.querySelector('#wattage').value = newValue;
                break;
            case 'data-picture':
                this._shadowRoot.querySelector('#picture-preview').src = newValue;
                break;
            case 'data-score':
                this._shadowRoot.querySelector('#score').value = newValue;
                break;
        }
    }

    connectedCallback() {
        this.$modal = this._shadowRoot.querySelector('.modal');
        this.$modalTitle = this._shadowRoot.querySelector('#modal-title');

        this.$modalTitle.textContent = this.hasAttribute("data-id") ? "Pas aan" : "Voeg toe"


        this.$close = this._shadowRoot.querySelector('.close');
        this.$submitButton = this._shadowRoot.querySelector('#submit-button');
        this.$form = this._shadowRoot.querySelector('#new-question-form');

        this.$close.addEventListener('click', () => {
            this.remove();
        });

        this.$submitButton.addEventListener('click', this.handleSubmit.bind(this));

        this.$pictureInput = this._shadowRoot.querySelector('input[type="file"]');
        this.$picturePreview = this._shadowRoot.querySelector('.picture-box img');

        this.$pictureInput.addEventListener('change', this.handlePicturePreview.bind(this));
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

    async handleSubmit(event) {
        event.preventDefault();
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
                this.dispatchEvent(new CustomEvent("question-modal:succes", {
                    bubbles: true,
                    composed: true
                }))
                this.remove();
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