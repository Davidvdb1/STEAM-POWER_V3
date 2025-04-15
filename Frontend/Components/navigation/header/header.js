//#region IMPORTS
import "../../../components/navigation/navigationList/navigationList.js"
//#endregion IMPORTS

//#region Header
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/header/style.css';
    </style>

    <img src="./Assets/images/logo.jpg" alt="Logo" class="nav-logo">
    <navigationList-れ></navigationList-れ>
`;
//#endregion Header

//#region CLASS
window.customElements.define('header-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$navigationList = this._shadowRoot.querySelector("navigationList-れ");
    }

    // component attributes
    static get observedAttributes() {
        return ["tabs"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "tabs") {
            this.$navigationList.setAttribute("tabs", newValue);
        }

    }

    connectedCallback() {
        
    }
    

});
//#endregion CLASS