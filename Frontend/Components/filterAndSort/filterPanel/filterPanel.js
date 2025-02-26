//#region IMPORTS
import '../dateFilter/dateFilter.js';
//#endregion IMPORTS

//#region FILTERPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/filterAndSort/filterPanel/style.css';
    </style>

    <img src="./Assets/SVGs/filter.png" alt="search" style="width: 35px; height: 35px;">
    <select id="filter">
        <option value="none" selected>Geen filtering</option>
        <option value="location" >filter op locatie</option>
        <option value="date">filter op datum</option>
        <option value="age">filter op leeftijd</option>
    </select>
    

`;
//#endregion FILTERPANEL

//#region CLASS
window.customElements.define('filterpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$filter = this._shadowRoot.querySelector("#filter");
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
        if (filter === "none") {
            this._shadowRoot.querySelector("#selectedFilter").innerHTML = "";
        }
        if (filter === "location") {
            this._shadowRoot.querySelector("#selectedFilter").innerHTML = /*html*/`
                <input type="text" id="location" placeholder="Locatie">
            `;
        }
        if (filter === "date") {
            this._shadowRoot.appendChild(document.createElement('datefilter-れ'));
        }
        if (filter === "age") {
            this._shadowRoot.querySelector("#selectedFilter").innerHTML = /*html*/`
                <input type="number" id="startAge" placeholder="leeftijd">
            `;
        }
    }
    

});
//#endregion CLASS