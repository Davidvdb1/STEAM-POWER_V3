//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/questions/confirmDeleteForm/style.css';
    </style>

    <div id="button-container">
        <button id="confirm">Ja</button>
        <button id="cancel">Nee</button>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('confirmquestiondeleteform-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$confirm = this._shadowRoot.querySelector('#confirm');
        this.$cancel = this._shadowRoot.querySelector('#cancel');

        this.$confirm.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("confirm-delete", {
                bubbles: true,
                composed: true,
                detail: {
                    id: this.getAttribute("id")
                }
            }))
        })

        this.$cancel.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("cancel-delete", {
                bubbles: true,
                composed: true,
            }))
        })
    }

});
//#endregion CLASS