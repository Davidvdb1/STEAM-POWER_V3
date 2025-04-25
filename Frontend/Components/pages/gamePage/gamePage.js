//#region IMPORTS
import "../../game/gameControlPanel/gameControlPanel.js"
//#endregion IMPORTS

//#region GAMEPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/gamePage/style.css';
    </style>

    <gamecontrolpanel-れ></gamecontrolpanel-れ>
`;
//#endregion GAMEPAGE

//#region CLASS
window.customElements.define('gamepage-れ', class extends HTMLElement {
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