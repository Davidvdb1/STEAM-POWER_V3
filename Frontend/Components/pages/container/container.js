//#region IMPORTS
import "../../../Components/navigation/tabHandler/tabHandler.js"
//#endregion IMPORTS

//#region CONTAINER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/container/style.css';
    </style>

    <tabhandler-れ></tabhandler-れ> 
`;
//#endregion CONTAINER

//#region CLASS
window.customElements.define('container-れ', class extends HTMLElement {
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