// components/game/gameControlPanel/gameControlPanel.js

import { createLogoScene } from "../scenes/logoScene.js";
import { createCityScene } from "../scenes/cityScene.js";
import { createOuterCityScene } from "../scenes/outerCityScene.js";
import { fetchStats } from "../utils/fetchStats.js";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import './Components/game/gameControlPanel/style.css';
  </style>

  <div id="wrapper">
    <div id="inner-container">
      <img id="inner-button" src="Assets/images/toInner.png" alt="Ga naar binnenstad" />
      <div id="inner-text">Ga naar binnenstad</div>
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
        <p class="p-greyEnergy">Grijze energie:</p>
        <div class="currencyDiv">
          <p id="greyEnergy" class="p-greyEnergy mr">0</p>
          <p class="p-greyEnergy">kW</p>
        </div>
        <img class="img-greyEnergy" src="Assets/images/pixelGreyEnergy.svg" alt="">
      </div>
      <div class="greenEnergy">
        <p class="p-greenEnergy">Groene energie:</p>
        <div class="currencyDiv">
          <p id="greenEnergy" class="p-greenEnergy">0</p>
          <p class="p-greenEnergy">kWh</p>
        </div>
        <img class="img-greenEnergy" src="Assets/images/pixelGreenEnergy.svg" alt="pixelGreenEnergy">
      </div>
      <div class="euro">
        <p class="p-euro">Coins:</p>
        <div class="currencyDiv">
          <p id="coins" class="p-euro">0</p>
        </div>
        <img class="img-euro" src="Assets/images/pixelCoin.png" alt="pixelCoin">
      </div>
  </div>
`;

class GameControlPanel extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this._wrapper = this._shadow.getElementById("wrapper");
    this._startButton = this._shadow.getElementById("startButton");
    this._innerContainer = this._shadow.getElementById("inner-container");
    this._innerButton = this._shadow.getElementById("inner-button");
    this._outerContainer = this._shadow.getElementById("outer-container");
    this._outerButton = this._shadow.getElementById("outer-button");
    this._statsContainer = this._shadow.getElementById("stats");
    this._greenEl = this._shadow.getElementById("greenEnergy");
    this._greyEl = this._shadow.getElementById("greyEnergy");
    this._coinsEl = this._shadow.getElementById("coins");

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";
  }

  connectedCallback() {
    this._startButton.addEventListener("click", () => this._onStartClick());
    this._outerButton.addEventListener("click", () =>
      this._transitionToOuterCity()
    );
    this._innerButton.addEventListener("click", () => this._transitionToCity());
    this._loadPhaser().then(() => this._initializeGame());
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
      const gs = await fetchStats(groupId, token);
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
    const w = this._wrapper;
    const distance = w.offsetWidth + 800;
    this._animateWrapper(-distance, () => {
      this._game.scene.switch("CityScene", "OuterCityScene");
      this._outerContainer.style.display = "none";
      this._innerContainer.style.display = "flex";
    });
  }

  _transitionToCity() {
    const w = this._wrapper;
    const distance = w.offsetWidth + 800;
    this._animateWrapper(distance, () => {
      this._game.scene.switch("OuterCityScene", "CityScene");
      this._innerContainer.style.display = "none";
      this._outerContainer.style.display = "flex";
    });
  }

  _animateWrapper(offsetX, onComplete) {
    const w = this._wrapper;
    w.style.transition = "transform 0.5s ease";
    w.style.transform = `translateX(${offsetX}px)`;

    w.addEventListener(
      "transitionend",
      () => {
        onComplete();
        w.style.transition = "none";
        w.style.transform = `translateX(${-offsetX}px)`;
        void w.offsetWidth;
        w.style.transition = "transform 0.5s ease";
        w.style.transform = "translateX(0)";
      },
      { once: true }
    );
  }
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
