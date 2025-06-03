// src/components/currencyDisplay/currencyDisplay.js

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
  </div>
`;

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

    this.loadBtn.addEventListener("click", () => this._onLoad());
    this.saveBtn.addEventListener("click", () => this._onSave());

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const newScore = Number(this.scoreEl.textContent);
          if (!isNaN(newScore)) {
            const hue = newScore * 1.2;
            const color = `hsl(${hue}, 100%, 45%)`;
            this.scoreEl.style.color = color;
          }
        }
      }
    });

    observer.observe(this.scoreEl, { childList: true });
  }

  /**
   * Verwacht een object met:
   *   - greyEnergy
   *   - greenEnergy
   *   - coins
   *   - score
   *   - greenBuildingPercentage   (nummer tussen 0 en 100)
   */
  set data({ greyEnergy, greenEnergy, coins, score, greenBuildingPercentage }) {
    if (greyEnergy != null) this.greyEl.textContent = greyEnergy;
    if (greenEnergy != null)
      this.greenEl.textContent = Number(greenEnergy).toFixed(3);
    if (coins != null) this.coinsEl.textContent = coins;
    if (score != null) {
      this.scoreEl.textContent = score;
      this.scoreEl.style.setProperty("--score", score);
    }

    if (greenBuildingPercentage != null) {
      const pct = Math.max(0, Math.min(100, greenBuildingPercentage));
      this._progressBar.style.width = `${pct}%`;
      this._progressPercentText.textContent = `${pct}%`;
    }
  }

  _onLoad() {
    this.dispatchEvent(
      new CustomEvent("loadCheckpoint", { bubbles: true, composed: true })
    );
  }

  _onSave() {
    this.dispatchEvent(
      new CustomEvent("saveCheckpoint", { bubbles: true, composed: true })
    );
  }
}

window.customElements.define("currency-display", CurrencyDisplay);
export default CurrencyDisplay;
