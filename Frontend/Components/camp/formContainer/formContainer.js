//#region IMPORTS
import "../formItem/formItem.js"
//#endregion IMPORTS

//#region FORM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/camp/formContainer/style.css';
    </style>

    <h1>Kamp toevoegen</h1> 
    <p id="statusmessage"></p>
    <form class="form">
        <img id="imagePreview" src="" alt="Afbeelding preview">
        <button>Kamp opslaan</button>
    </form>
`;
//#endregion FORM

//#region CLASS
window.customElements.define('form-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$form = this._shadowRoot.querySelector(".form");
        this.$imagePreview = this._shadowRoot.querySelector("#imagePreview");
        this.$button = this._shadowRoot.querySelector("button");
        
        this.items = [
            { id: "title", label: "Kamp titel", type: "text", amountInRow: "one" },
            { id: "startDate", label: "Start datum", type: "date", amountInRow: "two" },
            { id: "endDate", label: "Eind datum", type: "date", amountInRow: "two"},
            { id: "startAge", label: "Start leeftijd", type: "number", amountInRow: "two" },
            { id: "endAge", label: "Eind leeftijd", type: "number", amountInRow: "two" },
            { id: "startTime", label: "Start uur", type: "time", amountInRow: "two" },
            { id: "endTime", label: "Eind uur", type: "time", amountInRow: "two" },
            { id: "location", label: "Locatie", type: "text", amountInRow: "one" },
            { id: "image", label: "Afbeelding toevoegen", type: "file", amountInRow: "two" },
        ];

        // grid styling
        this.amountOfRows = 7;
        this.amountOfColumns = 2;
        this.gridFormat = `"title title"
                            "startDate endDate"
                            "startAge endAge"
                            "startTime endTime"
                            "location location"
                            "imagePreview imagePreview"
                            "image submit"`;
        this.$form.setAttribute("style",   `grid-template-rows: repeat(${this.amountOfRows}, auto [row-start]); 
            grid-template-columns: repeat(${this.amountOfColumns}, 50% [col-start]); 
            grid-template-areas: ${this.gridFormat}`);
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.items.forEach(({ id, label, type, amountInRow }) => {
            const field = document.createElement("formItem-れ");
            field.setAttribute("id", id);
            field.setAttribute("label", label);
            field.setAttribute("type", type);
            field.setAttribute("style",  `grid-area: ${id}`);
            field.setAttribute("amountInRow", amountInRow);
            this.$form.appendChild(field);
        });
    
        console.log("Alle formItems geladen:", this.$form.querySelectorAll("formItem-れ")); // Debugging
    
        this.$button.addEventListener("click", async (event) => {
            event.preventDefault();
            this.formatAndSendData();
        });
    
        this.addEventListener("image", this.previewImage);
    }
     

    previewImage(e) {
        this.$imagePreview.setAttribute("src", e.detail);
        this.$imagePreview.style.display = "block";
    }

    async formatAndSendData() {
        const formData = {};
        const fileReaders = [];
    
        this.items.forEach(({ id }) => {
            const input = this.shadowRoot.querySelector(`formitem-れ[id="${id}"]`);
            if (!input) return;
    
            const realInput = input.shadowRoot.querySelector("input");
    
            if (realInput?.type === "file" && realInput.files[0]) {
                const reader = new FileReader();
                fileReaders.push(new Promise((resolve) => {
                    reader.onload = (e) => {
                        formData["picture"] = e.target.result; 
                        resolve();
                    };
                    reader.readAsDataURL(realInput.files[0]);
                }));
            } else {
                formData[id] = realInput?.value || "";
            }
        });
    
        await Promise.all(fileReaders);
    
        const fixedData = {
            name: formData.title,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            minAge: parseInt(formData.startAge),
            maxAge: parseInt(formData.endAge),
            startTime: formData.startTime,
            endTime: formData.endTime,
            address: formData.location,
            picture: formData.picture || "", 
            archived: false
        };
    
        this.createCamp(fixedData);
    }
    

    tabHandler(id) {
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: id
        })); 
    }

    updateStatusMessage(message, type) {
        const statusMessage = this._shadowRoot.querySelector("#statusmessage");
        statusMessage.textContent = message;
        statusMessage.style.color = type === "success" ? "green" : "red";
    }  

    //service
    async createCamp(data) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + '/camps', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log("Succesvol toegevoegd:", result);
                this.updateStatusMessage("✅ Kamp succesvol toegevoegd!", "success");
                setTimeout(() => {
                    this.tabHandler("campoverviewpage");
                }, 1000);        
            } else {
                console.error("Fout bij toevoegen:", response.statusText);
                this.updateStatusMessage("❌ Er is een fout opgetreden bij het opslaan van het kamp.", "error");
            }
        } catch (error) {
            console.error("Netwerkfout:", error);
            this.updateStatusMessage("❌ Kan geen verbinding maken met de server.", "error");
        }
    }
    
});
//#endregion CLASS