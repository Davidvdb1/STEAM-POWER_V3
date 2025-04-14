//#region IMPORTS
//#endregion IMPORTS

//#region FORMITEM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import '/Frontend/components/camp/formItem/style.css';
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
            this.$input.type = newValue;
        }
    }

    connectedCallback() {
        //zorgt voor de afbeelding preview in de forum
        this.$input.addEventListener("change", (e) => {
            const file = e.target.files[0]; // Pak het eerste bestand
            console.log(file);
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();

                reader.onload = (event) => {
                    this.imagePreviewHandler(event.target.result);
                };

                reader.readAsDataURL(file); // Converteer de afbeelding naar een data URL
            }
        });
    }
});
//#endregion CLASS