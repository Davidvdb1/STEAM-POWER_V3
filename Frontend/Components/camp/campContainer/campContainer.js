//#region IMPORTS
import "../campItem/campItem.js"
//#endregion IMPORTS

//#region CAMPCONTAINER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/camp/campContainer/style.css';
    </style>
    <div id="camp-list"></div>
`;

//#endregion CAMPCONTAINER

//#region CLASS
window.customElements.define('campcontainer-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$campList = this._shadowRoot.querySelector("#camp-list");
        this.camps = [];
        this.activeFilters = {
            search: "",
            date: null,
            age: null,
            location: "",
            sort: "none"
        };
    }

    static get observedAttributes() {
        return ["sort", "search", "datefilter", "agefilter", "locationfilter", "reset", "resetfilter"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "search") {
            this.activeFilters.search = newValue.toLowerCase();
        }
    
        if (name === "sort") {
            this.activeFilters.sort = newValue;
        }
    
        if (name === "datefilter") {
            this.activeFilters.date = JSON.parse(newValue);
        }
    
        if (name === "agefilter") {
            this.activeFilters.age = newValue ? Number(newValue) : null;
        }
        
        if (name === "locationfilter") {
            this.activeFilters.location = newValue.toLowerCase();
        }

        if (name === "reset") {
            this.activeFilters = {
                search: "",
                date: null,
                age: null,
                location: "",
                sort: "none"
            };
        }

        if (name === "resetfilter") {
            this.activeFilters = {
                ...this.activeFilters,
                date: null,
                age: null,
                location: ""
            };
        }

        this.applyFiltersAndSort();
    }

    async connectedCallback() {
        await this.fetchCamps();
    }

    renderCamps(campList) {
        this.$campList.innerHTML = "";
        campList.forEach(camp => {
            let campItem = document.createElement('campitem-れ');
            campItem.setAttribute("id", camp.id);
            campItem.setAttribute("title", camp.title);
            campItem.setAttribute("startDate", camp.startDate);
            campItem.setAttribute("endDate", camp.endDate);
            campItem.setAttribute("startAge", camp.startAge);
            campItem.setAttribute("endAge", camp.endAge);
            campItem.setAttribute("startTime", camp.startTime);
            campItem.setAttribute("endTime", camp.endTime);
            campItem.setAttribute("location", camp.location);
            campItem.setAttribute("image", camp.image);
            campItem.setAttribute("archived", camp.archived);
            this.$campList.appendChild(campItem);
        });
    }

    applyFiltersAndSort() {
        let filteredCamps = this.camps;

        if (this.activeFilters.search) {
            filteredCamps = filteredCamps.filter(camp => 
                camp.title.toLowerCase().includes(this.activeFilters.search)
            );
        }
    
        if (this.activeFilters.date) {
            filteredCamps = filteredCamps.filter(camp => 
                new Date(camp.startDate) >= new Date(this.activeFilters.date.begin) &&
                new Date(camp.endDate) <= new Date(this.activeFilters.date.end)
            );
        }

        if (this.activeFilters.age) {
            filteredCamps = filteredCamps.filter(camp => 
                Number(this.activeFilters.age) >= Number(camp.startAge) && 
                Number(this.activeFilters.age) <= Number(camp.endAge)
            );
        }
    
        if (this.activeFilters.location) {
            filteredCamps = filteredCamps.filter(camp => 
                camp.location.toLowerCase().includes(this.activeFilters.location)
            );
        }
    
        if (this.activeFilters.sort === "date") {
            filteredCamps.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        }
        if (this.activeFilters.sort === "name") {
            filteredCamps.sort((a, b) => a.title.localeCompare(b.title));
        }
    
        this.renderCamps(filteredCamps);
    }

    //service
    async fetchCamps() {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + '/camps');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            this.camps = data.map(camp => ({
                id: camp.id,
                title: camp.name,
                startDate: camp.startDate,
                endDate: camp.endDate,
                startAge: camp.minAge,
                endAge: camp.maxAge,
                startTime: camp.startTime,
                endTime: camp.endTime,
                location: camp.address,
                image: camp.picture,
                archived: camp.archived
            }));
    
            // **Sorteer de kampen op startDate vóór het renderen**
            this.camps.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
            this.renderCamps(this.camps);
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }
    
});
//#endregion CLASS