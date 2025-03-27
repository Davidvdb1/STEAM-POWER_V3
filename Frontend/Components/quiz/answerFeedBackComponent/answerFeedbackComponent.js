//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/answerFeedBackComponent/style.css';
    </style>

<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="--value: 75"></div>

`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('answer-feedback-component-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this._error = 0;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

    }

    set error(value) {
        this._error = value;

        this.setPercentage(50 + value * 500);
        console.log(this._error);
    }

    setPercentage(value) {
        if (value <= 0) {
            value = 0;
        }
        if (value >= 100) {
            value = 100;
        }

        this._shadowRoot.querySelector('div').style.setProperty('--value', value);

        console.log(value);
    }

});
//#endregion CLASS