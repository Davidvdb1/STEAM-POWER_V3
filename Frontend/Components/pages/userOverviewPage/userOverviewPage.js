//#region IMPORTS
import '../../user/addUser/addUser.js';
import '../../user/userList/userList.js';
//#endregion IMPORTS

//#region USEROVERVIEWPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/userOverviewPage/style.css';
    </style>
    <adduser-れ></adduser-れ>
    <userlist-れ></userlist-れ>
`;
//#endregion USEROVERVIEWPAGE

//#region CLASS 
window.customElements.define('useroverviewpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.addUser = this._shadowRoot.querySelector('adduser-れ');
        this.userList = this._shadowRoot.querySelector('userlist-れ');
        this.users = [];
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    connectedCallback() {
        this.fetchUsers();
        
        this.addUser.addEventListener('create-user', this.handleCreateUser.bind(this));
        this.userList.addEventListener('delete-user', this.handleDeleteUser.bind(this));
        this.userList.addEventListener('edit-user', this.handleEditUser.bind(this));
    }

    async fetchUsers() {
        const response = await this.getUsers();
        if (response.ok) {
            const data = await response.json();
            this.users = data;
            this.updateUserList();
        } else {
            console.error('Error fetching users:', response.statusText);
        }
    }

    updateUserList() {
        // Sort users alphabetically by username
        this.users.sort((a, b) => {
            const usernameA = a.username.toLowerCase();
            const usernameB = b.username.toLowerCase();
            return usernameA.localeCompare(usernameB);
        });
        
        const userList = this._shadowRoot.querySelector('userlist-れ');
        userList.setAttribute('users', JSON.stringify(this.users));
    }

    async handleDeleteUser(event) {
        const { userId } = event.detail;
        const response = await this.deleteUser(userId);
        if (response.ok) {
            this.users = this.users.filter(user => user.id !== userId);
            this.updateUserList();
        } else {
            console.error('Error deleting user:', response);
        }
    }

    async handleEditUser(event) {
        const { id, username, email, role } = event.detail;
        const response = await this.editUser({ id, username, email, role });
        if (response.ok) {
            // Update the user in the list
            const updatedUser = await response.json().then(data => data.user);
            const index = this.users.findIndex(u => u.id === id);
            if (index !== -1) {
                this.users[index] = updatedUser;
                this.updateUserList();
            }
        } else {
            console.error('Error editing user:', response);
        }
    }

    async handleCreateUser(event) {
        const { username, email, password, role } = event.detail;
        const response = await this.createUser(username, email, password, role);
        const newUser = await response.json().then(data => data.user);
        this.users.push(newUser);
        this.updateUserList();
    }

    // service
    async getUsers() {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async deleteUser(userId) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/users/' + userId, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async editUser({ id, username, email, role }) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ id, username, email, role })
            });
        } catch (error) {
            console.error(error);
        }
    }

    async createUser(username, email, password, role) {
        try {
            const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
            return await fetch(window.env.BACKEND_URL + '/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ username, email, role, password })
            });
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }
});
//#endregion CLASS
