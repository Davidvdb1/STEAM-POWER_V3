//#region IMPORTS
//#endregion IMPORTS

//#region DATEFILTER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/filterAndSort/dateFilter/style.css';
    </style>
     
    <div>
        <div class="date">
            <label for="startDate">Van:</label>
            <input type="date" id="startDate" placeholder="Startdatum">
        </div>
        <div class="date">
            <label for="endDate">Tot:</label>
            <input type="date" id="endDate" placeholder="Einddatum">
        </div>
    </div>
    <button id="filterButton">Filter</button>
`;
//#endregion DATEFILTER

//#region CLASS
window.customElements.define('datefilter-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$startDate = this._shadowRoot.querySelector("#startDate");
        this.$endDate = this._shadowRoot.querySelector("#endDate");
        this.$filterButton = this._shadowRoot.querySelector("#filterButton");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$filterButton.addEventListener('click', () => {
            this.dateFilter(this.$startDate.value, this.$endDate.value);
        });
    }

    dateFilter(begin, end) {
        this.dispatchEvent(new CustomEvent('dateFilter', {
            bubbles: true,
            composed: true,
            detail: { begin, end }
        }));
    }

});
//#endregion CLASS