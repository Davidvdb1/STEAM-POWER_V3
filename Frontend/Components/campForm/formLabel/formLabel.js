//#region IMPORTS
import "../../Components/example/example.js"
//#endregion IMPORTS

//#region FORMLABEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/campFromContainer/formLabel/style.css';
    </style>

    <div class="example">
    </div>
`;
//#endregion FORMLABEL

//#region CLASS
window.customElements.define('formlabel-れ', class extends HTMLElement {
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