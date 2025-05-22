//#region IMPORTS
import "../../../Components/navigation/header/header.js"
import "../../pages/content/content.js"
import "../../pages/workshopPage/workshopPage.js"
import "../../pages/campOverviewPage/campOverviewPage.js"
import "../../pages/groupOverviewPage/groupOverviewPage.js"
import "../../pages/userOverviewPage/userOverviewPage.js"
import "../../pages/campInfoPage/campInfoPage.js"
import "../../pages/microbitPage/microbitPage.js"
import "../../camp/formContainer/formContainer.js"
import "../../pages/userLoginPage/userLoginPage.js"
import "../../pages/groupLoginPage/groupLoginPage.js"
import "../../pages/workshopInfo/workshopInfo.js"
import "../../authentication/logout/logout.js"
import "../../pages/questionAdminPage/questionAdminPage.js"
import "../../pages/quizPage/quizPage.js"
import "../../pages/leaderboardPage/leaderboardPage.js"
import "../../pages/gamePage/gamePage.js"
//#endregion IMPORTS

//#region TABHANDLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/navigation/tabHandler/style.css';
    </style>

    <div class="background-layer"></div>
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
        this.loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        this.allowNavigation = false;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.landingPage = "campoverviewpage";
        this.campID = null;
        this.workshopID = null;

        this.$content.setAttribute("active-tab", this.landingPage);
        this.$content.setAttribute("camp", this.campID);
        this.$content.setAttribute("workshop", this.workshopID);

        this.addEventListener("tab", this.tabHandler.bind(this));
        this.addEventListener("tabID", this.tabIdHandler.bind(this));

        this.renderHeader();

        window.addEventListener('popstate', this.handlePopState.bind(this));

        this.updateURL(this.landingPage, this.campID, this.workshopID);
    }

    renderHeader() {
        const role = this.loggedInUser?.role;
        const items = {
            "GUEST": [
                { id: "campoverviewpage", label: "Home" },
                { id: "userloginpage", label: "Leerkracht aanmelden" },
                { id: "grouploginpage", label: "Groep aanmelden" },
            ],
            "TEACHER": [
                { id: "campoverviewpage", label: "Home" },
                { id: "leaderboard", label: "Leaderboard" },
                { id: "groupoverviewpage", label: "Groepen" },
                { id: "quiz", label: "Quiz" },
                { id: "microbitpage", label: "Micro:bit" },
                { id: "questionadmin", label: "Vragen aanpassen" },
                { id: "logout", label: "Logout" },
            ],
            "ADMIN": [
                { id: "campoverviewpage", label: "Home" },
                { id: "leaderboard", label: "Leaderboard" },
                { id: "quiz", label: "Quiz" },
                { id: "gamepage", label: "Spel" },
                { id: "microbitpage", label: "Micro:bit" },
                { id: "groupoverviewpage", label: "Groepen" },
                { id: "useroverviewpage", label: "Gebruikers" },
                { id: "questionadmin", label: "Vragen aanpassen" },
                { id: "logout", label: "Logout" },
            ],
            "GROUP": [
                { id: "campoverviewpage", label: "Home" },
                { id: "leaderboard", label: "Leaderboard" },
                { id: "quiz", label: "Quiz" },
                { id: "gamepage", label: "Spel" },
                { id: "microbitpage", label: "Micro:bit" },
                { id: "logout", label: "Logout" },
            ]
        };

        this.$header.setAttribute("tabs", JSON.stringify(items[role] || items["GUEST"]));
    }

    tabHandler(e) {
        if (this.loggedInUser?.role != JSON.parse(sessionStorage.getItem('loggedInUser'))?.role) {
            this.loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
            this.renderHeader();
        }
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
        const { tab, camp, workshop } = event.state || { tab: this.landingPage, camp: null, workshop: null };
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