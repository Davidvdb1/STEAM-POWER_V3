//#region IMPORTS
import "../../quiz/quizQuestionComponent/quizQuestionComponent.js";
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/quizGame/style.css';
    </style>

    <div id="container">
        <div id="information-panel">
            <div id="energy-source-panel">
                <p>Huidig vermogen: <span id="energy"></span>W</p>
            </div>
            <div id="score-feedback-panel">
            
            </div>
        </div>
        <div id="question-container">

        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quizgame-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.powerSource;

        // this should be coming from the microbit
        this._currentPowerGenerated = 20;

        this.questions = [];
        this.scores = {};

        this.errorMargin = 0.05;
    }

    set currentPowerGenerated(value) {
        this._currentPowerGenerated = value;
        this.$currentPowerGeneratedText.textContent = value;
    }

    get currentPowerGenerated() {
        return this._currentPowerGenerated;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$questionContainer = this.shadowRoot.querySelector("#question-container");
        this.$feedbackPanel = this.shadowRoot.querySelector("#score-feedback-panel");
        this.$currentPowerGeneratedText = this.shadowRoot.querySelector("#energy");

        setTimeout(this.updateCurrentPower.bind(this), 500);

        this.currentQuestionIndex = 0;
        this.maxAttempts = 3; // Set the maximum number of attempts
        this.currentAttempts = 0;

        this.showQuestion();
    }


    updateCurrentPower() {
        this.currentPowerGenerated = Math.floor(Math.random() * (750 - 700)) + 700;
        setTimeout(this.updateCurrentPower.bind(this), 500);
    }

    showQuestion() {
        this.$questionContainer.innerHTML = "";

        const question = this.questions[this.currentQuestionIndex];
        const quizQuestion = document.createElement("quiz-question-れ");
        quizQuestion.setAttribute("data-id", question.id);
        quizQuestion.setAttribute("data-title", question.title);
        quizQuestion.setAttribute("data-description", question.description);
        quizQuestion.setAttribute("data-wattage", question.wattage);
        quizQuestion.setAttribute("data-picture", question.picture);
        quizQuestion.setAttribute("data-actual-question", this.generateQuestion());

        quizQuestion.addEventListener("submit-answer", this.handleAnswer.bind(this));

        this.$questionContainer.appendChild(quizQuestion);
    }

    generateQuestion() {
        let powerSupplyText = '';

        switch (this.powerSource) {
            case "water":
                powerSupplyText = "waterturbines"
                break;
            case "wind":
                powerSupplyText = "windmolens"
                break;
            case "solar":
                powerSupplyText = "zonnepanelen"
                break;
        }

        return `Hoeveel ${powerSupplyText} hebben we nodig om dit aan te sturen?`
    }

    handleAnswer(event) {
        const userAnswer = event.detail.answer;
        const correctAnswer = (this.currentPowerGenerated / this.questions[this.currentQuestionIndex].wattage);

        const { isCorrect, error } = this.validateAnswer(userAnswer, correctAnswer, this.errorMargin);

        if (isCorrect) {
            this.$feedbackPanel.innerText = "Correct!";
            this.scores[this.currentQuestionIndex] = error * this.questions[this.currentQuestionIndex].score;
            console.log(`
                    error on answer: ${error}
                    0.05 - error on answer: ${0.05 - error}
                    0.05 - error * score: ${(0.05 - error) * this.questions[this.currentQuestionIndex].score}
                    max points for question: ${this.questions[this.currentQuestionIndex].score}
                    calculated end score (idk why): ${this.scores[this.currentQuestionIndex]}
                `);
            this.moveToNextQuestion();
        } else {
            this.currentAttempts++;
            if (this.currentAttempts >= this.maxAttempts) {
                this.$feedbackPanel.innerText = `Incorrect! The correct answer was: ${correctAnswer}`;
                this.scores[this.currentQuestionIndex] = 0;
                this.moveToNextQuestion();
            } else {
                this.$feedbackPanel.innerText = `Incorrect! You have ${this.maxAttempts - this.currentAttempts} attempts left. Error: ${error}`;
            }
        }
    }

    validateAnswer(userAnswer, correctAnswer, errorMargin) {
        const error = Math.abs((correctAnswer - userAnswer) / correctAnswer);

        const isCorrect = error <= errorMargin;

        return { isCorrect, error }
    }

    moveToNextQuestion() {
        this.currentAttempts = 0;
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
            this.dispatchEvent(new CustomEvent("quizgame:endquiz", {
                bubbles: true,
                composed: true,
                detail: {
                    scores: this.scores
                }
            }));
        } else {
            this.showQuestion();
        }
    }
});
//#endregion CLASS