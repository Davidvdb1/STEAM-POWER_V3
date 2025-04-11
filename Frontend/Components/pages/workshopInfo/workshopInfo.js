//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPINFO
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/workshopInfo/style.css';
    </style>

    <h1 id="camptitle"></h1>
    <div id="workshop"></div>
`;
//#endregion WORKSHOPINFO

//#region CLASS
window.customElements.define('workshopinfo-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$title = this._shadowRoot.querySelector("#camptitle");
        this.$workshopInfo = this._shadowRoot.querySelector("#workshop");
        this.$workshop = null;
    }

    // component attributes
    static get observedAttributes() {
        return ["workshop"];
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        if (name === "camp" && newValue) {
            this.campId = newValue;
            const campName = await this.fetchCampNameWithId(newValue);
            this.updateTitle(campName);
        }

        if (name === "workshop" && newValue) {
            this.workshopId = newValue;
            const workshop = await this.fetchWorkshopWithId(newValue);
            this.updateContent(workshop);
        }
    }

    connectedCallback() {
        const observer = new MutationObserver(() => {
            const edit = this.$workshopInfo?.querySelector("workshoppreview-れ")?.shadowRoot?.querySelector("#edit");
            const visible = this.$workshopInfo?.querySelector("workshoppreview-れ")?.shadowRoot?.querySelector("#visible");
            const arrowUp = this.$workshopInfo?.querySelector("workshoppreview-れ")?.shadowRoot?.querySelector("#arrowup");
            const arrowDown = this.$workshopInfo?.querySelector("workshoppreview-れ")?.shadowRoot?.querySelector("#arrowdown");
            if (edit) edit.remove();
            if (visible) visible.remove();
            if (arrowUp) arrowUp.remove();
            if (arrowDown) arrowDown.remove();
        });

        observer.observe(this.$workshopInfo, { childList: true, subtree: true });
    }

    updateContent() {
        if (!this.$workshop) {
            console.error("Geen workshopgegevens ontvangen");
            return;
        }

        this.$workshopInfo.innerHTML = "";

        let workshopPreview = document.createElement('workshoppreview-れ');
        workshopPreview.updateWorkshopPreview(this.$workshop.html);
        this.$workshopInfo.appendChild(workshopPreview);
    }

    //services
    async fetchWorkshopWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.$workshop = await response.json();
            this.updateContent();

        } catch (error) {
            console.error("Fout bij ophalen van workshop:", error);
            return null;
        }
    }
});
//#endregion CLASS
