//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/questions/adminQuestionComponent/style.css';
    </style>
    <div class="container">
        <div class="image-box">
            <img id="picture" src="" alt="Question Image" />
        </div>
        <div class="text-content">
            <div class="title" id="title"></div>
            <div class="description" id="description"></div>
            <div class="description"><b>Vraag:</b> <span id="question-statement">Lorem, ipsum dolor.</span></div>
        </div>
        <div>
            <div>P = <span id="wattage"></span>W</div>
            <div>Score = <span id="score"></span></div>
            <div>Beurten (0=geen limiet) = <span id="max-tries"></span></div>
        </div>

        <div class="button-container">
            <button id="edit">Edit</button>
            <button id="delete">Delete</button>
            <div id="toggle-control">
                <label for="toggleActive">
                    Actief?
                    <input id="active" type="checkbox">            
                </label>
            </div>
        </div>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('adminquestioncomponent-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$toggleActive = this._shadowRoot.querySelector('#active');
    }

    // component attributes
    static get observedAttributes() {
        return ['data-id', 'data-title', 'data-description', 'data-question-statement', 'data-energy-type', 'data-wattage', 'data-score', 'data-max-tries', 'data-active', 'data-picture'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-title':
                this._shadowRoot.querySelector('#title').innerText = newValue;
                break;
            case 'data-description':
                this._shadowRoot.querySelector('#description').innerText = newValue;
                break;
            case 'data-question-statement':
                this._shadowRoot.querySelector('#question-statement').innerText = newValue;
                break;
            case 'data-wattage':
                this._shadowRoot.querySelector('#wattage').innerText = newValue;
                break;
            case 'data-score':
                this._shadowRoot.querySelector('#score').innerText = newValue;
                break;
            case 'data-max-tries':
                this._shadowRoot.querySelector('#max-tries').innerText = newValue;
                break;
            case 'data-active':
                this.$toggleActive.checked = newValue === "false" ? false : true;
                break;
            case 'data-picture':
                this._shadowRoot.querySelector('#picture').src = newValue;
                break;
        }
    }

    connectedCallback() {
        this.$edit = this._shadowRoot.querySelector("#edit");
        this.$delete = this._shadowRoot.querySelector("#delete");

        this.$edit.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent("edit"))
        });

        this.$delete.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent("request-delete"))
        });

        this.$toggleActive.addEventListener("change", async (event) => {
            const id = this.getAttribute('data-id');
            const url = `${window.env.BACKEND_URL}/questions/${id}`
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ active: event.target.checked })
                });
            } catch (error) {
                console.log(error)
                event.target.checked = !event.target.checked;
            }
        });
    }
});
//#endregion CLASS