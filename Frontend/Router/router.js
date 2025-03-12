//#region IMPORTS
import "../Apps/Home/home.js"

//#endregion IMPORTS


//#region ROUTER
const router = document.createElement('template');
router.innerHTML = /* html */ `
<style>
    @import './Router/style.css';
</style>
<div id="router-container">
</div>`;
//#endregion ROUTER

//#region CLASS
window.customElements.define('router-ɮ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(router.content.cloneNode(true));

        this.$router = this._shadowRoot.querySelector('#router-container');

        let urlPath = window.location.pathname;
        // this.hidePages();

        let pageComponent;
        switch (urlPath) {

            default:
                pageComponent = document.createElement('home-ɮ');
                break;
        }
        this.$router.appendChild(pageComponent);
    }

    set content(x) {
        this.$content.innerHTML = x;
    }
});
//#endregion CLASS