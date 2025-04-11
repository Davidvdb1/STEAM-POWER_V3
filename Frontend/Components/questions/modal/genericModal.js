//#region IMPORTS

import "../../questions/questionForm/questionForm.js"
//#endregion IMPORTS

//#region TEMPLATE
let modalTemplate = document.createElement('template');
modalTemplate.innerHTML = /*html*/`
    <style>
        @import './components/questions/modal/style.css';
    </style>
    <div class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modal-title"></h2>
            <div id="modal-body"></div>
        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('generic-modal-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(modalTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        this.$modal = this._shadowRoot.querySelector('.modal');
        this.$modalTitle = this._shadowRoot.querySelector('#modal-title');
        this.$modalBody = this._shadowRoot.querySelector('#modal-body');
        this.$close = this._shadowRoot.querySelector('.close');

        this.$close.addEventListener('click', () => {
            this.close();
        });


    }

    setTitle(title) {
        this.$modalTitle.textContent = title;
    }

    setBody(content) {
        this.$modalBody.innerHTML = '';
        this.$modalBody.appendChild(content);
    }

    close() {
        this.remove();
    }
});
//#endregion CLASS
