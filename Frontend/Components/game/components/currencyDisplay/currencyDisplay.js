// src/components/currencyDisplay/currencyDisplay.js

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import "./Components/game/components/currencyDisplay/style.css";
  </style>

  <div class="currency-display">
    <div class="currency-item score">
      <span class="unit">Luchtkwaliteit:</span><span id="score" ></span><span class="unit">/100</span>
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
`;

class CurrencyDisplay extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.greyEl   = this._shadow.getElementById("greyEnergy");
    this.greenEl  = this._shadow.getElementById("greenEnergy");
    this.coinsEl  = this._shadow.getElementById("coins");
    this.scoreEl  = this._shadow.getElementById("score");
    this.loadBtn  = this._shadow.getElementById("loadBtn");
    this.saveBtn  = this._shadow.getElementById("saveBtn");

    this.loadBtn.addEventListener('click', () => this._onLoad());
    this.saveBtn.addEventListener('click', () => this._onSave());

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
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

  set data({ greyEnergy, greenEnergy, coins, score }) {
    if (greyEnergy  != null) this.greyEl.textContent  = greyEnergy;
    if (greenEnergy != null) this.greenEl.textContent = Number(greenEnergy).toFixed(3);
    if (coins       != null) this.coinsEl.textContent = coins;
    if (score != null) {
      this.scoreEl.textContent = score;
      this.scoreEl.style.setProperty('--score', score);
    }

  }

  _onLoad() {
    this.dispatchEvent(new CustomEvent('loadCheckpoint', { bubbles: true, composed: true }));
  }

  _onSave() {
    this.dispatchEvent(new CustomEvent('saveCheckpoint', { bubbles: true, composed: true }));
  }
}

window.customElements.define("currency-display", CurrencyDisplay);
export default CurrencyDisplay;
