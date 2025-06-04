//#region IMPORTS
import { hagelstorm, regenstorm, windvlaag, zonneschijn, stroomstoring, vervuiling } from "../../utils/randomEventHandler.js";
//#endregion IMPORTS

//#region TEMPLATE
const template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/game/components/randomEventButtons/style.css';
    </style>

    <button id="hagelstorm">Hagelstorm</button>
    <button id="regenstorm">Regenstorm</button>
    <button id="windvlaag">Windvlaag</button>
    <button id="zonneschijn">Zonneschijn</button>
    <button id="stroomstoring">Stroomstoring</button>
    <button id="vervuiling">Vervuiling</button>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('randomeventbuttons-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._buttons = {};
        this._eventNames = [
            "hagelstorm",
            "regenstorm",
            "windvlaag",
            "zonneschijn",
            "stroomstoring",
            "vervuiling"
        ];
    }

connectedCallback() {

    this._eventDataMap = {
        hagelstorm,
        regenstorm,
        windvlaag,
        zonneschijn,
        stroomstoring,
        vervuiling
    };

    this._eventNames.forEach(name => {
        const button = this._shadowRoot.getElementById(name);
        this._buttons[name] = button;

        button.addEventListener("click", () => {
            const eventData = this._eventDataMap[name];
            const groupID = 
            this.createRandomEvent(eventData);
        });
    });
}

//service
async createRandomEvent(data) {
    try {
        const url = window.env.BACKEND_URL;
        const response = await fetch(url + `/gameStatistics/event`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    } catch (error) {
        console.error("Error creating random event:", error);
    }
}

});
//#endregion CLASS
