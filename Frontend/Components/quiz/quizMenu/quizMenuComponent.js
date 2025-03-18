//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/quizMenu/style.css';
    </style>
<h1>Quiz</h1>

<div class="label-container">
    <label for="powerSource">Selecteer de energiebron</label>
    <div class="select-container">
        <select name="powerSource" id="powerSource">
            <option disabled selected value>Selecteer een energiebron</option>
            <option value="water">Water</option>
            <option value="wind">Wind</option>
            <option value="solar">Solar</option>
        </select>
        <button id="start-button">Start!</button>
    </div>
</div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quizmenu-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$startButton = this.shadowRoot.querySelector("#start-button");
        this.$powerSource = this.shadowRoot.querySelector("#powerSource");

        this.$startButton.addEventListener("click", this.handleStartButtonClick.bind(this));
    }

    handleStartButtonClick() {
        if (this.$powerSource.selectedIndex === 0) {
            alert("Please select an energy source before starting the quiz.");
        } else {
            this.dispatchEvent(new CustomEvent("quizmenu:startquiz", {
                bubbles: true,
                composed: true,
                detail: {
                    powerSource: this.$powerSource.value
                }
            }))
        }
    }
});
//#endregion CLASS