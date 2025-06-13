//#region IMPORTS
// Removed import for groupListRow.js as we're no longer using it
//#endregion IMPORTS

//#region GROUPLIST
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/group/groupList/style.css';
    </style>
    <table id="group-list">
        <tr>
            <th>Naam</th>
            <th>Leden</th>
            <th>Micro:bit id</th>
            <th>Code</th>
            <th>Verwijder</th>
            <th>Pas aan</th>
        </tr>
    </table>
    
    <!-- Confirmation Popup -->
    <div id="delete-confirmation" class="popup-overlay">
        <div class="popup-content">
            <h3>Bevestig verwijderen</h3>
            <p>Weet u zeker dat u deze groep wilt verwijderen?</p>
            <div class="popup-buttons">
                <button id="confirm-delete-btn">Ja, verwijderen</button>
                <button id="cancel-delete-btn">Annuleren</button>
            </div>
        </div>
    </div>
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
        this.groupToDelete = null;

        // Set up event listeners for confirmation popup
        this._shadowRoot.getElementById('confirm-delete-btn').addEventListener('click', () => this.confirmDelete());
        this._shadowRoot.getElementById('cancel-delete-btn').addEventListener('click', () => this.hideDeleteConfirmation());
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

            // Members cell
            const membersCell = document.createElement('td');
            membersCell.className = 'members';

            if (this.editing.includes(group.id)) {
                // Input field for members when in edit mode
                const descInput = document.createElement('input');
                descInput.type = 'text';
                descInput.className = 'edit-members-input';
                descInput.value = group.members || '';
                membersCell.appendChild(descInput);
            } else {
                membersCell.textContent = group.members;
            }
            row.appendChild(membersCell);

            // MicrobitId cell
            const microbitIdCell = document.createElement('td');
            microbitIdCell.className = 'microbitId';

            if (this.editing.includes(group.id)) {
                // Input field for microbitId when in edit mode
                const descInput = document.createElement('input');
                descInput.type = 'text';
                descInput.className = 'edit-microbitId-input';
                descInput.value = group.microbitId || '';
                microbitIdCell.appendChild(descInput);
            } else {
                microbitIdCell.textContent = group.microbitId;
            }
            row.appendChild(microbitIdCell);

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
        this.groupToDelete = groupId;
        this.showDeleteConfirmation();
    }

    showDeleteConfirmation() {
        const popup = this._shadowRoot.getElementById('delete-confirmation');
        popup.style.display = 'flex';
    }

    hideDeleteConfirmation() {
        const popup = this._shadowRoot.getElementById('delete-confirmation');
        popup.style.display = 'none';
        this.groupToDelete = null;
    }

    confirmDelete() {
        if (this.groupToDelete) {
            this.dispatchEvent(new CustomEvent('delete-group', {
                bubbles: true,
                composed: true,
                detail: { groupId: this.groupToDelete }
            }));
            this.hideDeleteConfirmation();
        }
    }

    handleEditClick(groupId) {
        if (this.editing.includes(groupId)) {
            const row = this._shadowRoot.querySelector(`tr[data-group-id="${groupId}"]`);

            const newName = row.querySelector('.edit-name-input').value;
            const newMembers = row.querySelector('.edit-members-input').value;
            const newMicrobitId = row.querySelector('.edit-microbitId-input').value;

            this.editing = this.editing.filter(id => id !== groupId);

            this.dispatchEvent(new CustomEvent('edit-group', {
                bubbles: true,
                composed: true,
                detail: {
                    id: groupId,
                    name: newName,
                    members: newMembers,
                    microbitId: newMicrobitId
                }
            }));
        } else {
            this.editing.push(groupId);
        }
        this.renderGroups();
    }
});
//#endregion CLASS
