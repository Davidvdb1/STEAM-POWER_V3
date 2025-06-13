//#region IMPORTS
import "../../camp/campContainer/campContainer.js"
import "../../camp/campPanel/campPanel.js"
import '../../filterAndSort/filterPanel/filterPanel.js';
//#endregion IMPORTS

//#region CAMPOVERVIEWPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/campOverviewPage/style.css';
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
        this.addEventListener("dateFilter", this.dateFilterHandler);
        this.addEventListener("ageFilter", this.ageFilterHandler);
        this.addEventListener("locationFilter", this.locationFilterHandler);
        this.addEventListener("reset", this.resetHandler);
        this.addEventListener("resetFilter", this.resetFilterHandler);
    }

    sortHandler(e) {
        this.$campContainer.setAttribute("sort", e.detail);
    }

    searchHandler(e) {
        this.$campContainer.setAttribute("search", e.detail);
    }

    dateFilterHandler(e) {
        console.log(e.detail);
        this.$campContainer.setAttribute("datefilter", JSON.stringify(e.detail));
    }

    ageFilterHandler(e) {
        this.$campContainer.setAttribute("agefilter", e.detail);
    }

    locationFilterHandler(e) {
        this.$campContainer.setAttribute("locationfilter", e.detail);
    }

    resetFilterHandler() {
        this.$campContainer.setAttribute("resetFilter" , true);
    }

    resetHandler() {
        this.$campContainer.setAttribute("reset" , true);
    }

});
//#endregion CLASS