//#region IMPORTS
import '../../group/addGroup/addGroup.js';
import '../../group/groupList/groupList.js';
//#endregion IMPORTS

//#region GROUPOVERVIEWPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/groupOverviewPage/style.css';
    </style>
    <addgroup-れ></addgroup-れ>
    <grouplist-れ></grouplist-れ>
`;
//#endregion GROUPOVERVIEWPAGE

//#region CLASS 
window.customElements.define('groupoverviewpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.groups = [];
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    connectedCallback() {
        this.fetchGroups();
        
        this._shadowRoot.querySelector('addgroup-れ').addEventListener('group-added', (e) => {
            this.groups.push(e.detail);
            this.updateGroupList();
        });
        this._shadowRoot.querySelector('addgroup-れ').addEventListener('groups-updated', (e) => {
            this.groups = e.detail;
            this.updateGroupList();
        });
    }

    async fetchGroups() {
        // TODO: Implement actual fetch from backend
        // For now, using dummy data for demonstration
        const response = await this.getGroups();
        if (response.ok) {
            const data = await response.json()
            this.groups = data;
            this.updateGroupList();
        } else {
            console.error('Error fetching groups:', response.statusText);
        }
    }

    updateGroupList() {
        const groupList = this._shadowRoot.querySelector('grouplist-れ');
        groupList.setAttribute('groups', JSON.stringify(this.groups));
    }

    // service
    async getGroups() {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/groups', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

});
//#endregion CLASS
