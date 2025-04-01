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
        <h2 id="total-score"></h2>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('quiz-end-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._endscore = 0;
        this._totalscore = 0;
    }

    // component attributes
    static get observedAttributes() {
        return ['data-end-score', 'data-total-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-end-score':
                this._endscore = parseInt(newValue);
                break;
            case 'data-total-score':
                this._totalscore = parseInt(newValue);
                break

        }
    }

    connectedCallback() {
        if (this._endscore) {
            this._shadowRoot.querySelector('#end-score').innerText = `Je eindscore is: ${this._endscore}`;
        }
        if (this._totalscore) {
            this._shadowRoot.querySelector('#total-score').innerText = `Je totale score is: ${this._totalscore}`;
        }

    }

});
//#endregion CLASS