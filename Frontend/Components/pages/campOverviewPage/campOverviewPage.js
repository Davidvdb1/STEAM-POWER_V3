//#region IMPORTS
import "../../reusable/campContainer/campContainer.js"
import "../../reusable/campPanel/campPanel.js"
import '../../reusable/filterPanel/filterPanel.js';
//#endregion IMPORTS

//#region CAMPOVERVIEWPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/campOverviewPage/style.css';
    </style>
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
        this.$campContainer = this._shadowRoot.querySelector("campcontainer-れ");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.addEventListener("sort", this.sortHandler);
        this.addEventListener("search", this.searchHandler);
    }

    sortHandler(e) {
        this.$campContainer.setAttribute("sort", e.detail);
    }

    searchHandler(e) {
        this.$campContainer.setAttribute("search", e.detail);
    }

});
//#endregion CLASS