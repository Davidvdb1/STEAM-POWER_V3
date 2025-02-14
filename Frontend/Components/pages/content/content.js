//#region IMPORTS
import "../../../Components/pages/pageOne/pageOne.js"
import "../../../Components/pages/pageTwo/pageTwo.js"
import "../../../Components/pages/pageThree/pageThree.js"
// import "../../Components/pageFour/pageFour.js"
// import "../../Components/pageFive/pageFive.js"
// import "../../Components/pageSix/pageSix.js"
// import "../../Components/pageSeven/pageSeven.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/content/style.css';
    </style>

    <h1>Content</h1>
    <p></p>
    <pageone-れ></pageone-れ>
    <pagetwo-れ></pagetwo-れ>
    <pagethree-れ></pagethree-れ> 
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('content-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$paragraph = this._shadowRoot.querySelector("p");
        
        // Reference all pages in an array
        this.pages = [
            this._shadowRoot.querySelector('pageone-れ'),
            this._shadowRoot.querySelector('pagetwo-れ'),
            this._shadowRoot.querySelector('pagethree-れ'),
            // this._shadowRoot.querySelector('pagefour-れ'),
            // this._shadowRoot.querySelector('pagefive-れ'),
            // this._shadowRoot.querySelector('pagesix-れ'),
            // this._shadowRoot.querySelector('pageseven-れ')
        ];
    }

    // component attributes
    static get observedAttributes() {
        return ["active-tab"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active-tab") {
            console.log(`Active tab is ${newValue} in content`);
            this.$paragraph.textContent = `Active tab: ${newValue}`;
            
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
            this.setAttribute('active-tab', 'home');
        }
    }

    // Get the index of the page corresponding to the active-tab 
    getPageIndex(tab) {
        const pageNames = [
            'home', 'overzicht', 'spel', 'microbit', 'groepen', 'sign-up', 'logout'
        ];
        return pageNames.indexOf(tab);
    }
});
//#endregion CLASS
