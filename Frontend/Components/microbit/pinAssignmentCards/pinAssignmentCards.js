//#region IMPORTS
//#endregion IMPORTS

//#region PINASSIGNMENTCARDS
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/microbit/pinAssignmentCards/style.css';
    </style>
    <div class="element-container">
        <div id="solar" class="card">
            <h2>Zon</h2>
            <p>Pin 0</p>
        </div>
        <svg class="symbol" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" fill="#FFD700"/>
            <circle cx="12" cy="12" r="4" fill="#FFA500"/>
            <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
        </svg>
    </div>
    <div class="element-container">
        <div id="wind" class="card">
            <h2>Wind</h2>
            <p>Pin 1</p>
        </div>
        <svg class="symbol" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4A90E2" d="M5 10h11a1 1 0 100-2H5a1 1 0 100 2zm-2 4h15a1 1 0 100-2H3a1 1 0 100 2zm4 4h10a1 1 0 100-2H7a1 1 0 100 2z"/>
        <path fill="#4A90E2" d="M18 4a2 2 0 110 4 1 1 0 100 2 4 4 0 100-8 1 1 0 100 2z"/>
        </svg>
    </div>
    <div class="element-container">
        <div id="water" class="card">
            <h2>Water</h2>
            <p>Pin 2</p>
        </div>
        <svg class="symbol" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 18 8 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 8 12 2 12 2Z" fill="#4A90E2"/>
            <path d="M12 4C12 4 16 9 16 14C16 16.21 14.21 18 12 18C9.79 18 8 16.21 8 14C8 9 12 4 12 4Z" fill="#87CEEB"/>
            <ellipse cx="10" cy="12" rx="1" ry="1.5" fill="#FFFFFF" opacity="0.6"/>
        </svg>
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