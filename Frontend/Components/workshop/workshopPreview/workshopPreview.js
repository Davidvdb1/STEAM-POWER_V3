//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPPREVIEW
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/workshop/workshopPreview/style.css';
    </style>

    <img id="edit" src="./Assets/SVGs/edit.png" alt="settings" style="width: 26px; height: 25px;">
    <div id="preview-content"></div>
`;
//#endregion WORKSHOPPREVIEW

//#region CLASS
window.customElements.define('workshoppreview-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$previewContent = this._shadowRoot.querySelector("#preview-content");
        this.$edit = this._shadowRoot.querySelector("#edit");
    }

    // component attributes
    static get observedAttributes() {
        return ['html', "workshop"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'html') {
            this.$previewContent.innerHTML = newValue;
        }
    }
    
    connectedCallback() {   
        this.$edit.addEventListener('click', () => {
            this.tabWithWorkshopHandler("workshoppage", "workshop", this.getAttribute("workshop")); 
        })

    }

    tabWithWorkshopHandler(tabId, componentName, componentId) {
        this.dispatchEvent(new CustomEvent('tabID', {
            bubbles: true,
            composed: true,
            detail: {tabId, componentName, componentId}
        })); 
    }


});
//#endregion CLASS