//#region IMPORTS
import "../../../Components/authentication/groupLoginForm/groupLoginForm.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/groupLoginPage/style.css';
    </style>
    <grouploginform-れ></grouploginform-れ>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('grouploginpage-れ', class extends HTMLElement {
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

    }

});
//#endregion CLASS