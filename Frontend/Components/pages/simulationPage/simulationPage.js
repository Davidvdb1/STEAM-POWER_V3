//#region IMPORTS
import "../../../Components/simulation/simulation.js" 
//#endregion IMPORTS

//#region SIMULATIONPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/simulationPage/style.css';
    </style>
    <simulation-れ></simulation-れ>
`;
//#endregion SIMULATIONPAGE

//#region CLASS 
window.customElements.define('simulationpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$simulation = this._shadowRoot.querySelector("simulation-れ");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
    }

    connectedCallback() {
        //move the simulation from the top of the stack to here
    }

    disconnectedCallback() {
        // move the simulation from here to the top of the stack
    }
});
//#endregion CLASS
