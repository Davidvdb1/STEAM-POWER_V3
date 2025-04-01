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
        this.questions = [];
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    async connectedCallback() {
        this.questions = await this.fetchQuestions();
        if (this.questions.length === 0) {
            this.shadowRoot.querySelector("#container").innerHTML = "<p>Geen vragen gevonden</p>";
        } else {
            this.addEventListener("quizmenu:startquiz", this.handleQuizStart.bind(this));
            this.addEventListener("quizgame:endquiz", this.handleQuizEnd.bind(this));
        }

    }

    handleQuizStart(e) {
        this.powerSource = e.detail.powerSource;

        this.startQuiz();
    }

    async handleQuizEnd(e) {
        this.endScore = Object.keys(e.detail.scores).reduce((acc, key) => {
            return acc + e.detail.scores[key];
        }, 0);

        const totalGroupScore = await this.submitScore();
        console.log("Total group score:", totalGroupScore);

        this.endQuiz(totalGroupScore);
    }

    async endQuiz(totalGroupScore) {
        const quizEndElement = document.createElement("quiz-end-れ");
        quizEndElement.setAttribute("data-end-score", this.endScore);
        quizEndElement.setAttribute("data-total-score", totalGroupScore);
        this.$container.innerHTML = "";
        this.$container.appendChild(quizEndElement);
    }

    async startQuiz() {
        const quizGameElement = document.createElement("quizgame-れ");
        quizGameElement.setAttribute("data-energy-source-string", this.powerSource);

        quizGameElement.questions = this.questions;

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
            return [];
        }
    }

    async submitScore() {
        try {
            if (!this.endScore) throw new Error("Geen eindscore gevonden!");
            const groupId = JSON.parse(sessionStorage.getItem('loggedInUser'))?.groupId;
            if (!groupId) throw new Error("Geen geldig groupId gevonden!");

            const data = {
                bonusScore: this.endScore
            };

            const response = await fetch(`${window.env.BACKEND_URL}/groups/${groupId}/score`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
            const body = await response.json();
            console.log("Score updated:", body);
            return body.group.bonusScore;
        } catch (error) {
            console.error(error);
        }
    }

});
//#endregion CLASS