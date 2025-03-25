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
        this.addGroup = this._shadowRoot.querySelector('addgroup-れ');
        this.groupList = this._shadowRoot.querySelector('grouplist-れ');
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
        
        // Replace the 'group-added' event listener with 'create-group'
        this.addGroup.addEventListener('create-group', this.handleCreateGroup.bind(this));
        
        // Event listeners for group operations from groupList
        this.groupList.addEventListener('delete-group', this.handleDeleteGroup.bind(this));
        this.groupList.addEventListener('edit-group', this.handleEditGroup.bind(this));
    }

    async fetchGroups() {
        const response = await this.getGroups();
        if (response.ok) {
            const data = await response.json();
            this.groups = data;
            this.updateGroupList();
        } else {
            console.error('Error fetching groups:', response.statusText);
        }
    }

    updateGroupList() {
        // Sort groups alphabetically by name
        this.groups.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        const groupList = this._shadowRoot.querySelector('grouplist-れ');
        groupList.setAttribute('groups', JSON.stringify(this.groups));
    }

    async handleDeleteGroup(event) {
        const { groupId } = event.detail;
        const response = await this.deleteGroup(groupId);
        if (response.ok) {
            this.groups = this.groups.filter(group => group.id !== groupId);
            this.updateGroupList();
        } else {
            console.error('Error deleting group:', response);
        }
    }

    async handleEditGroup(event) {
        const { id, name, description } = event.detail;
        const response = await this.editGroup({ id, name, description });
        if (response.ok) {
            // Update the group in the list
            const updatedGroup = await response.json().then(data => data.group);
            const index = this.groups.findIndex(g => g.id === id);
            if (index !== -1) {
                this.groups[index] = updatedGroup;
                this.updateGroupList();
            }
        } else {
            console.error('Error editing group:', response);
        }
    }

    async handleCreateGroup(event) {
        const { name, description } = event.detail;
        const response = await this.createGroup(name, description);
        const newGroup = await response.json().then(data => data.group);
        this.groups.push(newGroup);
        this.updateGroupList();
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

    async deleteGroup(groupId) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/groups/' + groupId, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async editGroup({ id, name, description }) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/groups', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ id, name, description })
            });
        } catch (error) {
            console.error(error);
        }
    }

    async createGroup(name, description) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ name, description })
            });
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});
//#endregion CLASS
