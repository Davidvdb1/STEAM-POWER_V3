//#region IMPORTS
import "../../reusable/campItem/campItem.js"
//#endregion IMPORTS

//#region CAMPCONTAINER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/reusable/campContainer/style.css';
    </style>
`;
//#endregion CAMPCONTAINER

//#region CLASS
window.customElements.define('campcontainer-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".example");
        this.camps = [];
    }

    // component attributes
    static get observedAttributes() {
        return ["sort", "search"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "sort") {
            this.sortCamps(newValue);
        }

        if (name === "search") {
            this.searchCamps(newValue);
        }
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
                "image": "C:\\fakepath\\roboticsCamp.webp"
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
            this._shadowRoot.appendChild(campItem);
        });
    }

    sortCamps(attribute) {
        if (attribute === "date") {
            this._shadowRoot.innerHTML = /*html*/`
                <style>
                    @import './components/reusable/campContainer/style.css';
                </style>
            `;
            this.renderCamps(this.camps.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
        }
        
        if (attribute === "name") {
            this._shadowRoot.innerHTML = /*html*/`
                <style>
                    @import './components/reusable/campContainer/style.css';
                </style>
            `;
            this.renderCamps(this.camps.sort((a, b) => a.title.localeCompare(b.title)));
        }

        if (attribute === "none") {
            this._shadowRoot.innerHTML = /*html*/`
                <style>
                    @import './components/reusable/campContainer/style.css';
                </style>
            `;
            this.renderCamps(this.camps);
        }
    }

    searchCamps(text) {
        this._shadowRoot.innerHTML = /*html*/`
            <style>
                @import './components/reusable/campContainer/style.css';
            </style>
        `;
        const filteredCamps = this.camps.filter(camp => 
            camp.title.toLowerCase().includes(text.toLowerCase())
        );
        console.log("did it");
        this.renderCamps(filteredCamps);
    }
    

});
//#endregion CLASS