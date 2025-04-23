//#region IMPORTS
//#endregion IMPORTS

//#region ADDGROUP
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/group/addGroup/style.css';
    </style>
    <form autocomplete="off">
        <label for="groupname">Groepsnaam:</label><br>
        <input type="text" id="groupname" name="groupname" required autocomplete="off"><br>
        <label for="members">Leden:</label><br>
        <input type="text" id="members" name="members" autocomplete="off"><br>
        <label for="microbitId">Micro:bit Id:</label><br>
        <input type="text" id="microbitId" name="microbitId" autocomplete="off"><br>
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
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    connectedCallback() {
        this._shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        e.preventDefault();

        const name = this._shadowRoot.querySelector('#groupname').value;
        const members = this._shadowRoot.querySelector('#members').value;
        const microbitId = this._shadowRoot.querySelector('#microbitId').value;

        this.dispatchEvent(new CustomEvent('create-group', {
            bubbles: true,
            composed: true,
            detail: { name, members, microbitId }
        }));

        e.target.reset();
    }
});
//#endregion CLASS
