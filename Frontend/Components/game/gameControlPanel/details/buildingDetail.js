// components/game/gameControlPanel/details/buildingDetail.js
const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import "./style.scss";
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p>Level: <span class="level"></span></p>
    <p>Energy cost: <span class="energy-cost"></span> kW</p>
    <button class="upgrade">
      Upgrade (<span class="upgrade-cost"></span> coins)
    </button>
  </div>
`;

class BuildingDetail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" })
        .appendChild(template.content.cloneNode(true));

    this._closeBtn      = this.shadowRoot.querySelector("button.close");
    this._levelEl       = this.shadowRoot.querySelector(".level");
    this._energyCostEl  = this.shadowRoot.querySelector(".energy-cost");
    this._upgradeBtn    = this.shadowRoot.querySelector(".upgrade");
    this._upgradeCostEl = this.shadowRoot.querySelector(".upgrade-cost");
  }

  connectedCallback() {
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

    const id = this.getAttribute("building-id");
    if (!id) return;
    const data = window.phaserGame.buildingData[id];
    const { level, currentEnergyCost, upgradeCost } = data;

    this._levelEl.textContent      = level;
    this._energyCostEl.textContent = currentEnergyCost;

    if (level < 5) {
      this._upgradeCostEl.textContent = upgradeCost;
      this._upgradeBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("upgrade-build", {
          detail: { buildingId: id },
          bubbles: true
        }));
      });
    } else {
      this._upgradeBtn.style.display = "none";
    }
  }
}

customElements.define("building-detail", BuildingDetail);
