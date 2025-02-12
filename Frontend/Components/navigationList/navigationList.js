//#region IMPORTS
import "../../Components/navigationItem/navigationItem.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`  
    <style>
        @import './components/navigationList/style.css';
    </style>

    <ul class="navigationList"></ul>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('navigationlist-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$list = this._shadowRoot.querySelector(".navigationList");
    }

    // component attributes
    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab") {
            console.log(`NavigationList received active-tab: ${newValue}`);
        }

    }

    connectedCallback() {
        const items = [
            { id: "home", label: "Home" },
            { id: "overzicht", label: "Overzicht" },
            { id: "spel", label: "Spel" },
            { id: "microbit", label: "Micro:bit" },
            { id: "groepen", label: "Groepen" },
            { id: "users", label: "Gebruikers" },
            { id: "sign-up", label: "Nieuw account"},
            { id: "logout", label: "Logout" },
        ];

        items.forEach(({ id, label, style }) => {
            const item = document.createElement("navigationitem-れ");
            item.setAttribute("id", id);
            item.setAttribute("label", label);
            this.$list.appendChild(item);
        });
    }    
});
//#endregion CLASS