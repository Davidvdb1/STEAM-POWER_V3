//#region IMPORTS
//#endregion IMPORTS

//#region LOGOUT
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/authentication/userLoginForm/style.css';
    </style>
`;
//#endregion LOGOUT

//#region CLASS
window.customElements.define('logout-れ', class extends HTMLElement {
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
        const confirmation = confirm("Weet je zeker dat je wilt uitloggen?");
        if (confirmation) {
            sessionStorage.removeItem('loggedInUser');
            this.dispatchEvent(new CustomEvent('tab', {
                bubbles: true,
                composed: true,
                detail: "campoverviewpage"
            }));
        } else {
            const currentUrl = window.location.href;
            window.location.href = currentUrl; // Blijf op dezelfde pagina als de gebruiker annuleert
        }
    }
});
//#endregion CLASS