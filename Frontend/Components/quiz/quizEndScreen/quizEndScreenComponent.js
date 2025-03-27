//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/quizEndScreen/style.css';
    </style>

    <div id="container">
        <h2 id="end-score"></h2>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-end-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this._endscores = {};
    }

    // component attributes
    static get observedAttributes() {
        return ['data-end-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-end-score':
                this._endscores = JSON.parse(newValue);
                break;
        }
    }

    connectedCallback() {
        if (this._endscores) {
            const totalScore = Object.keys(this._endscores).reduce((acc, key) => {
                return acc + this._endscores[key];
            }, 0);
            this._shadowRoot.querySelector('#end-score').innerText = `Je eindscore is: ${totalScore}`;
        }

    }

});
//#endregion CLASS