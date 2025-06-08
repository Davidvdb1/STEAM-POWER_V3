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

/**
 * Web Component showing details for a selected asset,
 * including type, energy, destroy cost, and actions.
 */
class AssetDetail extends HTMLElement {
  /**
   * Attach shadow DOM, clone template,
   * cache elements, bind event handlers.
   */
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

  /** Called when element is added to DOM; attempts to load initial data.
   *  @returns {void}
   */
  connectedCallback() {
    this._tryInitialDataLoad();
  }
  /** Called when element is removed from DOM; cleans up event listeners. */
  disconnectedCallback() {
    this._closeBtn.removeEventListener("click", this._onCloseClick);
    this._destroyBtn.removeEventListener("click", this._onDestroyClick);
    document.removeEventListener("currencyUpdate", this._onCurrencyUpdate);
  }

  /**
   * Set the asset data and re-render details.
   * @param {Object} value - Asset data object containing id, type, energy, destroyCost.
   */
  set data(value) {
    this._data = value;
    this._render();
  }
  /**
   * Get the current asset data.
   * @return {Object|null} The asset data object or null if not set.
   */
  get data() {
    return this._data;
  }

  /** Dispatches a `close-detail` event when close button is clicked. */
  _handleCloseClick() {
    this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }));
  }

  /** Dispatches `scene:destroy-asset` with final cost when destroy button is clicked. */
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

  /** Re-renders when currency updates to adjust cost styling. */
  _handleCurrencyUpdate() {
    if (this._data) this._render();
  }

  /** Attempts to load asset data from `asset-id` attribute on first connect. */
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
  /** returns current coin count from the global game state.
   * @returns {number} Current coins available to the player.
   */
  _getCurrentCoins() {
    return window.phaserGame?.currency?.coins || 0;
  }

  /**
   * Calculate final destroy cost:
   * adds 10% if player has insufficient coins.
   * @param {number} baseCost
   * @returns {number}
   */
  _calculateFinalDestroyCost(baseCost) {
    const currentCoins = this._getCurrentCoins();
    return currentCoins < baseCost ? Math.ceil(baseCost * 1.1) : baseCost;
  }

  /**
   * Applies styling to the destroy cost element based on current coins.
   * If insufficient funds, sets color to red and bolds the text.
   * @param {number} finalCost - The final cost to display.
   * @param {number} baseCost - The base cost of the asset.
   * @return {void}
   * */
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

  /**
   * Renders the asset details in the component.
   * Sets the type, energy, destroy cost, and applies styling based on conditions.
   */
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
