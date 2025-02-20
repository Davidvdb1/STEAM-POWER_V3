//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/reusable/campPanel/style.css';
    </style>

    <div>
        <input type="text" placeholder="Zoek op kampnaam">
        <button id="filter" class="svg">
            <img src="./Assets/SVGs/filter.png" alt="search" style="width: 40px;">
        </button>
        <button id="sort" class="svg">
            <img src="./Assets/SVGs/sort.png" alt="search" style="width: 40px;">
        </button>
    </div>
    <div>
        <button id="reset" class="text">reset</button>
        <button id="search" class="text">zoeken</button>
        <button id="addCamp" class="add">+ nieuw kamp</button>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('camppanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$filter = this._shadowRoot.querySelector('#filter');
        this.$sort = this._shadowRoot.querySelector('#sort');
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.$filter.addEventListener('click', () => {
            const text = document.createElement('p');
            text.innerHTML = 'filter';
            this._shadowRoot.appendChild(text);
        });

    }

});
//#endregion CLASS