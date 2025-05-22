// components/game/gameControlPanel/details/buildingDetail.js

const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import "/Components/game/gameControlPanel/details/style.css";
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p>Level: <span class="level"></span></p>
    <p>Energie kost: <span class="energy-cost"></span> kW</p>
    <p class="upgrade-line">
      Upgrade kost: <span class="upgrade-cost"></span> coins
    </p>
    <button class="upgrade">
      Upgrade
    </button>
  </div>
`;

class BuildingDetail extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this._closeBtn      = shadow.querySelector("button.close");
    this._levelEl       = shadow.querySelector(".level");
    this._energyCostEl  = shadow.querySelector(".energy-cost");
    this._upgradeLine   = shadow.querySelector(".upgrade-line");
    this._upgradeCostEl = shadow.querySelector(".upgrade-cost");
    this._upgradeBtn    = shadow.querySelector(".upgrade");
    this._data          = null;
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
        const b = window.phaserGame.buildingData.find(b => b.id === id);
        if (b) this.data = b;
      }
    }
  }

  _render() {
    if (!this._data) return;

    const lvl     = this._data.level;
    const num     = lvl.level;        // numeric level
    const cost    = lvl.energyCost;   // kW
    const upgCost = lvl.upgradeCost;  // coins

    // populate basics
    this._levelEl.textContent      = num;
    this._energyCostEl.textContent = cost;

    if (num < 5) {
      // under max: show cost & button
      this._upgradeLine.textContent = `Upgrade kost: ${upgCost} coins`;
      this._upgradeBtn.style.display = "";
      this._upgradeBtn.onclick = () => {
        this.dispatchEvent(new CustomEvent("upgrade-build", {
          detail: { buildingId: this._data.id },
          bubbles: true
        }));
      };
    } else {
      // at max: replace line and hide button
      this._upgradeLine.textContent = "Max level";
      this._upgradeBtn.style.display = "none";
    }
  }
}

customElements.define("building-detail", BuildingDetail);
