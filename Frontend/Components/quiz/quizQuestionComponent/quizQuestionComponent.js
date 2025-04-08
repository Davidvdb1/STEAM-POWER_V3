//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/quizQuestionComponent/style.css';
    </style>

    <div class="container">
        <span id="attempts-counter"></span>
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
            <span id="actual-question"></span>

            <div id="input-container">
                
                <label for="answer">
                    <input type="text">
                </label>
                <button id="submit-answer">Antwoord</button>
            </div>
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

        this.questions = {}
        this._energyContext = null;
    }

    set energyContext(value) {
        this._energyContext = value;

        this.shadowRoot.querySelector("#actual-question").textContent = this.questions[this._energyContext];
    }

    // component attributes
    static get observedAttributes() {
        return []
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }
    connectedCallback() {
        this.$submitAnswerButton = this._shadowRoot.querySelector("#submit-answer");
        this.$answerInput = this._shadowRoot.querySelector("input[type='text']");

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
        if (this._maxAttempts > 0) {
            this._currentAttempts = value;


            if (this._currentAttempts >= this._maxAttempts) {
                this.disableInput();
            }
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

    initQuestion(data) {
        if (data.isSolved) {
            this.disableInput();
            this.shadowRoot.querySelector(".container").classList.add("solved");
        }

        if (data.answerCount > data.maxTries) {
            this.disableInput();
            this.shadowRoot.querySelector(".container").classList.add("incorrect");
        }




        this.shadowRoot.querySelector("#wattage").innerText = data.wattage;
        this.shadowRoot.querySelector("#title").innerText = data.title;
        this.shadowRoot.querySelector("#description").innerText = data.description;
        this.shadowRoot.querySelector("#picture").src = data.picture;
        this.shadowRoot.querySelector("#attempts-counter").innerText = `Pogingen: ${data.answerCount}/${data.maxTries}`;

        this.questions = {
            "wind": data.windQuestion,
            "solar": data.solarQuestion,
            "water": data.waterQuestion
        }

        this.shadowRoot.querySelector("#actual-question").innerText = this.questions[this._energyContext];

    }

    selectQuestion(data) {
        switch (this._energyContext) {
            case wind:
                return data.windQuestion;
            case solar:
                return data.solarQuestion;
            case water:
                return data.waterQuestion;
        }
    }

});
//#endregion CLASS