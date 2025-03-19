//#region IMPORTS
import "../../Components/navigation/tabHandler/tabHandler.js"
import "../../Components/microbit/microbitBluetoothConnection/microbitBluetoothConnection.js"
//#endregion IMPORTS

//#region HOME
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <microbitbluetoothconnection-れ></microbitbluetoothconnection-れ>
    <tabhandler-れ></tabhandler-れ>
`;
//#endregion HOME

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