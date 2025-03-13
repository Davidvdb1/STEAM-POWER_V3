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
        <div class="dropdown">
            <button id="addexisting">Bestaande Workshop Toevoegen</button>
            <div class="dropdown-content">
                <button id="confirmSelection">Bevestigen</button>
                <ul id="workshopList"></ul>
            </div>
        </div>
        <button id="addnew">Nieuwe Workshop Toevoegen</button>
    </div>
    <p id="statusmessage"></p>
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
        this.$workshopList = this._shadowRoot.querySelector("#workshopList");
        this.$addNew = this._shadowRoot.querySelector("#addnew");
        this.$dropdown = this._shadowRoot.querySelector(".dropdown");
        this.$confirmButton = this._shadowRoot.querySelector("#confirmSelection");
        this.$camp = null;
        this.$unlinkedworkshops = null;
        this.$selectedWorkshops = new Set();
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
        this.$addNew.addEventListener('click', () => {
            this.tabWithCampHandler("workshoppage", "camp", this.getAttribute("camp"));
        });

        this.$addExisting.addEventListener("click", () => this.toggleDropdown());
        this.$confirmButton.addEventListener("click", () => this.confirmSelection());
    }

    toggleDropdown() {
        this.$dropdown.classList.toggle("open");
    }

    async confirmSelection() {
        this.$dropdown.classList.toggle("open");
        console.log("Selected workshops:", this.$selectedWorkshops);
        const workshopPromises = [...this.$selectedWorkshops].map(async (workshopId) => {
            const workshop = await this.fetchWorkshopWithId(workshopId);
            return this.createWorkshop(workshop.html, workshop.title);
        });
    
        await Promise.all(workshopPromises);
        this.updateStatusMessage("✅ Alle workshops zijn succesvol verwerkt. Pagina wordt herladen...", "success");

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    

    updateCampInfo() {
        if (!this.$camp) return;

        this.$workshops.innerHTML = "";

        this.$camp.workshops.forEach(workshop => {
            let workshopPreview = document.createElement('workshoppreview-れ');
            workshopPreview.setAttribute("html", workshop.html);
            workshopPreview.setAttribute("workshop", workshop.id);
            this.$workshops.appendChild(workshopPreview);
        });

        this.$title.innerHTML = this.$camp.name;
        this.fetchUnlinkedWorkshops();
    }

    updateStatusMessage(message, type) {
        const statusMessage = this._shadowRoot.querySelector("#statusmessage");
        statusMessage.textContent = message;
        statusMessage.style.color = type === "success" ? "green" : "red";
    }

    populateWorkshopDropdown(workshops) {
        this.$workshopList.innerHTML = "";
    
        if (workshops.length === 0) {
            this.$workshopList.innerHTML = "<li>Geen beschikbare workshops</li>";
        }
    
        workshops.forEach(async (workshop) => {

            const campName = await this.fetchCampNameWithId(workshop.campId)
            const li = document.createElement("li");
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
    
            checkbox.type = "checkbox";
            checkbox.value = workshop.title;
            checkbox.addEventListener("change", () => this.toggleSelection(workshop.id, checkbox.checked));
    
            label.appendChild(checkbox);
    
            const title = workshop.title + " - " + campName;
            label.appendChild(document.createTextNode(title));
    
            li.appendChild(label);
            this.$workshopList.appendChild(li);
        });
    }

    toggleSelection(workshopId, isChecked) {
        if (isChecked) {
            this.$selectedWorkshops.add(workshopId);
        } else {
            this.$selectedWorkshops.delete(workshopId);
        }
    }

    tabWithCampHandler(tabId, componentName, componentId) {
        this.dispatchEvent(new CustomEvent('tabID', {
            bubbles: true,
            composed: true,
            detail: {tabId, componentName, componentId}
        })); 
    }

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

    async fetchCampNameWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${id}?includeworkshops=true`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const camp = await response.json();
            return camp.name;

    
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }


    async fetchUnlinkedWorkshops() {
        try {
            if (!this.$camp || !this.$camp.id) return;
    
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/unlinked-workshops/${this.$camp.id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const workshops = await response.json();
    
            this.$unlinkedworkshops = workshops;
            this.populateWorkshopDropdown(this.$unlinkedworkshops);
        } catch (error) {
            console.error("Fout bij ophalen van niet-gekoppelde workshops:", error);
        }
    }

    async fetchWorkshopWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const workshop = await response.json();
            return workshop;
    
        } catch (error) {
            console.error("Fout bij ophalen van workshop:", error);
        }
    }

    async addWorkshopToCamp(campId, workshopId) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${campId}/workshop/${workshopId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`❌ HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
    
            return data;
        } catch (error) {
            console.error("❌ Fout bij toevoegen van workshop aan kamp:", error);
            return null; // Zorgt ervoor dat de functie geen crash veroorzaakt
        }
    }

    async createWorkshop(html, title) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ html, title })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            this.$workshop = await response.json();
            const workshop = this.$workshop.workshop

    
            if (!workshop || !workshop.id) {
                throw new Error("Workshop ID niet gevonden na aanmaken!");
            }
    
            // 🔹 Voeg de workshop toe aan het kamp
            const campId = this.getAttribute("camp");
            await this.addWorkshopToCamp(campId, workshop.id);
    
        } catch (error) {
            console.error("❌ Fout bij aanmaken van workshop:", error);
            this.updateStatusMessage("❌ Fout bij aanmaken van workshop.", "error");
        }
    }
});
//#endregion CLASS
