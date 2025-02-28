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
        
        // Opslag voor actieve filters en sortering
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
            console.log(this.activeFilters);
        }
        
    
        this.applyFiltersAndSort();
    }
    

    connectedCallback() {
        this.camps = [
            {
                "title": "Robotica Avontuur (RK20)",
                "startDate": "2025-04-10",
                "endDate": "2025-04-15",
                "startAge": "12",
                "endAge": "16",
                "startTime": "09:30",
                "endTime": "15:30",
                "location": "UCLL Techniek- en WetenschapsAcademie Leuven - Naamsesteenweg 355, 3001 Heverlee",
                "image": "C:\\fakepathe\\roboticsCamp.webp"
            },
            {
                "title": "Game Development Kamp (GD15)",
                "startDate": "2025-07-05",
                "endDate": "2025-07-12",
                "startAge": "10",
                "endAge": "14",
                "startTime": "10:00",
                "endTime": "16:00",
                "location": "UCLL Digital Lab Leuven - Naamsesteenweg 355, 3001 Heverlee",
                "image": "C:\\fakepath\\gameDevCamp.webp"
            },
            {
                "title": "AI en Machine Learning Kamp (AI22)",
                "startDate": "2025-08-01",
                "endDate": "2025-08-07",
                "startAge": "13",
                "endAge": "17",
                "startTime": "09:00",
                "endTime": "14:00",
                "location": "UCLL Innovatiecentrum - Naamsesteenweg 355, 3001 Heverlee",
                "image": "C:\\fakepath\\aiCamp.webp"
            },
            {
                "title": "Elektronica en Circuits Kamp (EC10)",
                "startDate": "2025-10-20",
                "endDate": "2025-10-25",
                "startAge": "11",
                "endAge": "15",
                "startTime": "10:30",
                "endTime": "15:30",
                "location": "UCLL Makerspace - Naamsesteenweg 355, 3001 Heverlee",
                "image": "C:\\fakepath\\electronicsCamp.webp"
            },
            {
                "title": "Smart Gadget Shaping kamp (VK30)",
                "startDate": "2025-02-19",
                "endDate": "2025-02-26",
                "startAge": "10",
                "endAge": "15",
                "startTime": "10:00",
                "endTime": "16:00",
                "location": "UCLL Techniek- en WetenschapsAcademie Leuven - Naamsesteenweg 355 , 3001 Heverlee",
                "image": "C:\\fakepath\\campExample.webp"
            },
            {
                "title": "IR 13 kamp",
                "startDate": "2024-02-19",
                "endDate": "2024-02-26",
                "startAge": "8",
                "endAge": "10",
                "startTime": "11:00",
                "endTime": "17:00",
                "location": "Naamsesteenweg 355 , 3001 Heverlee",
                "image": "C:\\fakepath\\campExample.webp"
            }
        ]

        this.renderCamps(this.camps);
    }

    renderCamps(campList) {
        this.$campList.innerHTML = ""; 
        campList.forEach(camp => {
            let campItem = document.createElement('campitem-れ');
            campItem.setAttribute("title", camp.title);
            campItem.setAttribute("startDate", camp.startDate);
            campItem.setAttribute("endDate", camp.endDate);
            campItem.setAttribute("startAge", camp.startAge);
            campItem.setAttribute("endAge", camp.endAge);
            campItem.setAttribute("startTime", camp.startTime);
            campItem.setAttribute("endTime", camp.endTime);
            campItem.setAttribute("location", camp.location);
            campItem.setAttribute("image", camp.image);
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
    
});
//#endregion CLASS