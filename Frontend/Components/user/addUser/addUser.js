//#region IMPORTS
//#endregion IMPORTS

//#region ADDUSER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/user/addUser/style.css';
    </style>
    <form autocomplete="off">
        <label for="username">Gebruikersnaam:</label><br>
        <input type="text" id="username" name="username" required autocomplete="off"><br>
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required autocomplete="off"><br>
        <label for="password">Wachtwoord:</label><br>
        <input type="password" id="password" name="password" required autocomplete="off"><br>
        <label for="role">Rol:</label><br>
        <select id="role" name="role" required>
            <option value="TEACHER">TEACHER</option>
            <option value="ADMIN">ADMIN</option>
        </select><br>
        <input type="submit" value="Maak gebruiker aan">
    </form>
`;
//#endregion ADDUSER

//#region CLASS 
window.customElements.define('adduser-れ', class extends HTMLElement {
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

        const username = this._shadowRoot.querySelector('#username').value;
        const email = this._shadowRoot.querySelector('#email').value;
        const password = this._shadowRoot.querySelector('#password').value;
        const role = this._shadowRoot.querySelector('#role').value;

        this.dispatchEvent(new CustomEvent('create-user', {
            bubbles: true,
            composed: true,
            detail: { username, email, password, role }
        }));

        e.target.reset();
    }
});
//#endregion CLASS
