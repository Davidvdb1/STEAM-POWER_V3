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

/**
 * ShopSidebar component for displaying a sidebar with various cards representing assets.
 * Each card can be dragged and dropped, and the prices are updated based on the current coins available.
 * The component listens for currency updates to adjust the prices accordingly.
 */
class ShopSidebar extends HTMLElement {
  /**
   * Creates an instance of ShopSidebar.
   * Initializes the shadow DOM and sets up event listeners for card drag events and currency updates.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
    this.currentCoins = 0;

    this._onCardDragStart = this._onCardDragStart.bind(this);
    this._onCurrencyUpdate = this._onCurrencyUpdate.bind(this);
  }

  /**
   * Called when the element is added to the DOM.
   * It initializes the cards and sets up event listeners for drag events.
   * @returns {void}
   */
  connectedCallback() {
    this._cards = Array.from(this.shadowRoot.querySelectorAll(".card-asset"));
    this._cards.forEach((card) => {
      card.addEventListener("dragstart", this._onCardDragStart);
    });

    document.addEventListener("currencyUpdate", this._onCurrencyUpdate);
  }

  /**
   * Called when the element is removed from the DOM.
   * It cleans up the event listeners and resets the cards.
   * @returns {void}
   * */
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

  /**
   * Handles the drag start event for each card.
   * Sets the data to be transferred during the drag operation.
   * @param {DragEvent} e - The drag event triggered when a card is dragged.
   * @return {void}
   * */
  _onCardDragStart(e) {
    e.dataTransfer.setData("text/plain", e.currentTarget.dataset.type);
  }

  /**
   * Handles the currency update event.
   * Updates the prices of the cards based on the current coins available.
   * @param {CustomEvent} e - The custom event containing the updated coin value.
   * @return {void}
   * */
  _onCurrencyUpdate(e) {
    this.updatePrices(e.detail.coins);
  }

  /**
   * Updates the prices of the cards based on the current coins available.
   * If the coins are less than the base price of a card, it increases the price by 10% and styles the price element accordingly.
   * @param {number} coins - The current amount of coins available.
   * @return {void}
   */
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
  /**
   * Sets the coins and updates the prices of the cards accordingly.
   * @param {number} coins - The current amount of coins available.
   * @return {void}
   */
  setCoins(coins) {
    this.updatePrices(coins);
  }
}

customElements.define("shop-sidebar", ShopSidebar);
