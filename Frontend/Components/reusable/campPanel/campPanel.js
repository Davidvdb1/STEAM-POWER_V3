//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/reusable/campPanel/style.css';
    </style>

    <input type="text" placeholder="Zoek op kampnaam">
    <button>filter</button>
    <button>sorteren</button>
    <button>zoeken</button>
    <button>reset</button>
    <button>+ nieuw kamp</button>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('camppanel-れ', class extends HTMLElement {
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