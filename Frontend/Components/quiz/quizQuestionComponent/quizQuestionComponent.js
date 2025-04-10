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

        this._questions = {}
        this._energyContext = null;
        this.$actualQuestion = this.shadowRoot.querySelector("#actual-question")
        this._id = null;
    }

    set energyContext(value) {
        this._energyContext = value;

        this.$actualQuestion.innerText = this._questions[this._energyContext];
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


        this.$submitAnswerButton.addEventListener("click", async () => {
            const answer = this.$answerInput.value;
            this.dispatchEvent(new CustomEvent("submit-answer", {
                detail: { answer },
                bubbles: true,
                composed: true
            }));

            await this.handleSubmitAnswer(answer);
        });
    }

    async handleSubmitAnswer(answer) {
        const mockEnergyReading = 50; // Mock energy reading value

        console.log(answer === "" ? 0 : answer);

        try {
            const groupId = JSON.parse(sessionStorage.getItem("loggedInUser")).groupId;
            const response = await fetch(`${window.env.BACKEND_URL}/questions/${this._id}/answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    groupId,
                    answerValue: answer === "" ? 0 : answer,
                    energyReading: mockEnergyReading
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("data", data);

            this.initQuestion(data);
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
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

    initQuestion({ id, isSolved, answerCount, maxTries, wattage, title, description, picture, windQuestion, solarQuestion, waterQuestion }) {
        this._id = id;

        if (isSolved) {
            this.disableInput();
            this.shadowRoot.querySelector(".container").classList.add("solved");
        }

        if (answerCount >= maxTries && !isSolved) {
            this.disableInput();
            this.shadowRoot.querySelector(".container").classList.add("incorrect");
        }

        this.shadowRoot.querySelector("#wattage").innerText = wattage;
        this.shadowRoot.querySelector("#title").innerText = title;
        this.shadowRoot.querySelector("#description").innerText = description;
        this.shadowRoot.querySelector("#picture").src = picture;
        this.currentAttempts = answerCount;
        this.maxAttempts = maxTries;

        this.shadowRoot.querySelector("#attempts-counter").innerText = `Pogingen: ${answerCount}/${maxTries}`;

        this._questions = {
            "wind": windQuestion,
            "solar": solarQuestion,
            "water": waterQuestion
        }

        this.$actualQuestion.innerText = this._questions[this._energyContext];

    }

});
//#endregion CLASS