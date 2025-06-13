//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/microbit/microbitPinController/style.css';
    </style>
`;
//#endregion MICROBITPINCONTROLLER

//#region CLASS
window.customElements.define('microbitpincontroller-れ', class extends HTMLElement {
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