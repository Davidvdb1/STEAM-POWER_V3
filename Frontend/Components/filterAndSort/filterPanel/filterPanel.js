//#region IMPORTS
import '../dateFilter/dateFilter.js';
import '../ageFilter/ageFilter.js';
import '../locationFilter/locationFilter.js';
//#endregion IMPORTS

//#region FILTERPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/filterAndSort/filterPanel/style.css';
    </style>

    <div class="filterPanelDiv-img-select">
        <img src="./Assets/SVGs/filter.png" alt="search" style="width: 35px; height: 35px;">
        <select id="filter">
            <option value="none" selected>Geen filtering</option>
            <option value="location" >filter op locatie</option>
            <option value="date">filter op datum</option>
            <option value="age">filter op leeftijd</option>
        </select>
    </div>

    <div id="filterPanel"></div>
`;
//#endregion FILTERPANEL

//#region CLASS
window.customElements.define('filterpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$filter = this._shadowRoot.querySelector("#filter");
        this.$filterPanel = this._shadowRoot.querySelector("#filterPanel");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$filter.addEventListener('change', () => {
            this.filterChanged(this.$filter.value);
        });
    }

    filterChanged(filter) {
        this.$filterPanel.replaceChildren();
        this.resetFilter();
        this.$filterPanel.appendChild(document.createElement(`${filter}filter-れ`));
    }

    resetFilter() {
        this.dispatchEvent(new CustomEvent('resetFilter', {
            bubbles: true,
            composed: true,
        }));
    }



});
//#endregion CLASS