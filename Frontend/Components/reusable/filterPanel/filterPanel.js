//#region IMPORTS
//#endregion IMPORTS

//#region FILTERPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/reusable/filterPanel/style.css';
    </style>
`;
//#endregion FILTERPANEL

//#region CLASS
window.customElements.define('filterpanel-れ', class extends HTMLElement {
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