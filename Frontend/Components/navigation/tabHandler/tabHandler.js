//#region IMPORTS
import "../../../Components/navigation/header/header.js"
import "../../pages/content/content.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/tabHandler/style.css';
    </style>

    <header-れ></header-れ>
    <content-れ></content-れ> 
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('tabhandler-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$content = this._shadowRoot.querySelector("content-れ");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.addEventListener("tab", this.handler);
    }

    handler(e) {
        this.$content.setAttribute("active-tab", e.detail);
    }

});
//#endregion CLASS