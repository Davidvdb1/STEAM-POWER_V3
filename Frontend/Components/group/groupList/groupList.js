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
            editBtn.addEventListener('click', () => this.handleEditClick(group.id));
            editCell.appendChild(editBtn);
            row.appendChild(editCell);
            
            table.appendChild(row);
        });
    }

    handleDeleteClick(groupId) {
        // Dispatch delete-group event instead of making API call directly
        this.dispatchEvent(new CustomEvent('delete-group', {
            bubbles: true,
            composed: true,
            detail: { groupId }
        }));
    }

    handleEditClick(groupId) {
        // For now, just dispatch edit-group event
        // In a real implementation, you might want to show a form and then dispatch the event with updated data
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            this.dispatchEvent(new CustomEvent('edit-group', {
                bubbles: true,
                composed: true,
                detail: { 
                    groupId: group.id,
                    name: group.name,
                    description: group.description
                }
            }));
        }
    }
});
//#endregion CLASS
