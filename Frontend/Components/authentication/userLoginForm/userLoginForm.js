//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/authentication/userLoginForm/style.css';
    </style>
    <form class="user-login-form">
        <input type="text" placeholder="Gebruikersnaam" required>
        <input type="password" placeholder="Wachtwoord" required>
        <button type="submit">Aanmelden</button>
    </form>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('userloginform-れ', class extends HTMLElement {
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

    }

});
//#endregion CLASS