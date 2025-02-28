//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPPREVIEW
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/workshop/workshopPreview/style.css';
    </style>
`;
//#endregion WORKSHOPPREVIEW

//#region CLASS
window.customElements.define('workshoppreview-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return ['html'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'html') {
            const previewContainer = this._shadowRoot.querySelector('#preview-content');
    
            if (previewContainer) {
                previewContainer.innerHTML = newValue; // Alleen de inhoud bijwerken
            } else {
                this._shadowRoot.innerHTML = /*html*/`
                    <style>
                        @import './components/workshop/workshopPreview/style.css';
                    </style>
                    <div id="preview-content">${newValue}</div>
                `;
            }
        }
    }
    
    connectedCallback() {

    }


});
//#endregion CLASS