//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/quizQuestionComponent/style.css';
    </style>

    <div class="container">
        <div class="description-container">
            <div class="image-box">
                <img id="picture" src="" alt="Question Image" />
            </div>
            <div class="text-content">
                <div class="title" id="title"></div>
                <div class="description" id="description"></div>
            </div>
            <div>
                <div>P = <span id="wattage"></span>W</div>
            </div>
        </div>
        

        <div id="answer-input-container">
            <span id="actual-question">Hoeveel hebben we nodig?</span>
            <label for="answer">
                <input type="text">
            </label>
            <button id="submit-answer">Antwoord</button>
        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-question-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['data-id', 'data-title', 'data-description', 'data-wattage', 'data-picture', 'data-actual-question'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-title':
                this._shadowRoot.querySelector('#title').innerText = newValue;
                break;
            case 'data-description':
                this._shadowRoot.querySelector('#description').innerText = newValue;
                break;
            case 'data-wattage':
                this._shadowRoot.querySelector('#wattage').innerText = newValue;
                break;
            case 'data-score':
                this._shadowRoot.querySelector('#score').innerText = newValue;
                break;
            case 'data-active':
                this.$toggleActive.checked = newValue === "false" ? false : true;
                break;
            case 'data-picture':
                this._shadowRoot.querySelector('#picture').src = newValue;
                break;
            case 'data-actual-question':
                this._shadowRoot.querySelector('#actual-question').innerText = newValue;
                break;
        }
    }
    connectedCallback() {
        this.$submitAnswerButton = this._shadowRoot.querySelector("#submit-answer");
        this.$answerInput = this._shadowRoot.querySelector("input[type='text']");

        this._maxAttempts = 3; // Set the maximum number of attempts
        this._currentAttempts = 0;

        this.$submitAnswerButton.addEventListener("click", () => {
            const answer = this.$answerInput.value;
            this.dispatchEvent(new CustomEvent("submit-answer", {
                detail: { answer },
                bubbles: true,
                composed: true
            }));
        });
    }

    set currentAttempts(value) {
        this._currentAttempts = value;

        if (this._currentAttempts >= this._maxAttempts) {
            this.disableInput();
        }
    }

    get currentAttempts() {
        return this._currentAttempts;
    }

    set maxAttempts(value) {
        this._maxAttempts = value;
    }

    get maxAttempts() {
        return this._maxAttempts;
    }

    disableInput() {
        console.log("Input disabled");
        this.$answerInput.disabled = true;
        this.$submitAnswerButton.disabled = true;
    }



});
//#endregion CLASS