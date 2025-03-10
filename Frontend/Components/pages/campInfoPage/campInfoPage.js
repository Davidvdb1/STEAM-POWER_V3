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

    <h1>Kamp Informatie</h1>
    <div id="campinfo"></div>
    <h1>Workshops</h1>
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
        this.camp = null;
    }

    // component attributes
    static get observedAttributes() {
        return ["componentid"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "componentid") {
            this.fetchCampWithId(newValue);
        }
    }

    updateCampInfo() {
        if (!this.camp) return;

        let campItem = document.createElement('campitem-れ');
        campItem.setAttribute("id", this.camp.id);
        campItem.setAttribute("title", this.camp.name); 
        campItem.setAttribute("startdate", this.camp.startDate); 
        campItem.setAttribute("enddate", this.camp.endDate);
        campItem.setAttribute("startage", this.camp.minAge);
        campItem.setAttribute("endage", this.camp.maxAge);
        campItem.setAttribute("starttime", this.camp.startTime);
        campItem.setAttribute("endtime", this.camp.endTime);
        campItem.setAttribute("location", this.camp.address);
        campItem.setAttribute("image", this.camp.picture);

        const button = campItem._shadowRoot.querySelector("button");
        if (button) {
            button.remove(); 
        }

        this.camp.workshops.forEach(workshop => {
            let workshopPreview = document.createElement('workshoppreview-れ');
            workshopPreview.setAttribute("html", workshop.html);
            this.$workshops.appendChild(workshopPreview);
        })


        // Verwijder oude content en voeg de nieuwe toe
        this.$campInfo.innerHTML = ""; 
        this.$campInfo.appendChild(campItem);
    }

    //service
    async fetchCampWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${id}?includeworkshops=true`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            this.camp = await response.json();
            this.updateCampInfo();
    
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }
});
//#endregion CLASS