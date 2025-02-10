//#region IMPORTS
import "../../Components/moduleComponent/moduleComponent.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/modulebalkComponent/style.css';
    </style>

<div>
<modulecomponent-ɠ></modulecomponent-ɠ>
<modulecomponent-ɠ></modulecomponent-ɠ>
</div>

`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('modulebalk-ɠ', class extends HTMLElement {
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