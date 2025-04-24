//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPPREVIEW
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/workshop/workshopPreview/style.css';
    </style>

    <img id="edit" src="./Assets/SVGs/edit.png" class="buttons" alt="settings" style="top: 8px; width: 26px; height: 25px;">
    <img id="visible" src=""  class="buttons" alt="settings" style="top: 50px; width: 26px; height: 25px;">
    <img id="arrowup" src="./Assets/SVGs/arrow-up.svg"  class="buttons" alt="settings" style="top: 92px; width: 26px; height: 25px;">
    <img id="arrowdown" src="./Assets/SVGs/arrow-down.svg"  class="buttons" alt="settings" style="top: 134px; width: 26px; height: 25px;">
    <div id="preview-content"></div>
`;
//#endregion WORKSHOPPREVIEW

//#region CLASS
window.customElements.define('workshoppreview-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$previewContent = this._shadowRoot.querySelector("#preview-content");
        this.$edit = this._shadowRoot.querySelector("#edit");
        this.$visible = this._shadowRoot.querySelector("#visible");
        this.$arrowUp = this._shadowRoot.querySelector("#arrowup");
        this.$arrowDown = this._shadowRoot.querySelector("#arrowdown");
    }

    // component attributes
    static get observedAttributes() {
        return ['html', "archived"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'html') {
            this.$previewContent.innerHTML = newValue;
        }

        if (name === "archived") {
            if (newValue === "true") {
                this.$visible.src = "./Assets/SVGs/visibility-off.svg";
                this.style.opacity = "0.4";
            } else {
                this.$visible.src = "./Assets/SVGs/visibility-on.svg";
                this.style.opacity = "1";
            }
        }
    }

    updateWorkshopPreview(html) {
        this.$previewContent.innerHTML = html;
    }

    connectedCallback() {

        const user = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
        const isAdmin = user.role === 'ADMIN';
        
        // Hide settings and visible icons if not admin
        if (!isAdmin) {
            this.$edit.style.display = 'none';
            this.$visible.style.display = 'none';
            this.$arrowUp.style.display = 'none';
            this.$arrowDown.style.display = 'none';
            if (this.getAttribute("archived") === "true") {
                this.style.display = "none";
            }
        }

        this.$edit.addEventListener('click', () => {
            this.tabWithWorkshopHandler("workshoppage", "workshop", this.getAttribute("workshop"));
        })

        this.$visible.addEventListener("click", (event) => {
            event.stopPropagation();
            this.toggleVisibility();
        });

        this.$arrowUp.addEventListener("click", async (event) => {
            event.stopPropagation();
            await this.changeWorkshopPosition(this.getAttribute("workshop"), "up");
            this.updateCampInfoPage();
        });

        this.$arrowDown.addEventListener("click", async (event) => {
            event.stopPropagation();
            await this.changeWorkshopPosition(this.getAttribute("workshop"), "down");
            this.updateCampInfoPage();
        });

    }

    tabWithWorkshopHandler(tabId, componentName, componentId) {
        this.dispatchEvent(new CustomEvent('tabID', {
            bubbles: true,
            composed: true,
            detail: { tabId, componentName, componentId }
        }));
    }

    toggleVisibility() {
        if (this.getAttribute("archived") === "true") {
            this.updateWorkshop({ archived: false });
            this.setAttribute("archived", "false");
        } else {
            this.updateWorkshop({ archived: true });
            this.setAttribute("archived", "true");
        }
    }

    updateCampInfoPage() {
        this.dispatchEvent(new CustomEvent('updateCampInfoPage', {
            bubbles: true,
            composed: true,
        }));
    }

    //services
    async updateWorkshop(data) {
        try {
            const ID = this.getAttribute("workshop");
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + `/workshops/${ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async changeWorkshopPosition(id, direction) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(url + `/workshops/${id}/move`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ direction })
            });

            const result = await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
//#endregion CLASS