//#region IMPORTS
import "../../camp/deleteCampPopup/deleteCampPopup.js";
//#endregion IMPORTS

//#region CAMPITEM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/camp/campItem/style.css';
    </style>


    <img id="settings" src="./Assets/SVGs/settings.png" alt="settings" style="width: 26px; height: 25px;">
    <img id="visible" src="" alt="settings" style="width: 26px; height: 25px;">
    <div id="dropdown">
        <a href="#" class="update" data-id="1">Bewerken</a>
        <a href="#" class="delete" data-id="1">Verwijderen</a>
    </div>
    <img class="image" src="../Frontend/Assets/images/campExample.webp" alt="campImage">
    <h2 class="title"></h2>

    <div>
        <img src="./Assets/SVGs/location.png" alt="location" style="width: 30px; height: 30px;">
        <p class="location"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/startDateTime.png" alt="startTime" style="width: 30px; height: 30px;">
        <p class="startDate"></p>
        <p class="startTime"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/endDateTime.png" alt="endTime" style="width: 30px; height: 30px;">
        <p class="endDate"></p>
        <p class="endTime"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/age1.png" alt="age" style="width: 30px; height: 30px;">
        <p class="age"></p>
    </div>
    <button class="action-button">Meer info</button>
`;
//#endregion CAMPITEM

//#region CLASS
window.customElements.define('campitem-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$image = this._shadowRoot.querySelector(".image");
        this.$title = this._shadowRoot.querySelector(".title");
        this.$startDate = this._shadowRoot.querySelector(".startDate");
        this.$startTime = this._shadowRoot.querySelector(".startTime");
        this.$endDate = this._shadowRoot.querySelector(".endDate");
        this.$endTime = this._shadowRoot.querySelector(".endTime");
        this.$location = this._shadowRoot.querySelector(".location");
        this.$age = this._shadowRoot.querySelector(".age");
        this.$button = this._shadowRoot.querySelector(".action-button");
        this.$settings = this._shadowRoot.querySelector("#settings");
        this.$visible = this._shadowRoot.querySelector("#visible");
        this.$dropdown = this._shadowRoot.querySelector("#dropdown");
        this.$dropdown.style.display = "none";
        this.$update = this._shadowRoot.querySelector(".update");
        this.$delete = this._shadowRoot.querySelector(".delete");
        this.campId = null
    }

    // component attributes
    static get observedAttributes() {
        return ["archived"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "archived") {
            if (newValue === "true") {
                this.$visible.src = "./Assets/SVGs/visibility-off.svg";
                this.style.opacity = "0.4";
            } else {
                this.$visible.src = "./Assets/SVGs/visibility-on.svg";
                this.style.opacity = "1";
            }
        }
    }

    placeCampInfo(camp) {
        this.$startTime.innerHTML = camp.startTime;
        this.$endTime.innerHTML = camp.endTime;
        this.$title.innerHTML = camp.title;
        this.$location.innerHTML = camp.location;
        this.$age.innerHTML = `Vanaf ${camp.startAge} t.e.m.`;
        this.$age.innerHTML += ` ${camp.endAge} jaar`;
        this.$image.src = camp.image;
        this.campId = camp.id

        const startDate = new Date(camp.startDate);
        const startDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.$startDate.innerHTML = startDate.toLocaleDateString('nl-NL', startDateOptions);

        const endDate = new Date(camp.endAge);
        const endDateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.$endDate.innerHTML = endDate.toLocaleDateString('nl-NL', endDateOptions);
    }

    connectedCallback() {
        this.$button.addEventListener('click', () => {
            this.campInfoHandler("campinfopage", "camp", this.campId);
        });
    
        this.$settings.addEventListener("click", (event) => {
            event.stopPropagation(); 
            this.toggleDropdown();
        });

        this.$visible.addEventListener("click", (event) => {
            event.stopPropagation(); 
            this.toggleVisibility();
        });

    
        document.addEventListener("click", (event) => {
            if (!this.contains(event.target)) {
                this.$dropdown.style.display = "none";
            }
        });
    
        this.$dropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    
        this.$update.addEventListener("click", (event) => {
            event.preventDefault();
            this.campInfoHandler("form", "camp", this.campId);
        });
    
        this.$delete.addEventListener("click", (event) => {
            event.preventDefault();
            
            if (document.querySelector("deletecamppopup-れ")) return;
        
            const popup = document.createElement("deletecamppopup-れ");
            popup.setAttribute("camp-id", this.campId);
        
            popup.addEventListener("campDeleted", (event) => {
                this.tabHandler("campoverviewpage");

            });
        
            document.body.appendChild(popup);
        });
        
    }
    

    campInfoHandler(tabId, componentName, componentId) {
        this.dispatchEvent(new CustomEvent('tabID', {
            bubbles: true,
            composed: true,
            detail: {tabId, componentName, componentId}
        })); 
    }

    toggleDropdown() {
        if (this.$dropdown.style.display === "none") {
            this.$dropdown.style.display = "block";
        } else {
            this.$dropdown.style.display = "none";
        }
    }

    toggleVisibility() {
        if (this.getAttribute("archived") === "true") {
            this.updateCamp({archived: false});
            this.setAttribute("archived", "false");
        } else {
            this.updateCamp({archived: true});
            this.setAttribute("archived", "true");
        }
    }

    tabHandler(id) {
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: id
        })); 
    }

    //services
    async updateCamp(data) {
        try {
            const ID = this.campId;
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + `/camps/${ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            const result = await response.json(); 
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
//#endregion CLASS