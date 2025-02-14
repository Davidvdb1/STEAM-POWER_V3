//#region IMPORTS
import "../../Components/example/example.js"
//#endregion IMPORTS

//#region CAMPFORMCONTAINER
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/campFormContainer/campFormContainer/style.css';
    </style>

    <div class="example">
    </div>
`;
//#endregion CAMPFORMCONTAINER 

//#region CLASS
window.customElements.define('campformcontainer-れ', class extends HTMLElement {
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