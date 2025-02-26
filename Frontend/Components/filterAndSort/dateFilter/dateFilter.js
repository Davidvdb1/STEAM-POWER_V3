//#region IMPORTS
//#endregion IMPORTS

//#region DATEFILTER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/filterAndSort/dateFilter/style.css';
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