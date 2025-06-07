// src/components/shop/ShopSidebar.js

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import './Components/game/components/shop/style.css';
  </style>

  <div class="shop">
    <div class="card-asset" data-type="Windmolen" data-base-price="20">
      <div class="corner-icon">
        <img class="img-greenEnergy-card" src="Assets/images/pixelGreenEnergy.svg" alt="">
      </div>
      <img class="windturbine" src="Assets/images/windturbine.png" alt="">
      <p>Windmolen</p>
      <div class="assetCoinDiv">
        <p class="price">20</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Waterrad" data-base-price="20">
      <div class="corner-icon">
        <img class="img-greenEnergy-card" src="Assets/images/pixelGreenEnergy.svg" alt="">
      </div>
      <img class="windturbine" src="Assets/images/waterrad.png" alt="">
      <p>Waterrad</p>
      <div class="assetCoinDiv">
        <p class="price">20</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Zonnepaneel" data-base-price="20">
      <div class="corner-icon">
        <img class="img-greenEnergy-card" src="Assets/images/pixelGreenEnergy.svg" alt="">
      </div>
      <img class="windturbine" src="Assets/images/solar_panel.png" alt="">
      <p>Zonnepaneel</p>
      <div class="assetCoinDiv">
        <p class="price">20</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Kerncentrale" data-base-price="20">
      <div class="corner-icon">
        <img class="img-greenEnergy-card" src="Assets/images/pixelGreyEnergy.svg" alt="">
      </div>
      <img class="kerncentrale" src="Assets/images/kerncentrale.png" alt="">
      <p>Kerncentrale</p>
      <div class="assetCoinDiv">
        <p class="price">20</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Eik" data-base-price="10">
      <img src="Assets/images/Eik.png" alt="tree1" />
      <p>Eik</p>
      <div class="assetCoinDiv">
        <p class="price">10</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Beuk" data-base-price="10">
      <img src="Assets/images/Beuk.png" alt="tree2" />
      <p>Beuk</p>
      <div class="assetCoinDiv">
        <p class="price">10</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Buxus" data-base-price="10">
      <img src="Assets/images/Buxus.png" alt="bush1" />
      <p>Buxus</p>
      <div class="assetCoinDiv">
        <p class="price">10</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>

    <div class="card-asset" data-type="Hulst" data-base-price="10">
      <img src="Assets/images/Hulst.png" alt="bush2" />
      <p>Hulst</p>
      <div class="assetCoinDiv">
        <p class="price">10</p>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
    </div>
  </div>
`;

class ShopSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
    this.currentCoins = 0;

    this._onCardDragStart = this._onCardDragStart.bind(this);
    this._onCurrencyUpdate = this._onCurrencyUpdate.bind(this);
  }

  connectedCallback() {
    this._cards = Array.from(this.shadowRoot.querySelectorAll(".card-asset"));
    this._cards.forEach((card) => {
      card.addEventListener("dragstart", this._onCardDragStart);
    });

    document.addEventListener("currencyUpdate", this._onCurrencyUpdate);
  }

  disconnectedCallback() {
    if (this._cards) {
      this._cards.forEach((card) => {
        card.removeEventListener("dragstart", this._onCardDragStart);
      });
      this._cards = null;
    }

    document.removeEventListener("currencyUpdate", this._onCurrencyUpdate);

    this.currentCoins = null;
  }

  _onCardDragStart(e) {
    e.dataTransfer.setData("text/plain", e.currentTarget.dataset.type);
  }

  _onCurrencyUpdate(e) {
    this.updatePrices(e.detail.coins);
  }

  updatePrices(coins) {
    this.currentCoins = coins;
    this._cards.forEach((card) => {
      const basePrice = parseInt(card.dataset.basePrice, 10);
      const priceElement = card.querySelector(".price");
      let finalPrice = basePrice;
      if (coins < basePrice) {
        finalPrice = Math.ceil(basePrice * 1.1);
        priceElement.style.color = "#ff6b6b";
        priceElement.style.fontWeight = "bold";
      } else {
        priceElement.style.color = "";
        priceElement.style.fontWeight = "";
      }

      priceElement.textContent = finalPrice;
    });
  }
  setCoins(coins) {
    this.updatePrices(coins);
  }
}

customElements.define("shop-sidebar", ShopSidebar);
