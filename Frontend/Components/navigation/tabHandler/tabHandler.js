//#region IMPORTS
import "../../../Components/navigation/header/header.js"
import "../../pages/content/content.js"
import "../../pages/pageOne/pageOne.js"
import "../../pages/pageTwo/pageTwo.js"
import "../../pages/pageThree/pageThree.js"
import "../../reusable/form/form.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/tabHandler/style.css';
    </style>

    <header-れ></header-れ>
    <content-れ></content-れ> 
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('tabhandler-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$content = this._shadowRoot.querySelector("content-れ");
        this.$header = this._shadowRoot.querySelector("header-れ");  
        this.landingPage = 'form';
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$content.setAttribute("active-tab", this.landingPage);
        const items = [
            { id: "home", label: "Home" },
            { id: "overzicht", label: "Overzicht" },
            { id: "spel", label: "Spel" },
            { id: "microbit", label: "Micro:bit" },
            { id: "groepen", label: "Groepen" },
            { id: "users", label: "Gebruikers" },
            { id: "sign-up", label: "Nieuw account" },
            { id: "logout", label: "Logout" },
            { id: "form", label: "Forum" },
            { id: "pageone", label: "Pagina 1" },
            { id: "pagetwo", label: "Pagina 2" },
            { id: "pagethree", label: "Pagina 3" }
        ];

        this.addEventListener("tab", this.tabHandler);   
        this.addEventListener("import", this.importHandler);   
        this.$header.setAttribute("tabs", JSON.stringify(items))
    }

    tabHandler(e) {
        this.$content.setAttribute("active-tab", e.detail);
    }
});
//#endregion CLASS