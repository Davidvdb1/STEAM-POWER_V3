//#region IMPORTS
import "../../game/gameControlPanel/gameControlPanel.js"
import "../../game/gameAdminPanel/gameAdminPanel.js"
import {ScoreCalculations} from "../../game/utils/scoreCalculations.js";
//#endregion IMPORTS

//#region GAMEPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/gamePage/style.css';
    </style>

    <gameadminpanel-れ></gameadminpanel-れ>
    <gamecontrolpanel-れ></gamecontrolpanel-れ>
`;
//#endregion GAMEPAGE

//#region CLASS
window.customElements.define('gamepage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$adminPanel = this._shadowRoot.querySelector("gameadminpanel-れ");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

        const user = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
        const isAdmin = user.role === 'ADMIN';
        const isTeacher = user.role === 'TEACHER'
        
        if (!isAdmin && !isTeacher) {
            this.$adminPanel?.remove();
        }

        // Start score calculations
        const groupId = user.groupId;
        const token = user.token;
        if (groupId && token) {
            this.scoreInterval = setInterval(() => {
            ScoreCalculations(groupId, token)
                .catch(err => console.error("Error in score calculations:", err));
            }, 5000);
        } else {
            console.warn("Group ID or token is missing, skipping score calculations.");
        }
    }

    disconnectedCallback() {
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
        }
    }
});
//#endregion CLASS