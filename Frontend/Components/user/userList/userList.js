//#region IMPORTS
// Removed import for userListRow.js as we're no longer using it
//#endregion IMPORTS

//#region USERLIST
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/user/userList/style.css';
    </style>
    <table id="user-list">
        <tr>
            <th>Gebruikersnaam</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Verwijder</th>
            <th>Pas aan</th>
        </tr>
    </table>
`;
//#endregion USERLIST

//#region CLASS 
window.customElements.define('userlist-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.users = [];
        this.editing = [];
    }

    // component attributes
    static get observedAttributes() {
        return ['users'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'users' && newValue) {
            try {
                this.users = JSON.parse(newValue);
                this.renderUsers();
            } catch (e) {
                console.error('Error parsing users:', e);
            }
        }
    }

    connectedCallback() {
    }

    renderUsers() {
        const table = this._shadowRoot.querySelector('#user-list');
        
        // Preserve the header row
        const headerRow = table.querySelector('tr');
        table.innerHTML = '';
        table.appendChild(headerRow);
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.userId = user.id;
            
            // Username cell
            const usernameCell = document.createElement('td');
            usernameCell.className = 'username';
            
            if (this.editing.includes(user.id)) {
                // Input field for username when in edit mode
                const usernameInput = document.createElement('input');
                usernameInput.type = 'text';
                usernameInput.className = 'edit-username-input';
                usernameInput.value = user.username || user.name;
                usernameCell.appendChild(usernameInput);
            } else {
                usernameCell.textContent = user.username || user.name;
            }
            row.appendChild(usernameCell);
            
            // Email cell
            const emailCell = document.createElement('td');
            emailCell.className = 'email';
            
            if (this.editing.includes(user.id)) {
                // Input field for email when in edit mode
                const emailInput = document.createElement('input');
                emailInput.type = 'email';
                emailInput.className = 'edit-email-input';
                emailInput.value = user.email || '';
                emailCell.appendChild(emailInput);
            } else {
                emailCell.textContent = user.email || '';
            }
            row.appendChild(emailCell);
            
            // Role cell
            const roleCell = document.createElement('td');
            roleCell.className = 'role';
            
            if (this.editing.includes(user.id)) {
                // Select dropdown for role when in edit mode
                const roleSelect = document.createElement('select');
                roleSelect.className = 'edit-role-select';
                
                const roles = ['ADMIN', 'TEACHER'];
                roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role;
                    option.selected = user.role === role;
                    roleSelect.appendChild(option);
                });
                
                roleCell.appendChild(roleSelect);
            } else {
                const roleName = user.role || '';
                roleCell.textContent = roleName;
            }
            row.appendChild(roleCell);
            
            // Delete button cell
            const deleteCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Verwijder';
            deleteBtn.addEventListener('click', () => this.handleDeleteClick(user.id));
            deleteCell.appendChild(deleteBtn);
            row.appendChild(deleteCell);
            
            // Edit button cell
            const editCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = this.editing.includes(user.id) ? 'Opslaan' : 'Pas aan';
            editBtn.addEventListener('click', () => this.handleEditClick(user.id));
            editCell.appendChild(editBtn);
            row.appendChild(editCell);
            
            table.appendChild(row);
        });
    }

    handleDeleteClick(userId) {
        this.dispatchEvent(new CustomEvent('delete-user', {
            bubbles: true,
            composed: true,
            detail: { userId }
        }));
    }

    handleEditClick(userId) {
        if (this.editing.includes(userId)) {
            const row = this._shadowRoot.querySelector(`tr[data-user-id="${userId}"]`);
            
            const newUsername = row.querySelector('.edit-username-input').value;
            const newEmail = row.querySelector('.edit-email-input').value;
            const newRole = row.querySelector('.edit-role-select').value;
            
            this.editing = this.editing.filter(id => id !== userId);
            
            this.dispatchEvent(new CustomEvent('edit-user', {
                bubbles: true,
                composed: true,
                detail: {
                    id: userId,
                    username: newUsername,
                    email: newEmail,
                    role: newRole
                }
            }));
        } else {
            this.editing.push(userId);
        }
        this.renderUsers();
    }
});
//#endregion CLASS
