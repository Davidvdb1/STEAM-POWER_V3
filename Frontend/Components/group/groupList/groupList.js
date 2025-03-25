//#region IMPORTS
// Removed import for groupListRow.js as we're no longer using it
//#endregion IMPORTS

//#region GROUPLIST
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/group/groupList/style.css';
    </style>
    <table id="group-list">
        <tr>
            <th>Naam</th>
            <th>Beschrijving</th>
            <th>Code</th>
            <th>Verwijder</th>
            <th>Pas aan</th>
        </tr>
    </table>
`;
//#endregion GROUPLIST

//#region CLASS 
window.customElements.define('grouplist-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.groups = [];
    }

    // component attributes
    static get observedAttributes() {
        return ['groups'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'groups' && newValue) {
            try {
                this.groups = JSON.parse(newValue);
                this.renderGroups();
            } catch (e) {
                console.error('Error parsing groups:', e);
            }
        }
    }

    connectedCallback() {
    }

    renderGroups() {
        const table = this._shadowRoot.querySelector('#group-list');
        
        // Preserve the header row
        const headerRow = table.querySelector('tr');
        table.innerHTML = '';
        table.appendChild(headerRow);
        
        // Create a row for each group directly
        this.groups.forEach(group => {
            const row = document.createElement('tr');
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'name';
            nameCell.textContent = group.name;
            row.appendChild(nameCell);
            
            // Description cell
            const descriptionCell = document.createElement('td');
            descriptionCell.className = 'description';
            descriptionCell.textContent = group.description;
            row.appendChild(descriptionCell);
            
            // Code cell
            const codeCell = document.createElement('td');
            codeCell.className = 'code';
            codeCell.textContent = group.code;
            row.appendChild(codeCell);
            
            // Delete button cell
            const deleteCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Verwijder';
            deleteBtn.addEventListener('click', () => this.handleDeleteClick(group.id));
            deleteCell.appendChild(deleteBtn);
            row.appendChild(deleteCell);
            
            // Edit button cell
            const editCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Pas aan';
            editBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('edit-group', {
                    bubbles: true,
                    composed: true,
                    detail: { id: group.id }
                }));
            });
            editCell.appendChild(editBtn);
            row.appendChild(editCell);
            
            table.appendChild(row);
        });
    }

    async handleDeleteClick(groupId) {
        const response = await this.deleteGroup(groupId);
        if (response.ok) {
            this.groups = this.groups.filter(group => group.id !== groupId);
            this.renderGroups();
        } else {
            console.error('Error deleting group:', response);
        }
    }

    handleEditClick(groupId) {
        console.log('Edit group:', groupId);
    }

    // service
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

    async editGroup({ groupId, name, description }) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/groups', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({groupId, name, description})
            });
        } catch (error) {
            console.error(error);
        }
    }
});
//#endregion CLASS
