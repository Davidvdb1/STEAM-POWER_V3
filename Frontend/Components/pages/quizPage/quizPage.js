//#region IMPORTS
import '../../quiz/quizMenu/quizMenuComponent.js';
import '../../quiz/quizGame/quizGameComponent.js';
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/quizPage/style.css';
    </style>

    <div id="container">
        <quizmenu-れ></quizmenu-れ>
    </div>
    
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$container = this.shadowRoot.querySelector("#container");

        this.powerSource = "";


    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.addEventListener("quizmenu:startquiz", this.handleQuizStart.bind(this));
        this.addEventListener("quizgame:endquiz", this.handleQuizEnd.bind(this));
    }

    handleQuizStart(e) {
        this.powerSource = e.detail.powerSource;

        this.startQuiz();
    }

    handleQuizEnd(e) {
        this.endScores = e.detail.scores;

        this.endQuiz();
    }

    async endQuiz() {
        const quizEndElement = document.createElement("h1");
        quizEndElement.innerText = { ...this.endScores };

        this.$container.innerHTML = "";
        this.$container.appendChild(quizEndElement);
    }

    async startQuiz() {
        const quizGameElement = document.createElement("quizgame-れ");
        quizGameElement.powerSource = this.powerSource;

        quizGameElement.questions = await this.fetchQuestions();

        this.$container.innerHTML = "";
        this.$container.appendChild(quizGameElement);
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions`);

            if (!response.ok)
                throw new Error;


            return response.json();
        } catch (error) {
            alert("could not fetch data from backend");
        }
    }

});
//#endregion CLASS