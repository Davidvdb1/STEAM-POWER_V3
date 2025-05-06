//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/quiz/quizQuestionComponent/style.css';
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

        this._energyContext = null;
        this._energyReading = null;
        this._groupId = null;

        this._id = null;
        this._score = 0;
        this._energyType = null;
        this._isSolved = false;
        this._currentAttempts = 0;
        this._maxAttempts = 0;
        this._wattage = 0;
        this._title = "";
        this._description = "";
        this._picture = "";

        this._questionStatement = "";

    }

    set energyContext(value) {
        this._energyContext = value;
        this.updateQuestion();
    }

    set energyReading(value) {
        this._energyReading = value;
        console.log("Energy reading set to:", value);
    }

    set groupId(value) {
        this._groupId = value;
    }

    // component attributes
    static get observedAttributes() {
        return []
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }
    connectedCallback() {

        this.$inputContainer = this.shadowRoot.querySelector("#input-container");

        const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
        if (loggedInUser && (loggedInUser.role === "ADMIN" || loggedInUser.role === "TEACHER")) {
            this.$inputContainer.remove();
            this.$inputContainer = null;
        } else {
            this.$submitAnswerButton = this.shadowRoot.querySelector("#submit-answer");
            this.$answerInput = this.shadowRoot.querySelector("input[type='text']");

            this.$submitAnswerButton.addEventListener("click", async () => {
                const answer = this.$answerInput.value;

                await this.handleSubmitAnswer(answer);
            });
        }

        this.$actualQuestion = this.shadowRoot.querySelector("#actual-question");
    }

    async handleSubmitAnswer(answer) {
        const mockEnergyReading = this._energyReading; // Mock energy reading value

        try {
            //const groupId = JSON.parse(sessionStorage.getItem("loggedInUser")).groupId;

            const response = await fetch(`${window.env.BACKEND_URL}/questions/${this._id}/answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    groupId: this._groupId,
                    answerValue: answer === "" ? 0 : answer,
                    energyReading: mockEnergyReading
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const error = data.errorMargin;

            if (data.isSolved) {
                await this.updateGroupscore(this._score);
            }

            this.dispatchEvent(new CustomEvent("update-error-indicator", {
                detail: { error },
                bubbles: true,
                composed: true
            }));

            this.initQuestion(data);
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    }

    async updateGroupscore(score) {
        const groupId = JSON.parse(sessionStorage.getItem("loggedInUser")).groupId;

        try {
            const res = await fetch(`${window.env.BACKEND_URL}/groups/${groupId}/score`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bonusScore: score
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Group score updated:", data);
        } catch (error) {
            console.error("Error updating group score:", error);
        }
    }

    set currentAttempts(value) {
        if (this._maxAttempts > 0) {
            this._currentAttempts = value;
            this.shadowRoot.querySelector("#attempts-counter").innerText = `Pogingen: ${this._currentAttempts}/${this._maxAttempts}`;

            if (this._currentAttempts >= this._maxAttempts && !this._isSolved) {
                this.disableInput();
                this.shadowRoot.querySelector(".container").classList.add("incorrect");
            }
        }
    }

    get currentAttempts() {
        return this._currentAttempts;
    }

    set maxAttempts(value) {
        if (value === 0) {
            this.shadowRoot.querySelector("#attempts-counter").innerText = `Oneindig veel pogingen`;
        }
        this._maxAttempts = value;
    }

    get maxAttempts() {
        return this._maxAttempts;
    }

    set isSolved(value) {
        this._isSolved = value;
        if (this._isSolved) {
            this.disableInput();
            this.shadowRoot.querySelector(".container").classList.add("solved");
        }
    }

    set id(value) {
        this._id = value;
    }

    set wattage(value) {
        this._wattage = value;
        this.shadowRoot.querySelector("#wattage").innerText = value;
    }

    set energyType(value) {
        this._energyType = value;
    }

    set title(value) {
        this._title = value;
        this.shadowRoot.querySelector("#title").innerText = value;
    }

    set description(value) {
        this._description = value;
        this.shadowRoot.querySelector("#description").innerText = value;
    }

    set picture(value) {
        this._picture = value;
        this.shadowRoot.querySelector("#picture").src = value;
        this.shadowRoot.querySelector("#picture").alt = this._title;
    }
    set questions(value) {
        this._questions = value;
    }
    set questionStatement(value) {
        this._questionStatement = value;
        this.updateQuestion();
    }

    set score(value) {
        this._score = value;
    }

    disableInput() {
        if (!this.$inputContainer) return;
        this.$answerInput.disabled = true;
        this.$submitAnswerButton.disabled = true;
    }

    updateQuestion() {
        if (this.$actualQuestion) {
            this.$actualQuestion.innerText = this._questionStatement;
        }
    }

    initQuestion({ id, score, isSolved, answerCount, maxTries, wattage, title, description, picture, energyType, questionStatement }) {
        this.id = id;
        this.score = score;
        this.energyType = energyType;

        this.isSolved = isSolved;
        this.maxAttempts = maxTries;
        this.currentAttempts = answerCount;

        this.wattage = wattage;
        this.title = title;
        this.description = description;
        this.picture = picture;

        this.questionStatement = questionStatement;
    }
});
//#endregion CLASS