//#region IMPORTS
import "../../../Components/navigation/header/header.js"
import "../../pages/content/content.js"
import "../../pages/workshopPage/workshopPage.js"
import "../../pages/campOverviewPage/campOverviewPage.js"
import "../../pages/campInfoPage/campInfoPage.js"
import "../../pages/microbitPage/microbitPage.js"
import "../../camp/formContainer/formContainer.js"
import "../../pages/userLoginPage/userLoginPage.js"
import "../../pages/groupLoginPage/groupLoginPage.js"
import "../../pages/workshopInfo/workshopInfo.js"   
import "../../pages/graphPage/graphPage.js"
import "../../authentication/logout/logout.js"
import "../../pages/questionAdminPage/questionAdminPage.js"
import "../../pages/quizPage/quizPage.js"
//#endregion IMPORTS

//#region TABHANDLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/tabHandler/style.css';
    </style>

    <header-れ></header-れ>
    <content-れ></content-れ> 
`;
//#endregion TABHANDLER

//#region CLASS
window.customElements.define('tabhandler-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$content = this._shadowRoot.querySelector("content-れ");
        this.$header = this._shadowRoot.querySelector("header-れ");
        this.landingPage = "campoverviewpage";
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get("tab");
        const campIDFromUrl = urlParams.get("camp");
        const workshopIDFromUrl = urlParams.get("workshop");
    
        this.landingPage = tabFromUrl || "campoverviewpage";
        this.campID = campIDFromUrl
        this.workshopID = workshopIDFromUrl

        this.$content.setAttribute("active-tab", this.landingPage);
        this.$content.setAttribute("camp", this.campID);
        this.$content.setAttribute("workshop", this.workshopID);

        const items = [
            { id: "campoverviewpage", label: "Home" },
            { id: "leaderboard", label: "Leaderboard" },
            { id: "quiz", label: "Quiz" },
            { id: "spel", label: "Spel" },
            { id: "microbitpage", label: "Micro:bit" },
            { id: "graphpage", label: "Grafieken" },
            { id: "groepen", label: "Groepen" },
            { id: "users", label: "Gebruikers" },
            { id: "sign-up", label: "Nieuw account" },
            { id: "logout", label: "Logout" },
            { id: "userloginpage", label: "Leerkracht aanmelden" },
            { id: "questionadmin", label: "Vragen aanpassen" },
            { id: "grouploginpage", label: "Groep aanmelden" }
        ];

        this.addEventListener("tab", this.tabHandler);
        this.addEventListener("tabID", this.tabIdHandler);
        this.$header.setAttribute("tabs", JSON.stringify(items));

        window.addEventListener('popstate', this.handlePopState.bind(this));

        this.updateURL(this.landingPage, this.campID, this.workshopID);
    }


    tabHandler(e) {
        this.$content.setAttribute("active-tab", e.detail);
        this.$content.setAttribute("camp", "");
        this.$content.setAttribute("workshop", "");
        this.updateURL(e.detail, "");
    }

    tabIdHandler(e) {
        this.$content.setAttribute("active-tab", e.detail.tabId);
        this.$content.setAttribute(e.detail.componentName, e.detail.componentId);
        this.updateURL(e.detail.tabId, e.detail.componentId);
    }

    handlePopState(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = event.state?.tab || urlParams.get("tab")
        const camp = event.state?.camp || urlParams.get("camp")
        const workshop = event.state?.workshop || urlParams.get("workshop")

        this.$content.setAttribute("active-tab", tab);
        this.$content.setAttribute("camp", camp);
        this.$content.setAttribute("workshop", workshop);
    }

    updateURL(tab, camp, workshop) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);

        if (camp) {
            url.searchParams.set('camp', camp);
        } else {
            url.searchParams.delete('camp');
        }

        if (workshop) {
            url.searchParams.set('workshop', workshop);
        } else {
            url.searchParams.delete('workshop');
        }

        history.pushState({ tab, camp: camp, workshop: workshop }, '', url);
    }
});
//#endregion CLASS