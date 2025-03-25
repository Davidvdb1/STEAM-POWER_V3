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
        this.editing = [];
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
        
        this.groups.forEach(group => {
            const row = document.createElement('tr');
            row.dataset.groupId = group.id;
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'name';
            
            if (this.editing.includes(group.id)) {
                // Input field for name when in edit mode
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'edit-name-input';
                nameInput.value = group.name;
                nameCell.appendChild(nameInput);
            } else {
                nameCell.textContent = group.name;
            }
            row.appendChild(nameCell);
            
            // Description cell
            const descriptionCell = document.createElement('td');
            descriptionCell.className = 'description';
            
            if (this.editing.includes(group.id)) {
                // Input field for description when in edit mode
                const descInput = document.createElement('input');
                descInput.type = 'text';
                descInput.className = 'edit-description-input';
                descInput.value = group.description || '';
                descriptionCell.appendChild(descInput);
            } else {
                descriptionCell.textContent = group.description;
            }
            row.appendChild(descriptionCell);
            
            // Code cell - not editable
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
            editBtn.textContent = this.editing.includes(group.id) ? 'Opslaan' : 'Pas aan';
            editBtn.addEventListener('click', () => this.handleEditClick(group.id));
            editCell.appendChild(editBtn);
            row.appendChild(editCell);
            
            table.appendChild(row);
        });
    }

    handleDeleteClick(groupId) {
        this.dispatchEvent(new CustomEvent('delete-group', {
            bubbles: true,
            composed: true,
            detail: { groupId }
        }));
    }

    handleEditClick(groupId) {
        if (this.editing.includes(groupId)) {
            const row = this._shadowRoot.querySelector(`tr[data-group-id="${groupId}"]`);
            
            const newName = row.querySelector('.edit-name-input').value;
            const newDescription = row.querySelector('.edit-description-input').value;
            
            this.editing = this.editing.filter(id => id !== groupId);
            
            this.dispatchEvent(new CustomEvent('edit-group', {
                bubbles: true,
                composed: true,
                detail: {
                    id: groupId,
                    name: newName,
                    description: newDescription
                }
            }));
        } else {
            this.editing.push(groupId);
        }
        this.renderGroups();
    }
});
//#endregion CLASS
