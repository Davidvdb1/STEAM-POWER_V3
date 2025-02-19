//#region IMPORTS
import "../../reusable/campContainer/campContainer.js"
import "../../reusable/campPanel/campPanel.js"
//#endregion IMPORTS

//#region CAMPOVERVIEWPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/campOverviewPage/style.css';
    </style>

    <h1>Welkom bij TWA</h1>
    <h2>Overzicht van de kampen</h2>
    <camppanel-れ></camppanel-れ>
    <campcontainer-れ></campcontainer-れ>


`;
//#endregion CAMPOVERVIEWPAGE

//#region CLASS
window.customElements.define('campoverviewpage-れ', class extends HTMLElement {
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