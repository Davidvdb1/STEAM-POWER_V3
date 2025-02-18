//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigation/navigationItem/style.css';
    </style>

    <li class="navigationItem">
        <button id="" class=""></button>
    </li>
`;
//#endregion TEMPLATE

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
        return ['label', 'id', 'class'];
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

    tabHandler(text) {
        this.dispatchEvent(new CustomEvent('tab', {
            bubbles: true,
            composed: true,
            detail: text
        }));
    }

});
//#endregion CLASS