//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPPREVIEW
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 50px;
            max-width: 685px;
            width: 100%;
            height: auto; 
            max-height: fit-content; 
            overflow-y: auto;
        }
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
                        :host {
                            display: block;
                            background-color: white;
                            border-radius: 10px;
                            box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
                            padding: 20px;
                            margin-bottom: 50px;
                            max-width: 685px;
                            width: 100%;
                            height: auto; 
                            max-height: fit-content; 
                            overflow-y: auto;
                        }
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