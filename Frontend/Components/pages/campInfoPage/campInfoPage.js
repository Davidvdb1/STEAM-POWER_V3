//#region IMPORTS
import '../../camp/campItem/campItem.js';
import '../../workshop/workshopPreview/workshopPreview.js';
//#endregion IMPORTS

//#region CAMPINFOPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/campInfoPage/style.css';
    </style>

    <h1 id="camptitle"></h1>
    <h2>Workshops</h2>
    <div id="buttons">
        <button id="addexisting">Voeg Bestaande Workshop Toe</button>
        <button id="addnew">Voeg Nieuwe Workshop Toe</button>
    </div>
    <div id="workshops"></div>
`;
//#endregion CAMPINFOPAGE

//#region CLASS 
window.customElements.define('campinfopage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$campInfo = this._shadowRoot.querySelector("#campinfo");
        this.$workshops = this._shadowRoot.querySelector("#workshops");
        this.$title = this._shadowRoot.querySelector("#camptitle");
        this.$addExisting = this._shadowRoot.querySelector("#addexisting");
        this.$addNew = this._shadowRoot.querySelector("#addnew");
        this.$camp = null;
    }

    // component attributes
    static get observedAttributes() {
        return ["camp"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "camp") {
            this.fetchCampWithId(newValue);
        }
    }

    connectedCallback() {
        // this.$addExisting.addEventListener('click', () => {
        //     this.tabWithWorkshopHandler("workshoppage", this.getAttribute("componentid"));
        // });

        this.$addNew.addEventListener('click', () => {
            this.tabWithCampHandler("workshoppage", "camp", this.getAttribute("camp"));
        });
    }

    updateCampInfo() {
        if (!this.$camp) return;

        this.$camp.workshops.forEach(workshop => {
            let workshopPreview = document.createElement('workshoppreview-れ');
            workshopPreview.setAttribute("html", workshop.html);
            workshopPreview.setAttribute("workshop", workshop.id);
            this.$workshops.appendChild(workshopPreview);
        })

        this.$title.innerHTML = this.$camp.name;
    }

    tabWithCampHandler(tabId, componentName, componentId) {
        this.dispatchEvent(new CustomEvent('tabID', {
            bubbles: true,
            composed: true,
            detail: {tabId, componentName, componentId}
        })); 
    }

    //service
    async fetchCampWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${id}?includeworkshops=true`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            this.$camp = await response.json();
            this.updateCampInfo();
    
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }
});
//#endregion CLASS