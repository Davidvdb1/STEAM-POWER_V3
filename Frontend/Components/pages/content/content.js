//#region IMPORTS
import "../../../Components/pages/pageOne/pageOne.js"
import "../../../Components/pages/pageTwo/pageTwo.js"
import "../../../Components/pages/pageThree/pageThree.js"
import "../../../Components/pages/campForm/campForm.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/content/style.css';
    </style>
    
    <pageone-れ></pageone-れ>
    <pagetwo-れ></pagetwo-れ>
    <pagethree-れ></pagethree-れ> 
    <campform-れ></campForm-れ>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('content-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Reference all pages in an array
        this.pages = [
            this._shadowRoot.querySelector('pageone-れ'),
            this._shadowRoot.querySelector('pagetwo-れ'),
            this._shadowRoot.querySelector('pagethree-れ'),
            this._shadowRoot.querySelector('pageone-れ'),
            this._shadowRoot.querySelector('pagetwo-れ'),
            this._shadowRoot.querySelector('pagethree-れ'),
            this._shadowRoot.querySelector('pageone-れ'),
            this._shadowRoot.querySelector('pagetwo-れ'),
            this._shadowRoot.querySelector('campform-れ'),
        ];
    }

    // component attributes
    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab") {            
            // Hide all pages
            this.pages.forEach(page => page.style.display = 'none');

            // Show the page corresponding to the active-tab
            const pageIndex = this.getPageIndex(newValue);
            if (pageIndex !== -1) {
                this.pages[pageIndex].style.display = 'block';
            }
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('active-tab')) {
            this.setAttribute('active-tab', 'campform');
        }
    }

    // Get the index of the page corresponding to the active-tab 
    getPageIndex(tab) {
        const pageNames = [
            'home', 'overzicht', 'spel', 'microbit', 'groepen', 'users', 'sign-up', 'logout', 'campform'
        ];
        return pageNames.indexOf(tab);
    }
});
//#endregion CLASS
