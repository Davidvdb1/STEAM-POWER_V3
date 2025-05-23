//#region IMPORTS
import "../../Components/navigation/tabHandler/tabHandler.js"
import "../../Components/microbit/microbitBluetoothConnection/microbitBluetoothConnection.js"
import "../../Components/microbit/microbitBasicBluetoothConnection/microbitBasicBluetoothConnection.js"
import "../../Components/simulation/simulation.js"
//#endregion IMPORTS

//#region HOME
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <microbitbasicbluetoothconnection-れ></microbitbasicbluetoothconnection-れ>
    <tabhandler-れ></tabhandler-れ>
    <simulation-れ id="simulation"></simulation-れ>
`;
//#endregion HOME

//#region CLASS
window.customElements.define('home-ɮ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".example");
        this.$simulation = this._shadowRoot.querySelector("simulation-れ");
        this.$simulation.setAttribute("hidden", true);
        this.$simulation.setAttribute("style", "display: none;");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        console.log("connectedCallback home");
        document.addEventListener("hideSimulation", this.hideSimulation.bind(this));
        document.addEventListener("fetchSimulation", this.fetchSimulation.bind(this));
    }

    hideSimulation(event) {
        console.log("hideSimulation home");
        this._shadowRoot.moveBefore(event.detail.node, null);
        this.$simulation = this._shadowRoot.querySelector("simulation-れ");
        this.$simulation.setAttribute("hidden", true);
        this.$simulation.setAttribute("style", "display: none;");
    }

    fetchSimulation() {
        console.log("fetchSimulation home");
        const showSimulationEvent = new CustomEvent("showSimulation", { detail: { node: this.$simulation } });
        console.log("sending showSimulationEvent");
        document.dispatchEvent(showSimulationEvent);
    }
});
//#endregion CLASS