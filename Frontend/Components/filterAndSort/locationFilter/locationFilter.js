//#region IMPORTS
//#endregion IMPORTS

//#region LOCATIONFILTER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/filterAndSort/locationFilter/style.css';
    </style>
     
    <div>
        <div class="location">
            <label for="location">Locatie:</label>
            <select id="location">
                <option value="">Kies een locatie</option>
            </select>
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
        this.$list = []
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.fetchCamps()

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

    //services
    async fetchCamps() {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + '/camps');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();

            const uniqueLocations = [...new Set(data.map(camp => camp.address))];
            this.$list = uniqueLocations.map(location => ({ location }));
            
            const select = this.$location;
            this.$location.innerHTML = '<option value="">Kies een locatie</option>';
            this.$list.forEach(({ location }) => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                select.appendChild(option);
            });
            
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }

});
//#endregion CLASS