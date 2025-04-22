//#region IMPORTS
//#endregion IMPORTS

//#region PINASSIGNMENTCARDS
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/microbit/pinAssignmentCards/style.css';
    </style>

    <div id="solar" class="card">
        <h2>Solar</h2>
        <p>Pin 0</p>
    </div>
    <div id="wind" class="card">
        <h2>Wind</h2>
        <p>Pin 1</p>
    </div>
    <div id="water" class="card">
        <h2>Water</h2>
        <p>Pin 2</p>
    </div>
`;
//#endregion PINASSIGNMENTCARDS

//#region CLASS
window.customElements.define('pinassignmentcards-れ', class extends HTMLElement {
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

    }

});
//#endregion CLASS