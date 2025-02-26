//#region IMPORTS
//#endregion IMPORTS

//#region SORTPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/filterAndSort/sortPanel/style.css';
    </style>

    <img src="./Assets/SVGs/sort.png" alt="search" style="width: 35px; height: 35px;">
    <select>
        <option value="none" selected>Geen sortering</option>
        <option value="name" >Sorteer op titel</option>
        <option value="date">Sorteer op datum</option>
    </select>
`;
//#endregion SORTPANEL

//#region CLASS
window.customElements.define('sortpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$selection = this._shadowRoot.querySelector('select');
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }


    connectedCallback() {
        this.$selection.addEventListener('change', (event) => {
            this.sortHandler(event.target.value);
        });
    }

    sortHandler(attribute) {
        this.dispatchEvent(new CustomEvent('sort', {
            bubbles: true,
            composed: true,
            detail: attribute
        })); 
    }



});
//#endregion CLASS