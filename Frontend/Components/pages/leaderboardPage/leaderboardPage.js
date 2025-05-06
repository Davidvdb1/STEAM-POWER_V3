//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/leaderboardPage/style.css';
    </style>

    <div id="container">
        <h1>Leaderboard</h1>
        <div id="leaderboard-container">
            <table>
                <thead>
                    <tr>
                        <th>Group Name</th>
                        <th>Members</th>
                        <th>Bonus Score</th>
                        <th>Energy</th>
                        <th>Battery Level</th>
                    </tr>
                </thead>
                <tbody id="leaderboard-body">
                </tbody>
            </table>
        </div>

    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('leaderboard-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$tbody = this._shadowRoot.querySelector('#leaderboard-body');

        this.groupData = [];
        this.currentSort = { column: null, direction: 'asc' };

        // Map between display names and data keys, and track sortable columns
        this.columnConfig = {
            'Group Name': { key: 'name', sortable: false },
            'Members': { key: 'members', sortable: false },
            'Bonus Score': { key: 'bonusScore', sortable: true },
            'Energy': { key: 'energy', sortable: true },
            'Battery Level': { key: 'batteryLevel', sortable: true }
        };
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    async connectedCallback() {
        this.groupData = await this.getGroupData();
        this.setupSorting();
        this.renderLeaderboard();
    }

    setupSorting() {
        const headers = this._shadowRoot.querySelectorAll('th');
        headers.forEach(header => {
            const columnName = header.textContent;
            const config = this.columnConfig[columnName];

            if (config && config.sortable) {
                header.classList.add('sortable');
                header.addEventListener('click', () => this.handleSort(header));
            }
        });
    }

    handleSort(header) {
        const displayName = header.textContent;
        const config = this.columnConfig[displayName];
        if (!config || !config.sortable) return;

        const dataKey = config.key;
        const isAsc = this.currentSort.column === dataKey && this.currentSort.direction === 'asc';

        // Remove existing sort classes
        const headers = this._shadowRoot.querySelectorAll('th');
        headers.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
        });

        // Add new sort class
        header.classList.add(isAsc ? 'sort-desc' : 'sort-asc');

        // Update sort state
        this.currentSort = {
            column: dataKey,
            direction: isAsc ? 'desc' : 'asc'
        };

        console.log('Sorting by:', dataKey, 'Direction:', this.currentSort.direction);

        this.renderLeaderboard();
    }

    renderLeaderboard() {
        this.$tbody.innerHTML = '';

        // Sort the data
        const sortedData = [...this.groupData].sort((a, b) => {
            const column = this.currentSort.column;
            if (!column) return 0;

            let aVal = a[column];
            let bVal = b[column];

            // Handle numeric values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.currentSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle string values
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            if (this.currentSort.direction === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });

        sortedData.forEach(group => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${group.name}</td>
                <td>${group.members || ''}</td>
                <td>${group.bonusScore}</td>
                <td>${group.energy.toFixed(2)} Wh</td>
                <td>${group.batteryLevel.toFixed(2)} Wh</td>
            `;
            this.$tbody.appendChild(row);
        });
    }

    async getGroupData() {
        try {
            const response = await fetch(`${window.env.BACKEND_URL}/groups`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const groups = await response.json();
            return groups.map(group => ({
                id: group.id,
                name: group.name,
                members: group.members,
                bonusScore: group.bonusScore,
                energy: group.energy,
                batteryLevel: group.batteryLevel
            }));

        } catch (error) {
            console.error('Error fetching group data:', error);
            return [];
        }

    }

});
//#endregion CLASS