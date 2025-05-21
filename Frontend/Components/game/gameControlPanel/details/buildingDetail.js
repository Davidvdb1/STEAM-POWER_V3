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
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this._closeBtn      = shadow.querySelector("button.close");
    this._levelEl       = shadow.querySelector(".level");
    this._energyCostEl  = shadow.querySelector(".energy-cost");
    this._upgradeBtn    = shadow.querySelector(".upgrade");
    this._upgradeCostEl = shadow.querySelector(".upgrade-cost");
    this._data          = null;
  }

  // Parent can set .data directly
  set data(value) {
    this._data = value;
    this._render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    // close button
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

    // fallback if someone still uses building-id attribute
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

    // unpack nested Level instance
    const lvl = this._data.level;
    const num   = lvl.level;        // numeric level
    const cost  = lvl.energyCost;   // kW
    const upg   = lvl.upgradeCost;  // coins

    this._levelEl.textContent       = num;
    this._energyCostEl.textContent  = cost;

    if (num < 5) {
      this._upgradeCostEl.textContent = upg;
      this._upgradeBtn.style.display   = "";
      this._upgradeBtn.onclick = () => {
        this.dispatchEvent(new CustomEvent("upgrade-build", {
          detail: { buildingId: this._data.id },
          bubbles: true
        }));
      };
    } else {
      this._upgradeBtn.style.display = "none";
    }
  }
}

customElements.define("building-detail", BuildingDetail);
