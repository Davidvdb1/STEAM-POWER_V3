//#region IMPORTS
import "../../simulation/simulation.js"  // Corrected relative path
//#endregion IMPORTS

//#region SIMULATIONPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/pages/simulationPage/style.css';
    </style>
`;
//#endregion SIMULATIONPAGE

//#region CLASS 
window.customElements.define('simulationpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
    }

    connectedCallback() {
        console.log("connectedCallback simulationPage");
        document.addEventListener("showSimulation", this.showSimulation.bind(this));
        const fetchSimulationEvent = new CustomEvent("fetchSimulation");
        console.log("sending fetchSimulationEvent");
        document.dispatchEvent(fetchSimulationEvent);
    }

    disconnectedCallback() {
        console.log("disconnectedCallback simulationPage");
        const hideSimulationEvent = new CustomEvent("hideSimulation", { detail: { node: this.$simulation } });
        console.log("sending hideSimulationEvent");
        document.dispatchEvent(hideSimulationEvent);
    }

    showSimulation(event) {
        console.log("showSimulation simulationPage");
        event.detail.node.removeAttribute("hidden");
        event.detail.node.setAttribute("style", "display: block;");
        this._shadowRoot.moveBefore(event.detail.node, null);
    }
});
//#endregion CLASS
