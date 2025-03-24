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
    }

    // component attributes
    static get observedAttributes() {
        return ['data-end-score'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-end-score':
                this._shadowRoot.querySelector('#end-score').innerText = newValue;
                break;
        }
    }

    connectedCallback() {

    }

});
//#endregion CLASS