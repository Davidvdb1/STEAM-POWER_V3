//#region IMPORTS
import "./Apps/Home/home.js"
//#endregion IMPORTS

//#region APP
let template = document.createElement('template');
template.innerHTML = /*html*/`
<home-ɮ></home-ɮ>
    `;
//#endregion APP
//#region CLASS
window.customElements.define('main-ɮ', class extends HTMLElement {
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
    }
});
//#endregion CLASS