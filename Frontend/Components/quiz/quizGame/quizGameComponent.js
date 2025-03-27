//#region IMPORTS
import "../../quiz/quizQuestionComponent/quizQuestionComponent.js";
import "../../quiz/answerFeedBackComponent/answerFeedbackComponent.js";
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
                <span id="score-feedback-text"></span>
                <answer-feedback-component-れ></answer-feedback-component-れ>
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
        this.$feedbackText = this.shadowRoot.querySelector("#score-feedback-text");
        this.$currentPowerGeneratedText = this.shadowRoot.querySelector("#energy");
        this.$answerFeedback = this.shadowRoot.querySelector("answer-feedback-component-れ");
        setTimeout(this.updateCurrentPower.bind(this), 500);
        this.currentQuizQuestion = null;

        this.currentQuestionIndex = 0;

        this.showQuestion();
    }


    updateCurrentPower() {
        this.currentPowerGenerated = Math.floor(Math.random() * (750 - 700)) + 700;
        setTimeout(this.updateCurrentPower.bind(this), 500);
    }

    showQuestion() {
        this.$questionContainer.innerHTML = "";

        const question = this.questions[this.currentQuestionIndex];
        this.currentQuizQuestion = document.createElement("quiz-question-れ");
        this.currentQuizQuestion.setAttribute("data-id", question.id);
        this.currentQuizQuestion.setAttribute("data-title", question.title);
        this.currentQuizQuestion.setAttribute("data-description", question.description);
        this.currentQuizQuestion.setAttribute("data-wattage", question.wattage);
        this.currentQuizQuestion.setAttribute("data-picture", question.picture);
        this.currentQuizQuestion.setAttribute("data-actual-question", this.generateQuestion());

        this.currentQuizQuestion.addEventListener("submit-answer", this.handleAnswer.bind(this));

        this.$questionContainer.appendChild(this.currentQuizQuestion);
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
            this.$feedbackText.style.color = "green";
            this.$feedbackText.innerText = "Correct!";
            this.$answerFeedback.error = error;
            this.scores[this.currentQuestionIndex] = this.questions[this.currentQuestionIndex].score;
            this.moveToNextQuestion();
        } else {
            this.currentQuizQuestion.currentAttempts++;
            if (this.currentQuizQuestion.currentAttempts >= this.currentQuizQuestion.maxAttempts) {
                //this.$feedbackPanel.innerText = `Incorrect! The correct answer was: ${correctAnswer}`; 
                this.$answerFeedback.error = error;
                this.scores[this.currentQuestionIndex] = 0;
                this.moveToNextQuestion();
            } else {
                this.$feedbackText.style.color = "red";
                this.$feedbackText.innerText = `Incorrect! You have ${this.currentQuizQuestion.maxAttempts - this.currentQuizQuestion.currentAttempts} attempts left.`;
                this.$answerFeedback.error = error;
            }
        }
    }

    validateAnswer(userAnswer, correctAnswer, errorMargin) {
        const error = ((userAnswer - correctAnswer) / correctAnswer);

        const isCorrect = Math.abs(error) <= errorMargin;

        return { isCorrect, error }
    }

    moveToNextQuestion() {
        this.currentQuestionIndex++;
        this.currentQuizQuestion.disableInput();

        setTimeout(() => {
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
        }, 2000);

    }
});
//#endregion CLASS