//#region IMPORTS
//#endregion IMPORTS

//#region LOCATIONFILTER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/filterAndSort/locationFilter/style.css';
    </style>
     
    <div>
        <div class="location">
            <label for="location">locatie:</label>
            <input type="text" id="location" placeholder="locatie">
        </div>
    </div>
    <button id="filterButton">Filter</button>
`;
//#endregion LOCATIONFILTER

//#region CLASS
window.customElements.define('locationfilter-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$location = this._shadowRoot.querySelector("#location");
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
            this.locationFilter(this.$location.value);
        });
    }

    locationFilter(location) {
        this.dispatchEvent(new CustomEvent('locationFilter', {
            bubbles: true,
            composed: true,
            detail: location
        }));
    }

});
//#endregion CLASS