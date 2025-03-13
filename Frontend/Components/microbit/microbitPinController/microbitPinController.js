//#region IMPORTS
//#endregion IMPORTS

//#region MICROBITPINCONTROLLER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/subdirectory/template/style.css';
    </style>
    
`;
//#endregion MICROBITPINCONTROLLER

//#region CLASS
window.customElements.define('microbitpincontroller-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.pinConfiguration = JSON.parse(sessionStorage.getItem('pinConfiguration'));
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