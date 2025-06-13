//#region IMPORTS
//#endregion IMPORTS

//#region NAVIGATIONITEM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/navigation/navigationItem/style.css';
    </style>

    <li class="navigationItem">
        <button id="" class=""></button>
    </li>
`;
//#endregion NAVIGATIONITEM

//#region CLASS
window.customElements.define('navigationitem-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$button = this._shadowRoot.querySelector("button");

    }

    // component attributes
    static get observedAttributes() {
        return ['label', 'id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'label') {
            this.$button.textContent = newValue;
        }
        if (name === 'id') {
            this.$button.id = newValue;
        }   
    }

    connectedCallback() {
        this.$button.addEventListener("click", () => {
            this.tabHandler(this.$button.id);
        });
    }

    tabHandler(id) {
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: id
        })); 
    }
});
//#endregion CLASS