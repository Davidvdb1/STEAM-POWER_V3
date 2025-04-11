//#region IMPORTS
//#endregion IMPORTS

//#region AGEFILTER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/filterAndSort/ageFilter/style.css';
    </style>
     
    <div>
        <div class="age">
            <label for="age">leeftijd:</label>
            <input type="number" id="age" placeholder="leeftijd">
        </div>
    </div>
    <button id="filterButton">Filter</button>
`;
//#endregion AGEFILTER

//#region CLASS
window.customElements.define('agefilter-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$age = this._shadowRoot.querySelector("#age");
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
            this.dateFilter(this.$age.value);
        });
    }

    dateFilter(age) {
        this.dispatchEvent(new CustomEvent('ageFilter', {
            bubbles: true,
            composed: true,
            detail: age
        }));
    }

});
//#endregion CLASS