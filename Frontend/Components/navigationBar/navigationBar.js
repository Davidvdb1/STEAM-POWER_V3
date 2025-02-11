//#region IMPORTS
//#endregion IMPORTS

//#region navigationBar
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/navigationBar/style.css';
    </style>

<div class="navigationBar">
    <p>kaas</p>
</div>
`;
//#endregion navigationBar

//#region CLASS
window.customElements.define('navigationbar-ɠ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".header"); 
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue)  {

    }

    connectedCallback() {

    }

});
//#endregion CLASS