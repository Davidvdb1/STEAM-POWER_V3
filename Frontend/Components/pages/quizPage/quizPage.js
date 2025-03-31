//#region IMPORTS
import '../../quiz/quizMenu/quizMenuComponent.js';
import '../../quiz/quizGame/quizGameComponent.js';
import '../../quiz/quizEndScreen/quizEndScreenComponent.js';
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
        this.loggedInGroupId = "";


    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

        this.loggedInGroupId = JSON.parse(sessionStorage.getItem('loggedInUser')).groupId;
        console.log(this.loggedInGroupId);

        this.addEventListener("quizmenu:startquiz", this.handleQuizStart.bind(this));
        this.addEventListener("quizgame:endquiz", this.handleQuizEnd.bind(this));
    }

    handleQuizStart(e) {
        this.powerSource = e.detail.powerSource;

        this.startQuiz();
    }

    handleQuizEnd(e) {
        this.endScores = e.detail.scores;

        this.submitScore();
        this.endQuiz();
    }

    async submitScore() {
        // method for submitting bonus to a group
        try {

        } catch (error) {

        }
    }

    async endQuiz() {
        const quizEndElement = document.createElement("quiz-end-れ");
        quizEndElement.setAttribute("data-end-score", JSON.stringify({ ...this.endScores }));

        this.$container.innerHTML = "";
        this.$container.appendChild(quizEndElement);
    }

    async startQuiz() {
        const quizGameElement = document.createElement("quizgame-れ");
        quizGameElement.setAttribute("data-energy-source-string", this.powerSource);

        quizGameElement.questions = await this.fetchQuestions();

        this.$container.innerHTML = "";
        this.$container.appendChild(quizGameElement);
    }

    async fetchQuestions() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/questions`);

            if (!response.ok)
                throw new Error;

            const data = await response.json();
            const filteredQuestions = data.filter(question => question.active === true);
            return filteredQuestions;
        } catch (error) {
            alert("could not fetch data from backend");
        }
    }

});
//#endregion CLASS