// src/components/currencyDisplay/currencyDisplay.js

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import "./Components/game/components/currencyDisplay/style.css";
  </style>

  <div class="currency-display">
    <div class="currency-item grey-energy">
      <img src="Assets/images/pixelGreyEnergy.svg" alt="Grey Energy" />
      <span id="greyEnergy">0</span>
    </div>
    <div class="currency-item green-energy">
      <img src="Assets/images/pixelGreenEnergy.svg" alt="Green Energy" />
      <span id="greenEnergy">0.000</span>
    </div>
    <div class="currency-item coins">
      <img src="Assets/images/pixelCoin.png" alt="Coins" />
      <span id="coins">0</span>
    </div>
  </div>
`;

class CurrencyDisplay extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.greyEl  = this._shadow.getElementById("greyEnergy");
    this.greenEl = this._shadow.getElementById("greenEnergy");
    this.coinsEl = this._shadow.getElementById("coins");
  }

  set data({ greyEnergy, greenEnergy, coins }) {
    if (greyEnergy  != null) this.greyEl.textContent  = greyEnergy;
    if (greenEnergy != null) this.greenEl.textContent = Number(greenEnergy).toFixed(3);
    if (coins       != null) this.coinsEl.textContent = coins;
  }
}

window.customElements.define("currency-display", CurrencyDisplay);
export default CurrencyDisplay;
