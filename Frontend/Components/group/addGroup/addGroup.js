//#region IMPORTS
//#endregion IMPORTS

//#region ADDGROUP
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/group/addGroup/style.css';
        
        .error-message {
            color: red;
            margin-top: 10px;
            font-weight: bold;
            display: none;
        }
    </style>
    <form>
        <label for="groupname">Groepsnaam:</label><br>
        <input type="text" id="groupname" name="groupname" required><br>
        <label for="members">Leden:</label><br>
        <input type="text" id="members" name="members"><br>
        <label for="microbitId">Micro:bit Id:</label><br>
        <input type="text" id="microbitId" name="microbitId"><br>
        <div class="error-message" id="error-message"></div>
        <input type="submit" value="Maak groep aan">
    </form>
`;
//#endregion ADDGROUP

//#region CLASS 
window.customElements.define('addgroup-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['error'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'error' && newValue) {
            this.showError(newValue);
        } else if (name === 'error' && !newValue) {
            this.hideError();
        }
    }

    connectedCallback() {
        this._shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        e.preventDefault();

        // Hide any previous error message
        this.hideError();

        const name = this._shadowRoot.querySelector('#groupname').value;
        const members = this._shadowRoot.querySelector('#members').value;
        const microbitId = this._shadowRoot.querySelector('#microbitId').value;

        this.dispatchEvent(new CustomEvent('create-group', {
            bubbles: true,
            composed: true,
            detail: { name, members, microbitId }
        }));

        // Don't reset the form here as we might need to show an error message
        // The form will be reset after successful group creation
    }
    
    showError(message) {
        const errorElement = this._shadowRoot.querySelector('#error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    hideError() {
        const errorElement = this._shadowRoot.querySelector('#error-message');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    resetForm() {
        this._shadowRoot.querySelector('form').reset();
        this.hideError();
    }
});
//#endregion CLASS
