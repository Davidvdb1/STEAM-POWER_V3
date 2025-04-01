//#region IMPORTS
import '../../workshop/workshopForm/workshopForm.js';
import '../../workshop/workshopPreview/workshopPreview.js';
//#endregion IMPORTS

//#region WORKSHOPPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/workshopPage/style.css';
    </style>

    <workshopforum-れ></workshopforum-れ>
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
        this.$form = this._shadowRoot.querySelector("workshopforum-れ");
    }

    // component attributes
    static get observedAttributes() {
        return ["workshop", "camp"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "workshop") {
            this.$form.setAttribute("workshop", newValue);
        }

        if (name === "camp") {
            this.$form.setAttribute("camp", newValue);
        }
    }

    connectedCallback() {
        this.addEventListener("preview", this.previewHandler);
    
        setTimeout(() => {
            const edit = this.$preview?.shadowRoot?.querySelector("#edit");
            const visible = this.$preview?.shadowRoot?.querySelector("#visible");
            const arrowUp = this.$preview?.shadowRoot?.querySelector("#arrowup");
            const arrowDown = this.$preview?.shadowRoot?.querySelector("#arrowdown");
            if (edit) {
                edit.remove();
            }
            if (visible) {
                visible.remove();
            }
            if (arrowUp) {
                arrowUp.remove();
            }
            if (arrowDown) {
                arrowDown.remove();
            }
        }, 0);
    }
    
    

    previewHandler(e) {
        this.$preview.setAttribute("html", e.detail);
    }

});
//#endregion CLASS