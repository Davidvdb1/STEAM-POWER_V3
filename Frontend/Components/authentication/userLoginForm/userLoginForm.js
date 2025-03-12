//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/authentication/userLoginForm/style.css';
    </style>
    <form class="user-login-form">
        <input type="text" name="username" placeholder="Gebruikersnaam" required>
        <input type="password" name="password" placeholder="Wachtwoord" required>
        <button type="submit">Aanmelden</button>
        <p class="error-message" style="display: none; color: red;"></p>
    </form>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('userloginform-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.errorMessageElement = this._shadowRoot.querySelector('.error-message');
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this._shadowRoot.querySelector('.user-login-form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();

        this.errorMessageElement.style.display = 'none';

        const form = event.target;
        const data = new FormData(form);
        const username = data.get('username');
        const password = data.get('password');
        
        try {
            const response = await this.login(username, password);
    
            if (response.ok) {
                const data = await response.json();
                const token = data.JWT;
                sessionStorage.setItem('loggedInUser',
                    JSON.stringify(token)
                );
                // TODO: redirect to home page
            } else {
                const message = await response.json();
                this.errorMessageElement.textContent = message.error || 'Inloggen mislukt. Probeer het opnieuw.';
                this.errorMessageElement.style.display = 'block';
            }
        } catch {
            this.errorMessageElement.textContent = 'Inloggen mislukt. Probeer het opnieuw.';
            this.errorMessageElement.style.display = 'block';
        }
    }
    
    //service
    async login(username, password) {
        return await fetch(window.env.BACKEND_URL + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });
    }
});
//#endregion CLASS