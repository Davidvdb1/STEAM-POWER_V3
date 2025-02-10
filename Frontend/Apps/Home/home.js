//#region IMPORTS
import "../../Components/titelComponent/titelComponent.js"
import "../../Components/ctaComponent/ctaComponent.js"
import "../../Components/infoComponent/infoComponent.js"
import "../../Components/sloganComponent/sloganComponent.js"
import "../../Components/modulebalkComponent/modulebalkComponent.js"
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
<titel-ɠ></titel-ɠ>
<slogan-ɠ></slogan-ɠ>
<info-ɠ></info-ɠ>
<modulebalk-ɠ></modulebalk-ɠ>
<cta-ɠ></cta-ɠ>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('home-ɮ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$example = this._shadowRoot.querySelector(".example");
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