//#region IMPORTS
import "../formItem/formItem.js"
//#endregion IMPORTS

//#region FORM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/reusable/formContainer/style.css';
    </style>

    <h1>Kamp toevoegen</h1> 
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
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

        //put in the items you want in your form
        const items = [
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

        // set the amount of rows and colums you want in your form
        const amountOfRows = 7;
        const amountOfColumns = 2;

        //the format of your form
        const gridFormat = `"title title"
                            "startDate endDate"
                            "startAge endAge"
                            "startTime endTime"
                            "location location"
                            "imagePreview imagePreview"
                            "image submit"`;

        this.$form.setAttribute("style",   `grid-template-rows: repeat(${amountOfRows}, auto [row-start]); 
                                            grid-template-columns: repeat(${amountOfColumns}, 50% [col-start]); 
                                            grid-template-areas: ${gridFormat}`);


        //set an id, label, type and the amount of items in their row for each item in the form
        items.forEach(({ id, label, type, amountInRow }) => {
            const field = document.createElement("formItem-れ");
            field.setAttribute("id", id);
            field.setAttribute("label", label);
            field.setAttribute("type", type);
            field.setAttribute("style",  `grid-area: ${id}`);
            field.setAttribute("amountInRow", amountInRow);
            this.$form.appendChild(field)
        });

        this.$button.addEventListener("click", async (event) => {
            event.preventDefault();
        
            const formData = {};
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

        this.addEventListener("image", this.previewImage);
   }   

    previewImage(e) {
        this.$imagePreview.setAttribute("src", e.detail);
        this.$imagePreview.style.display = "block";
    }


});
//#endregion CLASS