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
    .insufficient-funds {
      color: #ff4444;
      font-weight: bold;
    }
    .penalty-warning {
      color: #ff6666;
      font-size: 0.9em;
      margin-top: 5px;
    }
  </style>
  <button class="close">&times;</button>
  <div class="info">
    <p><strong><span class="name"></span></strong></p>
    <p>Level: <span class="level"></span></p>
    <p>Energie kost: <span class="energy-cost"></span> kW</p>
    <p class="upgrade-line">
      Upgrade kost: <span class="upgrade-cost"></span> coins
    </p>
    <p class="penalty-warning" style="display: none;">
      +10% penalty voor onvoldoende munten
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
    this._penaltyWarning = shadow.querySelector(".penalty-warning");
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

  _getCurrentCoins() {
    // Get current coins from the game currency
    return window.phaserGame?.currency?.coins || 0;
  }

  _calculateUpgradeCost(baseCost) {
    const currentCoins = this._getCurrentCoins();
    const hasInsufficientFunds = currentCoins < baseCost;

    if (hasInsufficientFunds) {
      return Math.ceil(baseCost * 1.1); // 10% increase, rounded up
    }

    return baseCost;
  }

  _render() {
    if (!this._data) return;
    const { runsOnGreen } = this._data;
    this.setAttribute("runsOnGreen", runsOnGreen);
    const lvl = this._data.buildingLevel || this._data.level;
    if (!lvl) {
      console.error("Building has no level data:", this._data);
      return;
    }
    const buildingName = this._data.name;
    const num = lvl.level;
    const cost = lvl.energyCost;
    const baseUpgradeCost = lvl.upgradeCost;
    const currentCoins = this._getCurrentCoins();

    // SIMPEL: als currentCoins < baseUpgradeCost -> +10%
    const finalUpgradeCost =
      currentCoins < baseUpgradeCost
        ? Math.ceil(baseUpgradeCost * 1.1)
        : baseUpgradeCost;
    const hasInsufficientFunds = currentCoins < baseUpgradeCost;

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
      this._upgradeCostEl.textContent = finalUpgradeCost;
      this._upgradeCostEl.className = hasInsufficientFunds
        ? "insufficient-funds"
        : "";
      this._upgradeLine.textContent = `Upgrade kost: ${finalUpgradeCost} coins`;

      if (hasInsufficientFunds) {
        this._penaltyWarning.style.display = "block";
      } else {
        this._penaltyWarning.style.display = "none";
      }

      this._upgradeBtn.style.display = "";
      this._upgradeBtn.onclick = () => {
        document.dispatchEvent(
          new CustomEvent("scene:upgrade-building", {
            detail: {
              GameBuildingId: this._data.id,
              upgradeCost: finalUpgradeCost,
            },
            bubbles: true,
            composed: true,
          })
        );
      };
    } else {
      this._upgradeLine.textContent = "Max level";
      this._upgradeBtn.style.display = "none";
      this._penaltyWarning.style.display = "none";
    }
  }
}
customElements.define("building-detail", BuildingDetail);
