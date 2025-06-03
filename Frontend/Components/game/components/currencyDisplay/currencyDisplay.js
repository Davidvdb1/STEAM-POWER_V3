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

    this.greyEl = this._shadow.getElementById("greyEnergy");
    this.greenEl = this._shadow.getElementById("greenEnergy");
    this.coinsEl = this._shadow.getElementById("coins");
    this.loadBtn = this._shadow.getElementById("loadBtn");
    this.saveBtn = this._shadow.getElementById("saveBtn");

    this.loadBtn.addEventListener("click", () => this._onLoad());
    this.saveBtn.addEventListener("click", () => this._onSave());
  }

  set data({ greyEnergy, greenEnergy, coins }) {
    if (greyEnergy != null) this.greyEl.textContent = greyEnergy;
    if (greenEnergy != null)
      this.greenEl.textContent = Number(greenEnergy).toFixed(3);
    if (coins != null) this.coinsEl.textContent = coins;
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
