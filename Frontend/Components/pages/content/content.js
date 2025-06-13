//#region IMPORTS
//#endregion IMPORTS

//#region CONTENT
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/content/style.css';
    </style>
`;
//#endregion CONTENT

//#region CLASS
window.customElements.define('content-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.landingPage = "campoverviewpage"
    }

    static get observedAttributes() {
        return ["active-tab", "camp", "workshop"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab" && newValue) {
            if (oldValue) {
                const oldPage = this._shadowRoot.querySelector(oldValue + '-れ');
                if (oldPage) {
                    this._shadowRoot.removeChild(oldPage);
                }
            }

            const newPageName = newValue + '-れ';
            if (customElements.get(newPageName)) {
                const newPage = document.createElement(newPageName);
                this._shadowRoot.appendChild(newPage);
            } else {
                console.warn(`Component ${newPageName} is niet geregistreerd.`);
            }
        }

        if (name === "camp") {
            const childComponent = this._shadowRoot.querySelector(this.getAttribute("active-tab") + '-れ');
            childComponent.setAttribute("camp", newValue);
        }

        if (name === "workshop") {
            const childComponent = this._shadowRoot.querySelector(this.getAttribute("active-tab") + '-れ');
            childComponent.setAttribute("workshop", newValue);
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('active-tab')) {
            this.setAttribute('active-tab', this.landingPage);
        }
    }
});
//#endregion CLASS
