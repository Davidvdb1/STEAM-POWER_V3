//#region IMPORTS
//#endregion IMPORTS

//#region CAMPITEM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/camp/campItem/style.css';
    </style>

    <img class="image" src="../Frontend/Assets/images/campExample.webp" alt="campImage">
    <h2 class="title"></h2>

    <div>
        <img src="./Assets/SVGs/location.png" alt="location" style="width: 30px; height: 30px;">
        <p class="location"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/startDateTime.png" alt="startTime" style="width: 30px; height: 30px;">
        <p class="startDate"></p>
        <p class="startTime"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/endDateTime.png" alt="endTime" style="width: 30px; height: 30px;">
        <p class="endDate"></p>
        <p class="endTime"></p>
    </div>
    <div>
        <img src="./Assets/SVGs/age1.png" alt="age" style="width: 30px; height: 30px;">
        <p class="age"></p>
    </div>

`;
//#endregion CAMPITEM

//#region CLASS
window.customElements.define('campitem-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$image = this._shadowRoot.querySelector(".image");
        this.$title = this._shadowRoot.querySelector(".title");
        this.$startDate = this._shadowRoot.querySelector(".startDate");
        this.$startTime = this._shadowRoot.querySelector(".startTime");
        this.$endDate = this._shadowRoot.querySelector(".endDate");
        this.$endTime = this._shadowRoot.querySelector(".endTime");
        this.$location = this._shadowRoot.querySelector(".location");
        this.$age = this._shadowRoot.querySelector(".age");
    }

    // component attributes
    static get observedAttributes() {
        return ["title", "startdate", "enddate", "startage", "endage", "starttime", "endtime", "location", "image"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title") {
            this.$title.innerHTML = newValue;
        }

        if (name === "startdate") {
            const date = new Date(newValue);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.$startDate.innerHTML = date.toLocaleDateString('nl-NL', options);
        }

        if (name === "starttime") {
            this.$startTime.innerHTML = newValue;
        }

        if (name === "enddate") {
            const date = new Date(newValue);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.$endDate.innerHTML = date.toLocaleDateString('nl-NL', options);
        }

        if (name === "endtime") {
            this.$endTime.innerHTML = newValue;
        }

        if (name === "location") {
            this.$location.innerHTML = newValue;
        }

        if (name === "startage") {
            this.$age.innerHTML = `Vanaf ${newValue} t.e.m.`;
        }

        if (name === "endage") {
            this.$age.innerHTML += ` ${newValue} jaar`;
        }

        // if (name === "image") {
        //     this.$image.src = newValue;
        // }

    }

    connectedCallback() {

    }

});
//#endregion CLASS