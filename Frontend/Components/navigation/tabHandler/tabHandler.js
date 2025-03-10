//#region IMPORTS
import "../../../Components/navigation/header/header.js"
import "../../pages/content/content.js"
import "../../pages/workshopPage/workshopPage.js"
import "../../pages/campOverviewPage/campOverviewPage.js"
import "../../pages/campInfoPage/campInfoPage.js"
import "../../pages/microbitPage/microbitPage.js"
import "../../camp/formContainer/formContainer.js"
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
        this.landingPage = "campinfopage";
        this.componentID = "e06b5cdb-3a2f-4186-a340-8996d444e3a4";
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$content.setAttribute("active-tab", this.landingPage);
        this.$content.setAttribute("componentid", this.componentID);
        const items = [
            { id: "campoverviewpage", label: "Home" },
            { id: "workshoppage", label: "Workshop" },
            { id: "overzicht", label: "Overzicht" },
            { id: "spel", label: "Spel" },
            { id: "microbitpage", label: "Micro:bit" },
            { id: "groepen", label: "Groepen" },
            { id: "users", label: "Gebruikers" },
            { id: "sign-up", label: "Nieuw account" },
            { id: "logout", label: "Logout" },
        ];

        this.addEventListener("tab", this.tabHandler);
        this.addEventListener("tabID", this.tabIdHandler);   
        this.addEventListener("import", this.importHandler);   
        this.$header.setAttribute("tabs", JSON.stringify(items));
        
        window.addEventListener('popstate', this.handlePopState.bind(this));
        this.updateURL(this.landingPage);
    }

    tabHandler(e) {
        this.$content.setAttribute("active-tab", e.detail);
        this.$content.setAttribute("componentid", "");
        this.updateURL(e.detail);
    }

    tabIdHandler(e) {
        this.$content.setAttribute("active-tab", e.detail.tabID);
        this.$content.setAttribute("componentid", e.detail.componentID);
    }

    handlePopState(event) {
        const tab = event.state ? event.state.tab : this.landingPage;
        this.$content.setAttribute("active-tab", tab);
    }

    updateURL(tab) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        history.pushState({ tab }, '', url);
    }
});
//#endregion CLASS