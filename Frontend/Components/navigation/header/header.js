//#region IMPORTS
import "../../../Components/navigation/navigationBar/navigationBar.js"
//#endregion IMPORTS

//#region Header
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/header/style.css';
    </style>

    <navigationBar-れ></navigationBar-れ>
`;
//#endregion Header

//#region CLASS
window.customElements.define('header-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".example");
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