//#region IMPORTS
import "../../Components/example/example.js"
//#endregion IMPORTS

//#region FORMINPUT
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/campFormContainer/formInput/style.css';
    </style>

`;
//#endregion FORMINPUT

//#region CLASS
window.customElements.define('forminput-れ', class extends HTMLElement {
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