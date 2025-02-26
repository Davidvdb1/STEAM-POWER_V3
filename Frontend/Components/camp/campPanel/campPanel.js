//#region IMPORTS
import "../../filterAndSort/sortPanel/sortPanel.js"
import "../../filterAndSort/filterPanel/filterPanel.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/camp/campPanel/style.css';
    </style>

    <div id="searchPanel">
        <input id="search" type="text" placeholder="Zoek op kampnaam">
        <sortpanel-れ id="sort"></sortpanel-れ>
        <filterpanel-れ id="filter"></filterpanel-れ>
    </div>
    <div id="buttonPanel">
        <button id="reset" class="text">reset</button>
        <button id="addCamp" class="add">kamp toevoegen</button>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('camppanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$filter = this._shadowRoot.querySelector('#filter');
        this.$sort = this._shadowRoot.querySelector('#sort');
        this.$searchPanel = this._shadowRoot.querySelector('#searchPanel');
        this.$search = this._shadowRoot.querySelector('#search');
        this.$addCamp = this._shadowRoot.querySelector('#addCamp');
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$search.addEventListener('input', () => {
            this.searchHandler(this.$search.value);
        });

        this.$addCamp.addEventListener('click', () => {
            this.tabHandler('form')
        });
    }

    searchHandler(text) {
        this.dispatchEvent(new CustomEvent('search', {
            bubbles: true,
            composed: true,
            detail: text
        })); 
    }

    tabHandler(id) {
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: id
        })); 
    }


    

});
//#endregion CLASS