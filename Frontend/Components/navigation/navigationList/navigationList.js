//#region IMPORTS
import "../../../Components/navigation/navigationItem/navigationItem.js"
//#endregion IMPORTS

//#region NAVIGATIONLIST
let template = document.createElement('template');
template.innerHTML = /*html*/`  
    <style>
        @import './Components/navigation/navigationList/style.css';
    </style>

    <ul class="navigationList"></ul>
`;
//#endregion NAVIGATIONLIST

//#region CLASS
window.customElements.define('navigationlist-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$list = this._shadowRoot.querySelector("ul");
    }

    static get observedAttributes() {
        return ["tabs"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "tabs") {  
            const items = JSON.parse(newValue);
            this.$list.innerHTML = "";
            // voor elk item in de navbar de id en label setten
            items.forEach(({ id, label }) => {
                const item = document.createElement("navigationitem-れ");
                item.setAttribute("id", id);
                item.setAttribute("label", label);
                item.className = "navigationListItemComponent";
                this.$list.appendChild(item);
            });
        }
    }

    connectedCallback() {

    }    
});
//#endregion CLASS