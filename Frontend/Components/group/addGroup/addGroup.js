//#region IMPORTS
//#endregion IMPORTS

//#region ADDGROUP
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/group/addGroup/style.css';
    </style>
    <form>
        <label for="groupname">Groupname:</label><br>
        <input type="text" id="groupname" name="groupname" required><br>
        <label for="description">Description:</label><br>
        <input type="text" id="description" name="description" required><br>
        <input type="submit" value="Create Group">
    </form>
`;
//#endregion ADDGROUP

//#region CLASS 
window.customElements.define('addgroup-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    connectedCallback() {
        this._shadowRoot.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = this._shadowRoot.querySelector('#groupname').value;
            const description = this._shadowRoot.querySelector('#description').value;
            
            this.createGroup(name, description)
                .then(newGroup => {
                    // Emit event with new group data
                    this.dispatchEvent(new CustomEvent('group-added', {
                        bubbles: true,
                        composed: true,
                        detail: newGroup
                    }));
                    
                    // Reset form
                    e.target.reset();
                })
                .catch(error => {
                    console.error('Error creating group:', error);
                });
        });
    }
    
    async createGroup(name, description) {
        // TODO: Implement actual backend API call
        // Mock implementation for now
        return {
            id: Date.now(), // Using timestamp as temporary ID
            name: name,
            description: description,
            code: Math.random().toString(36).substring(2, 8).toUpperCase() // Generate random code
        };
    }
});
//#endregion CLASS
