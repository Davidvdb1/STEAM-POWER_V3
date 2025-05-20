// components/game/gameControlPanel/gameControlPanel.js

import { createLogoScene } from "../scenes/logoScene.js";
import { createCityScene } from "../scenes/cityScene.js";
import { createOuterCityScene } from "../scenes/outerCityScene.js";
import * as gameService from "../utils/gameService.js";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import './Components/game/gameControlPanel/style.css';
  </style>

  <div id="wrapper">
    <div id="inner-container">
      <div class="shop">
        <div class="card-asset" draggable="true" data-type="Windmolen">
          <div class="corner-icon">
            <img class="img-greenEnergy-card" src="Assets/images/greenEnergyTransparent2.png" alt="">
          </div>
          <img class="windturbine" src="Assets/images/windturbine.png" alt="">
          <p>Windmolen</p>
          <div class="assetCoinDiv">
            <p>20</p>
            <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
          </div>
        </div>
        <div class="card-asset" draggable="true" data-type="Waterrad">
          <div class="corner-icon">
            <img class="img-greenEnergy-card" src="Assets/images/greenEnergyTransparent2.png" alt="">
          </div>
          <img class="windturbine" src="Assets/images/waterrad.png" alt="">
          <p>Waterrad</p>
          <div class="assetCoinDiv">
            <p>20</p>
            <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
          </div>
        </div>
        <div class="card-asset" draggable="true" data-type="Zonnepaneel">
          <div class="corner-icon">
            <img class="img-greenEnergy-card" src="Assets/images/greenEnergyTransparent2.png" alt="">
          </div>
          <img class="windturbine" src="Assets/images/solar_panel.png" alt="">
          <p>Zonnepaneel</p>
          <div class="assetCoinDiv">
            <p>20</p>
            <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
          </div>
        </div>
        <div class="card-asset" draggable="true" data-type="Kerncentrale">
          <div class="corner-icon">
            <img class="img-greenEnergy-card" src="Assets/images/greyEnergyTransparent2.png" alt="">
          </div>
          <img class="kerncentrale" src="Assets/images/kerncentrale.png" alt="">
          <p>Kerncentrale</p>
          <div class="assetCoinDiv">
            <p>20</p>
            <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
          </div>
        </div>
      </div>
      <div class="test">
        <img id="inner-button" src="Assets/images/toInner.png" alt="Ga naar binnenstad" />
        <div id="inner-text">Ga naar binnenstad</div>
      </div>
    </div>

    <div id="game-container"></div>

    <div id="outer-container">
      <img id="outer-button" src="Assets/images/toOuter.png" alt="Ga naar buitenstad" />
      <div id="outer-text">Ga naar buitenstad</div>
    </div>

    <button id="startButton" class="hidden">Start</button>
  </div>

  <div id="stats" class="hidden">
    <div class="greyEnergy">
      <img class="img-greyEnergy" src="Assets/images/pixelGreyEnergy.svg" alt="">
      <div class="currencyDiv">
        <p id="greyEnergy" class="p-greyEnergy mr">0</p><p class="p-greyEnergy">kW</p>
      </div>
    </div>

    <div class="greenEnergy">
      <img class="img-greenEnergy" src="Assets/images/pixelGreenEnergy.svg" alt="">
      <div class="currencyDiv">
        <p id="greenEnergy" class="p-greenEnergy mr">0</p><p class="p-greenEnergy">kWh</p>
      </div>
    </div>

    <div class="euro">
      <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      <div class="currencyDiv">
        <p id="coins" class="p-euro">0</p>
      </div>
    </div>
  </div>
`;

class GameControlPanel extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));
    this._wrapper = this._shadow.getElementById("wrapper");
    this._statsContainer = this._shadow.getElementById("stats");
    this._startButton = this._shadow.getElementById("startButton");
    this._innerContainer = this._shadow.getElementById("inner-container");
    this._innerButton = this._shadow.getElementById("inner-button");
    this._outerContainer = this._shadow.getElementById("outer-container");
    this._outerButton = this._shadow.getElementById("outer-button");
    this._greenEl = this._shadow.getElementById("greenEnergy");
    this._greyEl = this._shadow.getElementById("greyEnergy");
    this._coinsEl = this._shadow.getElementById("coins");
    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";
  }

  connectedCallback() {
    this._startButton.addEventListener("click", () => this._onStartClick());
    this._outerButton.addEventListener("click", () => this._transitionToOuterCity());
    this._innerButton.addEventListener("click", () => this._transitionToCity());
    this._enableDragFromShop();
    this._loadPhaser().then(() => this._initializeGame());
  }

  _enableDragFromShop() {
    this._shadow.querySelectorAll(".card-asset").forEach(card => {
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", card.dataset.type);
      });
    });
  }

  _loadPhaser() {
    return new Promise((res) => {
      if (window.Phaser) return res();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js";
      s.onload = () => res();
      this._shadow.appendChild(s);
    });
  }

  _initializeGame() {
    const LogoScene = createLogoScene(this._startButton);
    const CityScene = createCityScene();
    const OuterCityScene = createOuterCityScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this._shadow.getElementById("game-container"),
      width: 960,
      height: 560,
      scene: [LogoScene, CityScene, OuterCityScene],
      backgroundColor: "#9bd5e4",
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    // Make Phaser scene globally accessible to handle drops
    window.phaserGame = this._game;
  }

  async _onStartClick() {
    this._startButton.classList.add("hidden");
    this._game.scene.start("CityScene");
    this._outerContainer.style.display = "flex";
    this._innerContainer.style.display = "none";

    try {
      const raw = sessionStorage.getItem("loggedInUser");
      if (!raw) throw new Error("Not logged in");
      const { token, groupId } = JSON.parse(raw);
      const gs = await gameService.fetchGameStatistics(groupId, token);

      this._game.buildingData = gs.buildings;
      this._game.assetData = gs.assets;

      const cur = gs.currency;
      this._greenEl.textContent = cur.greenEnergy;
      this._greyEl.textContent = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
      this._statsContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  _transitionToOuterCity() {
    const distance = this._wrapper.offsetWidth + 800;
    this._animateWrapper(-distance, () => {
      this._game.scene.switch("CityScene", "OuterCityScene");
      this._outerContainer.style.display = "none";
      this._innerContainer.style.display = "flex";
    });
  }

  _transitionToCity() {
    const distance = this._wrapper.offsetWidth + 800;
    this._animateWrapper(distance, () => {
      this._game.scene.switch("OuterCityScene", "CityScene");
      this._innerContainer.style.display = "none";
      this._outerContainer.style.display = "flex";
    });
  }

  _animateWrapper(offsetX, onComplete) {
    const els = [this._wrapper, this._statsContainer];

    els.forEach((el) => {
      el.style.transition = "transform 0.5s ease";
      el.style.transform = `translateX(${offsetX}px)`;
    });

    let done = 0;
    els.forEach((el) => {
      el.addEventListener(
        "transitionend",
        () => {
          done += 1;
          if (done === els.length) {
            onComplete();

            els.forEach((el) => {
              el.style.transition = "none";
              el.style.transform = `translateX(${-offsetX}px)`;
              void el.offsetWidth;
              el.style.transition = "transform 0.5s ease";
              el.style.transform = "translateX(0)";
            });
          }
        },
        { once: true }
      );
    });
  }
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
