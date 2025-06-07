const template = document.createElement("template");
template.innerHTML = `
  <style>
    @import './Components/game/components/details/style.css';
  </style>
  <button class="close">&times;</button>
  <div class="info">
    <p><span class="type"></span></p>
    <p class="energy-row">Energie: <span class="energy"></span></p>
    <p>Sloopkost: <span class="destroy-cost"></span> coins</p>
    <button class="destroy">Sloop</button>
  </div>
`;

class AssetDetail extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this._closeBtn = shadow.querySelector("button.close");
    this._destroyBtn = shadow.querySelector("button.destroy");
    this._typeEl = shadow.querySelector(".type");
    this._energyRow = shadow.querySelector(".energy-row");
    this._energyEl = shadow.querySelector(".energy");
    this._destroyCostEl = shadow.querySelector(".destroy-cost");
    this._infoContainer = shadow.querySelector(".info");

    this._data = null;
    this._basedDestroyCost = 0;

    this._onCloseClick = this._handleCloseClick.bind(this);
    this._onDestroyClick = this._handleDestroyClick.bind(this);
    this._onCurrencyUpdate = this._handleCurrencyUpdate.bind(this);

    this._closeBtn.addEventListener("click", this._onCloseClick);
    this._destroyBtn.addEventListener("click", this._onDestroyClick);
    document.addEventListener("currencyUpdate", this._onCurrencyUpdate);
  }

  connectedCallback() {
    this._tryInitialDataLoad();
  }

  disconnectedCallback() {
    this._closeBtn.removeEventListener("click", this._onCloseClick);
    this._destroyBtn.removeEventListener("click", this._onDestroyClick);
    document.removeEventListener("currencyUpdate", this._onCurrencyUpdate);
  }

  set data(value) {
    this._data = value;
    this._render();
  }

  get data() {
    return this._data;
  }

  _handleCloseClick() {
    this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }));
  }

  _handleDestroyClick() {
    if (!this._data) return;
    const { id, destroyCost: baseCost } = this._data;

    const current = window.phaserGame?.currency?.coins || 0;
    const finalCost = current < baseCost ? Math.ceil(baseCost * 1.1) : baseCost;

    document.dispatchEvent(
      new CustomEvent("scene:destroy-asset", {
        detail: { assetId: id, destroyCost: finalCost },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleCurrencyUpdate() {
    if (this._data) this._render();
  }

  _tryInitialDataLoad() {
    const raw = this.getAttribute("asset-id");
    if (raw && !this._data) {
      const id = parseInt(raw, 10);
      if (!isNaN(id) && Array.isArray(window.phaserGame.assetData)) {
        const a = window.phaserGame.assetData.find((a) => a.id === id);
        if (a) this.data = a;
      }
    }
  }

  _getCurrentCoins() {
    return window.phaserGame?.currency?.coins || 0;
  }

  _calculateFinalDestroyCost(baseCost) {
    const currentCoins = this._getCurrentCoins();
    return currentCoins < baseCost ? Math.ceil(baseCost * 1.1) : baseCost;
  }

  _applyCostStyling(finalCost, baseCost) {
    const hasInsufficientFunds = this._getCurrentCoins() < baseCost;
    if (hasInsufficientFunds) {
      this._destroyCostEl.style.color = "#ff6b6b";
      this._destroyCostEl.style.fontWeight = "bold";
    } else {
      this._destroyCostEl.style.color = "";
      this._destroyCostEl.style.fontWeight = "";
    }
  }

  _render() {
    if (!this._data) return;
    const { id, type, energy, destroyCost } = this._data;
    this.setAttribute("type", type);
    this._typeEl.textContent = type;
    this._destroyCostEl.textContent = destroyCost;

    const natureTypes = ["eik", "beuk", "buxus", "hulst"];
    if (natureTypes.includes(type.toLowerCase())) {
      this._energyRow.style.display = "none";
      this._infoContainer.classList.add("nature");
    } else {
      this._energyRow.style.display = "";
      this._energyEl.textContent = energy;
      this._infoContainer.classList.remove("nature");
    }

    const finaldestroyCost = this._calculateFinalDestroyCost(destroyCost);
    this._destroyCostEl.textContent = finaldestroyCost;
    this._applyCostStyling(finaldestroyCost, destroyCost);

    this._destroyBtn.style.display = "";
  }
}

customElements.define("asset-detail", AssetDetail);
