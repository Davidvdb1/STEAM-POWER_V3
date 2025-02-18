//#region IMPORTS
import "../../../Components/navigation/navigationItem/navigationItem.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`  
    <style>
        @import './components/navigation/navigationList/style.css';
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
        this.$list = this._shadowRoot.querySelector("ul");
    }

    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {}

    connectedCallback() {

        //dynamisch toevoegen van linken in de navigatie
        const items = [
            { id: "home", label: "Home" },
            { id: "overzicht", label: "Overzicht" },
            { id: "spel", label: "Spel" },
            { id: "microbit", label: "Micro:bit" },
            { id: "groepen", label: "Groepen" },
            { id: "users", label: "Gebruikers" },
            { id: "sign-up", label: "Nieuw account"},
            { id: "logout", label: "Logout" },
            { id: "campform", label: "Forum"}
        ];

        //voor elk item in de navbar de id en label setten
        items.forEach(({ id, label }) => {
            const item = document.createElement("navigationitem-れ");
            item.setAttribute("id", id);
            item.setAttribute("label", label);
            this.$list.appendChild(item);
        });
    }    
});
//#endregion CLASS