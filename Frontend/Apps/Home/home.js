//#region IMPORTS
import "../../Components/navigation/tabHandler/tabHandler.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`

<tabhandler-れ></tabhandler-れ> 
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('home-ɮ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".example");
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