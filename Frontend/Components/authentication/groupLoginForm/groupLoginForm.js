//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/authentication/groupLoginForm/style.css';
    </style>
    <form class="group-login-form">
        <input type="text" name="code" placeholder="Code" required>
        <button type="submit">Aanmelden</button>
        <p class="error-message" style="display: none; color: red;"></p>
    </form>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('grouploginform-れ', class extends HTMLElement {
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
        this._shadowRoot.querySelector('.group-login-form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();

        this.errorMessageElement.style.display = 'none';

        const form = event.target;
        const data = new FormData(form);
        const code = data.get('code');
        
        try {
            const response = await this.login(code);
    
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
    async login(code) {
        return await fetch(window.env.BACKEND_URL + '/groups/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code
            })
        });
    }

});
//#endregion CLASS