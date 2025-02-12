//#region IMPORTS
import "../../Components/navigationList/navigationList.js"
//#endregion IMPORTS

//#region navigationBar
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigationBar/style.css';
    </style>

    <div class="navigationBar">
        <img src="./assets/images/logo.jpg" alt="Logo" class="nav-logo">
        <navigationList-れ></navigationList-れ>
    </div>
`;
//#endregion navigationBar

//#region CLASS
window.customElements.define('navigationbar-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue)  {

    }

    connectedCallback() {

    }

});
//#endregion CLASS