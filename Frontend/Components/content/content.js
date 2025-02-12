//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/template/style.css';
    </style>

    <div class="content">
        <h1>Content</h1>
        <p></p>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('content-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$paragraph = this._shadowRoot.querySelector("p");
    }

    // component attributes
    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab") {
            console.log(`Active tab is ${newValue} in content`);
            this.$paragraph.textContent = `Active tab: ${newValue}`;
        }

    }

    connectedCallback() {
        if (!this.hasAttribute('active-tab')) {
            this.setAttribute('active-tab', 'home');
        }
    }

});
//#endregion CLASS