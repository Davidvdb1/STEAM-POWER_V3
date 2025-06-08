const cssResponse = await fetch(
  "./Components/game/components/currencyDisplay/style.css"
);
const cssText = await cssResponse.text();

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    ${cssText}
  </style>

  <div class="currency-display">
    <div class="currency-row">
      <div class="currency-item score">
        <span class="unit">Luchtkwaliteit:</span>
        <span id="score"></span>
        <span class="unit">/100</span>
      </div>

      <div class="currency-item grey-energy">
        <img src="Assets/images/pixelGreyEnergy.svg" alt="Grey Energy" />
        <span id="greyEnergy">0</span><span class="unit">kW</span>
      </div>

      <div class="currency-item green-energy">
        <img src="Assets/images/pixelGreenEnergy.svg" alt="Green Energy" />
        <span id="greenEnergy">0.000</span><span class="unit">kWh</span>
      </div>

      <div class="currency-item coins">
        <img src="Assets/images/pixelCoin.png" alt="Coins" />
        <span id="coins">0</span>
      </div>

      <div class="currency-actions">
        <button id="loadBtn">Load</button>
        <button id="saveBtn">Save</button>
      </div>
    </div>

    <div class="progress-div">
      <div class="progress-row">
        <div class="currency-item green-buildings">
          <span class="unit">Groene Stad:</span>
        </div>

        <div class="progress-container">
          <div id="progressBar" class="progress-bar"></div>
        </div>

        <div class="currency-item progress-percent">
          <span id="progressPercentText">0%</span>
        </div>
      </div>

      <div class="multipliers">
        <span>Bonus:</span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
`;

/**
 * A Web Component that displays currency-related metrics for the game:
 * air quality score, grey and green energy, coins, green-building progress,
 * and multipliers, with buttons to load and save checkpoints.
 */
class CurrencyDisplay extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.greyEl = this._shadow.getElementById("greyEnergy");
    this.greenEl = this._shadow.getElementById("greenEnergy");
    this.coinsEl = this._shadow.getElementById("coins");
    this.scoreEl = this._shadow.getElementById("score");
    this.loadBtn = this._shadow.getElementById("loadBtn");
    this.saveBtn = this._shadow.getElementById("saveBtn");
    this._progressBar = this._shadow.getElementById("progressBar");
    this._progressPercentText = this._shadow.getElementById(
      "progressPercentText"
    );

    this.solarSpan = this._shadow.querySelector(
      ".multipliers span:nth-child(2)"
    );
    this.waterSpan = this._shadow.querySelector(
      ".multipliers span:nth-child(3)"
    );
    this.windSpan = this._shadow.querySelector(
      ".multipliers span:nth-child(4)"
    );

    this._onLoadBound = this._onLoad.bind(this);
    this._onSaveBound = this._onSave.bind(this);

    this.loadBtn.addEventListener("click", this._onLoadBound);
    this.saveBtn.addEventListener("click", this._onSaveBound);

    this._observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const newScore = Number(this.scoreEl.textContent);
          if (!isNaN(newScore)) {
            const hue = newScore * 1.2;
            let color = "#00ff00"; // groen
            if (newScore < 30) color = "#ff0000"; // rood
            else if (newScore < 60) color = "#ffa500"; // oranje
            else if (newScore < 80) color = "#ffff00"; // geel
            this.scoreEl.style.color = color;
          }
        }
      }
    });
    this._observer.observe(this.scoreEl, { childList: true });
  }

  /**
   * Lifecycle callback when the element is removed from the DOM.
   * Cleans up the MutationObserver and removes button listeners.
   */
  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    this.loadBtn.removeEventListener("click", this._onLoadBound);
    this.saveBtn.removeEventListener("click", this._onSaveBound);
  }

  /**
   * Setter for component data. Updates displayed values and dispatches events.
   */
  set data({
    greyEnergy,
    greenEnergy,
    coins,
    score,
    greenBuildingPercentage,
    multipliers,
  }) {
    if (greyEnergy != null) {
      this.greyEl.textContent = greyEnergy;
    }
    if (greenEnergy != null) {
      this.greenEl.textContent = Number(greenEnergy).toFixed(3);
    }
    if (coins != null) {
      this.coinsEl.textContent = coins;
      if (Number(coins) < 0) {
        this.coinsEl.style.color = "#ff0000";
      } else {
        this.coinsEl.style.color = "";
      }
      document.dispatchEvent(
        new CustomEvent("currencyUpdate", {
          detail: { coins: Number(coins) },
        })
      );
    }
    if (score != null) {
      this.scoreEl.textContent = score;
    }

    if (greenBuildingPercentage != null) {
      const pct = Math.max(0, Math.min(100, greenBuildingPercentage));
      this._progressBar.style.width = `${pct}%`;
      this._progressPercentText.textContent = `${pct}%`;
    }

    if (multipliers) {
      this._updateMultipliers(multipliers);
    }

    this.dispatchEvent(
      new CustomEvent("data-ready", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Updates the UI for solar, water, and wind multipliers.
   * @param {Object} multipliers - An object containing the multipliers for solar, water, and wind.
   * @param {number} multipliers.solar - The solar multiplier.
   * @param {number} multipliers.water - The water multiplier.
   * @param {number} multipliers.wind - The wind multiplier.
   */
  _updateMultipliers({ solar, water, wind }) {
    if (solar != null) {
      this.solarSpan.innerHTML = `<img src="Assets/images/solar_panel.png" alt="Solar Panel"> ${solar}x`;
    }
    if (water != null) {
      this.waterSpan.innerHTML = `<img src="Assets/images/waterrad.png" alt="Water Wheel"> ${water}x`;
    }
    if (wind != null) {
      this.windSpan.innerHTML = `<img src="Assets/images/windturbine.png" alt="Wind Turbine"> ${wind}x`;
    }
  }

  /**
   * Dispatches a "loadCheckpoint" event when the Load button is clicked.
   */
  _onLoad() {
    this.dispatchEvent(
      new CustomEvent("loadCheckpoint", { bubbles: true, composed: true })
    );
  }

  /**
   * Dispatches a "saveCheckpoint" event when the Save button is clicked.
   */
  _onSave() {
    this.dispatchEvent(
      new CustomEvent("saveCheckpoint", { bubbles: true, composed: true })
    );
  }
}

window.customElements.define("currency-display", CurrencyDisplay);
export default CurrencyDisplay;
