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
        sessionStorage.removeItem('loggedInUser');
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: "campoverviewpage"
        }));
    }    
});
//#endregion CLASS