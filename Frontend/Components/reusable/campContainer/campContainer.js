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
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        const camps = [
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
        ];

        camps.forEach(camp => {
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

});
//#endregion CLASS