//#region IMPORTS
//#endregion IMPORTS

//#region FORMITEM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import '/Frontend/Components/camp/formItem/style.css';
    </style>

    <label for=""></label>
    <input required>
`;
//#endregion FORMITEM

//#region CLASS
window.customElements.define('formitem-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$label = this._shadowRoot.querySelector("label");
        this.$input = this._shadowRoot.querySelector("input");
    }

    // component attributes
    static get observedAttributes() {
        return ['id', 'label', 'type'];
    }

    imagePreviewHandler(source) {
        this.dispatchEvent(new CustomEvent('image', {
            bubbles: true,
            composed: true,
            detail: source
        }));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'label') {
            this.$label.textContent = newValue;
        }
        if (name === 'id') {
            this.$input.id = newValue;
            this.$label.id = newValue + "Label";
            this.$label.setAttribute("for", newValue);
        }

        if (name === 'type') {
            if (newValue === "select") {
                const select = document.createElement('select');
                select.required = true;
                select.id = this.getAttribute('id') || '';
        
                this.$input.replaceWith(select);
                this.$input = select;

                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Kies een locatie';
                placeholder.disabled = true;
                placeholder.selected = true;
                select.appendChild(placeholder);
        
                this.fetchCamps();
            } else {
                this.$input.type = newValue;
            }
        }
    }

    connectedCallback() {
        this.$input.addEventListener("change", (e) => {
            if (this.$input.tagName === 'SELECT') {
                if (e.target.value === 'new-location') {
                    this.replaceSelectWithInput();
                }
            } else if (this.$input.type === "file") {
                const file = e.target.files[0];
                if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.imagePreviewHandler(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });        
    }

    replaceSelectWithInput() {
        const input = document.createElement('input');
        input.required = true;
        input.id = this.getAttribute('id') || '';
        input.type = 'text'; // gewone tekstinput
    
        this.$input.replaceWith(input);
        this.$input = input;
    
        // optioneel: focus direct op het inputveld
        this.$input.focus();
    }    

    //services
    async fetchCamps() {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + '/camps');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
            const data = await response.json();
            const uniqueLocations = [...new Set(data.map(camp => camp.address))];
            const locations = uniqueLocations.map(location => ({ location }));
    
            // Reset
            this.$input.innerHTML = '';
    
            // 📌 1. Placeholder bovenaan
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Kies een locatie';
            placeholder.disabled = true;
            placeholder.selected = true;
            this.$input.appendChild(placeholder);
    
            // 📌 2. Nieuwe locatie knop direct daaronder
            const newLocationOption = document.createElement('option');
            newLocationOption.value = 'new-location';
            newLocationOption.textContent = '➕ Nieuwe locatie'; 
            newLocationOption.style.fontWeight = 'bold';
            newLocationOption.style.color = '#007BFF'; 
            newLocationOption.style.cursor = 'pointer';
            this.$input.appendChild(newLocationOption);
    
            // 📌 3. Dan alle bestaande locaties
            locations.forEach(({ location }) => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                this.$input.appendChild(option);
            });
    
        } catch (error) {
            console.error("Fout bij ophalen van kampen:", error);
        }
    }
});
//#endregion CLASS