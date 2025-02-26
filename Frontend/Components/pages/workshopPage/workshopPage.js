//#region IMPORTS
import '../../workshop/workshopForm/workshopForm.js';
import '../../workshop/workshopPreview/workshopPreview.js';
//#endregion IMPORTS

//#region WORKSHOPPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/workshopPage/style.css';
    </style>

    <h1>Workshop Editor</h1>
    <workshopforum-れ></workshopforum-れ>
    <h1>Preview</h1>
    <workshoppreview-れ></workshoppreview-れ>
`;
//#endregion WORKSHOPPAGE

//#region CLASS
window.customElements.define('workshoppage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$preview = this._shadowRoot.querySelector("workshoppreview-れ");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        this.addEventListener("preview", this.previewHandler);   
    }

    previewHandler(e) {
        this.$preview.setAttribute("html", e.detail);
    }

});
//#endregion CLASS