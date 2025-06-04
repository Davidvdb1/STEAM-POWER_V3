// import gameStatisticsService from "../../../../../Backend/service/gameStatisticsService.js";
import { BUILDING_NAME_TRANSLATIONS } from "../../utils/buildingDefinitions.js";
const cssResponse = await fetch(
  "./Components/game/components/details/style.css"
);
const cssText = await cssResponse.text();

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    ${cssText}
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p><strong><span class="name"></span></strong></p>
    <p>Level: <span class="level"></span></p>
    <p>Energie kost: <span class="energy-cost"></span> kW</p>
    <p class="upgrade-line">
      Upgrade kost: <span class="upgrade-cost"></span> coins
    </p>
    <div class="buttons">
        <button class="upgrade">
          Upgrade
        </button>
        <button class="toggleEnergy"></button>
    </div>
  </div>
`;

class BuildingDetail extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this._closeBtn = shadow.querySelector("button.close");
    this._nameEl = shadow.querySelector(".name");
    this._levelEl = shadow.querySelector(".level");
    this._energyCostEl = shadow.querySelector(".energy-cost");
    this._upgradeLine = shadow.querySelector(".upgrade-line");
    this._upgradeCostEl = shadow.querySelector(".upgrade-cost");
    this._upgradeBtn = shadow.querySelector(".upgrade");
    this._toggleEnergyBtn = shadow.querySelector(".toggleEnergy");
    this._data = null;
    this._runsOnGreen = false;
  }

  set data(value) {
    this._data = value;
    this._render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

    const raw = this.getAttribute("building-id");
    if (raw && !this._data) {
      const id = parseInt(raw, 10);
      if (!isNaN(id) && Array.isArray(window.phaserGame.buildingData)) {
        const b = window.phaserGame.buildingData.find((b) => b.id === id);
        if (b) this.data = b;
      }
    }
  }

  _render() {
    if (!this._data) return;

    const { runsOnGreen } = this._data;

    this.setAttribute("runsOnGreen", runsOnGreen);

    // Ensure we have level data
    const lvl = this._data.buildingLevel || this._data.level;
    if (!lvl) {
      console.error("Building has no level data:", this._data);
      return;
    }

    const buildingName = this._data.name;
    const num = lvl.level; // numeric level
    const cost = lvl.energyCost; // kW
    const upgCost = lvl.upgradeCost; // coins

    // populate basics
    this._nameEl.textContent =
      BUILDING_NAME_TRANSLATIONS[buildingName] || buildingName;
    this._levelEl.textContent = num;
    this._energyCostEl.textContent = cost;
    this._toggleEnergyBtn.textContent = `Op ${
      this._data.runsOnGreen ? "grijze energie" : "groene energie"
    } runnen`;

    this._toggleEnergyBtn.onclick = () => {
      document.dispatchEvent(
        new CustomEvent("scene:toggle-building-energy", {
          detail: { GameBuildingId: this._data.id },
          bubbles: true,
          composed: true,
        })
      );
    };

    if (num < 5) {
      // under max: show cost & button
      this._upgradeLine.textContent = `Upgrade kost: ${upgCost} coins`;
      this._upgradeBtn.style.display = "";
      this._upgradeBtn.onclick = () => {
        document.dispatchEvent(
          new CustomEvent("scene:upgrade-building", {
            detail: { GameBuildingId: this._data.id },
            bubbles: true,
            composed: true,
          })
        );
      };
    } else {
      // at max: replace line and hide button
      this._upgradeLine.textContent = "Max level";
      this._upgradeBtn.style.display = "none";
    }
  }
}

customElements.define("building-detail", BuildingDetail);
