//#region IMPORTS
import "../../campForm/formItem/formItem.js"
//#endregion IMPORTS

//#region CAMPFORM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/campForm/style.css';
    </style>

    <form class="campforum">
        <img id="imagePreview" src="" alt="Afbeelding preview">
        <button type="submit">Kamp opslaan</button>
    </form>
`;
//#endregion CAMPFORM

//#region CLASS
window.customElements.define('campform-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$form = this._shadowRoot.querySelector(".campforum");
        this.$imagePreview = this._shadowRoot.querySelector("#imagePreview");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

        //dynamisch toevoegen van velden in de forum
        const items = [
            { id: "title", label: "Kamp titel", type: "text", size: "full" },
            { id: "startDate", label: "Start datum", type: "date", size: "half" },
            { id: "endDate", label: "Eind datum", type: "date", size: "half"},
            { id: "startAge", label: "Start leeftijd", type: "number", size: "half" },
            { id: "endAge", label: "Eind leeftijd", type: "number", size: "half" },
            { id: "startTime", label: "Start uur", type: "time", size: "half" },
            { id: "endTime", label: "Eind uur", type: "time", size: "half" },
            { id: "location", label: "Locatie", type: "text", size: "full" },
            { id: "image", label: "Afbeelding toevoegen", type: "file", size: "half" },
        ];

        //voor elk item in de navbar de id en label setten
        items.forEach(({ id, label, type, size }) => {
            const field = document.createElement("formItem-れ");
            field.setAttribute("id", id);
            field.setAttribute("label", label);
            field.setAttribute("type", type);
            field.setAttribute("style",  `grid-area: ${id}`);
            field.setAttribute("size", size);
            this.$form.appendChild(field)
        });

        this.$form.addEventListener("submit", async (event) => {
            event.preventDefault(); // voorkomt reload
        
            const formData = {}; // JSON-formaat van de data in forum
            const fileReaders = [];
        
            items.forEach(({ id }) => {
                const input = this.shadowRoot.querySelector(`formitem-れ[id="${id}"]`);
                
                if (input.type === "file") {
                    const file = input.shadowRoot.querySelector("input").files[0];
                    if (file) {
                        const reader = new FileReader();
                        fileReaders.push(new Promise((resolve) => {
                            reader.onload = (e) => {
                                formData[id] = e.target.result; // Base64-string opslaan
                                resolve();
                            };
                            reader.readAsDataURL(file);
                        }));
                    }
                } else {
                    formData[id] = input ? input.shadowRoot.querySelector("input").value : "";
                }
            });
        
            // Wacht op alle FileReader-operaties
            await Promise.all(fileReaders);
        
            console.log("Formulier data:", formData);
        });
        

        this.addEventListener("image", this.handler);
    }   

    handler(e) {
        this.$imagePreview.setAttribute("src", e.detail);
        this.$imagePreview.style.display = "block";
    }


});
//#endregion CLASS