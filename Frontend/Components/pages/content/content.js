//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/content/style.css';
    </style>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('content-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab" && newValue) {
            // delete the previous page if it exists
            if (oldValue) {
                const oldPage = this._shadowRoot.querySelector(oldValue + '-れ');
                if (oldPage) {
                    this._shadowRoot.removeChild(oldPage);
                }
            }

            // Check if the page exists
            const newPageName = newValue + '-れ';
            if (customElements.get(newPageName)) {
                const newPage = document.createElement(newPageName);
                this._shadowRoot.appendChild(newPage);
            } else {
                console.warn(`Component ${newPageName} is niet geregistreerd.`);
            }
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('active-tab')) {
            this.setAttribute('active-tab', this.landingPage);
        }
    }
});
//#endregion CLASS
