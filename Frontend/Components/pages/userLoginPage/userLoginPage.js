//#region IMPORTS
import "../../../components/authentication/userLoginForm/userLoginForm.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/userLoginPage/style.css';
    </style>
    <userloginform-れ></userloginform-れ>

`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('userloginpage-れ', class extends HTMLElement {
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