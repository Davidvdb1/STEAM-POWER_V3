//#region IMPORTS
//#endregion IMPORTS

//#region DELETECAMPPOPUP
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/camp/deleteCampPopup/style.css';
    </style>

    <div class="popup-overlay">
        <div class="popup-container">
            <h2>Weet je zeker dat je dit kamp wilt verwijderen?</h2>
            <div class="popup-buttons">
                <button class="cancel">Annuleren</button>
                <button class="confirm">Verwijderen</button>
            </div>
        </div>
    </div>
`;
//#endregion DELETECAMPPOPUP

//#region CLASS
window.customElements.define('deletecamppopup-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$cancelButton = this._shadowRoot.querySelector(".cancel");
        this.$confirmButton = this._shadowRoot.querySelector(".confirm");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.campId = this.getAttribute("camp-id");

        this.$cancelButton.addEventListener("click", () => this.closePopup());
        this.$confirmButton.addEventListener("click", () => {
            this.confirmDeletion()
        });
    }

    closePopup() {
        this.remove();
    }

    deleteCampHandler(campId) {
        this.dispatchEvent(new CustomEvent('campDeleted', {
            bubbles: true,
            composed: true,
            detail: campId
        })); 
    }

    //service
    async confirmDeletion() {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${this.campId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.deleteCampHandler(this.campId);
            this.closePopup();
        } catch (error) {
            console.error("Fout bij verwijderen van kamp:", error);
            alert("Er is iets misgegaan bij het verwijderen van het kamp.");
        }
    }

});
//#endregion CLASS