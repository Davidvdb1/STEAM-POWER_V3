import { createLogoScene } from "../scenes/logoScene.js";
import { createCityScene } from "../scenes/cityScene.js";
import { createOuterCityScene } from "../scenes/outerCityScene.js";
import {
  fetchGameStatistics,
  removeAsset,
  getCurrencyById,
  updateCurrency,
  upgradeBuilding
} from "../utils/gameService.js";

// register our detail-panel components
import "./details/buildingDetail.js";
import "./details/assetDetail.js";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    @import './Components/game/gameControlPanel/style.css';
    :host { display: block; position: relative; }
    #detail-container { position: absolute; top: 0; left: -220px; width: 200px; z-index: 10; }
  </style>

  <!-- wrapper holds both game and panel -->
  <div id="wrapper">
    <!-- DETAIL PANEL: appears when you click a building or asset -->
    <div id="detail-container" class="hidden"></div>
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

    this._detailContainer = this._shadow.getElementById("detail-container");
    this._wrapper         = this._shadow.getElementById("wrapper");
    this._statsContainer  = this._shadow.getElementById("stats");
    this._startButton     = this._shadow.getElementById("startButton");
    this._innerContainer  = this._shadow.getElementById("inner-container");
    this._innerButton     = this._shadow.getElementById("inner-button");
    this._outerContainer  = this._shadow.getElementById("outer-container");
    this._outerButton     = this._shadow.getElementById("outer-button");
    this._greenEl         = this._shadow.getElementById("greenEnergy");
    this._greyEl          = this._shadow.getElementById("greyEnergy");
    this._coinsEl         = this._shadow.getElementById("coins");

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";
  }

  connectedCallback() {
    this._startButton.addEventListener("click", () => this._onStartClick());
    this._outerButton.addEventListener("click", () => this._transitionToOuterCity());
    this._innerButton.addEventListener("click", () => this._transitionToCity());
    this._enableDragFromShop();

    this._shadow.addEventListener("close-detail", () => {
      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
    });

    this._shadow.addEventListener("destroy-asset", e => {
      this._confirmDestroyAsset(e.detail.assetId);
    });

    this._shadow.addEventListener("upgrade-build", e => {
      this._confirmUpgradeBuilding(e.detail.buildingId);
    });

    this._loadPhaser().then(() => this._initializeGame());
  }

  _enableDragFromShop() {
    this._shadow.querySelectorAll(".card-asset").forEach(card => {
      card.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", card.dataset.type);
      });
    });
  }

  _loadPhaser() {
    return new Promise(res => {
      if (window.Phaser) return res();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js";
      s.onload = () => res();
      this._shadow.appendChild(s);
    });
  }

  _initializeGame() {
    const LogoScene      = createLogoScene(this._startButton);
    const CityScene      = createCityScene();
    const OuterCityScene = createOuterCityScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this._shadow.getElementById("game-container"),
      width: 140 * 16,
      height: 70  * 16,
      scene: [LogoScene, CityScene, OuterCityScene],
      backgroundColor: "#9bd5e4",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    window.phaserGame = this._game;
    this._game.events.on("buildingClicked", id => this._showBuildingDetail(id));
    this._game.events.on("assetClicked",    id => this._showAssetDetail(id));
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
      const gs = await fetchGameStatistics(groupId, token);

      this._game.token            = token;
      this._game.groupId          = groupId;
      this._game.buildingData     = gs.buildings;
      this._game.assetData        = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId       = gs.currency.id;

      this._greenEl.textContent = gs.currency.greenEnergy;
      this._greyEl.textContent  = gs.currency.greyEnergy;
      this._coinsEl.textContent = gs.currency.coins;
      this._statsContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  _transitionToOuterCity() {
    this._detailContainer.classList.add("hidden");
    this._detailContainer.innerHTML = "";

    const distance = this._wrapper.offsetWidth + 800;
    this._animateWrapper(-distance, () => {
      this._game.scene.switch("CityScene", "OuterCityScene");
      this._outerContainer.style.display = "none";
      this._innerContainer.style.display = "flex";
    });
  }

  _transitionToCity() {
    this._detailContainer.classList.add("hidden");
    this._detailContainer.innerHTML = "";

    const distance = this._wrapper.offsetWidth + 800;
    this._animateWrapper(distance, () => {
      this._game.scene.switch("OuterCityScene", "CityScene");
      this._innerContainer.style.display = "none";
      this._outerContainer.style.display = "flex";
    });
  }

  _animateWrapper(offsetX, onComplete) {
    const els = [this._wrapper, this._statsContainer];
    els.forEach(el => {
      el.style.transition = "transform 0.5s ease";
      el.style.transform  = `translateX(${offsetX}px)`;
    });

    let done = 0;
    els.forEach(el => {
      el.addEventListener("transitionend", () => {
        done++;
        if (done === els.length) {
          onComplete();
          els.forEach(inner => {
            inner.style.transition = "none";
            inner.style.transform  = `translateX(${-offsetX}px)`;
            void inner.offsetWidth;
            inner.style.transition = "transform 0.5s ease";
            inner.style.transform  = "translateX(0)";
          });
        }
      }, { once: true });
    });
  }

  _showBuildingDetail(id) {
    this._detailContainer.innerHTML = "";
    const detail   = document.createElement("building-detail");
    const building = this._game.buildingData.find(b => b.id === id);
    if (building) detail.data = building;
    this._detailContainer.appendChild(detail);
    this._detailContainer.classList.remove("hidden");
  }

  _showAssetDetail(id) {
    this._detailContainer.innerHTML = "";
    const detail = document.createElement("asset-detail");
    const asset  = this._game.assetData.find(a => a.id === id);
    if (asset) detail.data = asset;
    this._detailContainer.appendChild(detail);
    this._detailContainer.classList.remove("hidden");
  }

  _confirmDestroyAsset(assetId) {
    const asset = this._game.assetData.find(a => a.id === assetId);
    if (!asset) return;

    const msg = `Wil je deze ${asset.type} slopen voor ${asset.destroyCost} coins?`;
    const outer = this._game.scene.getScene("OuterCityScene");
    outer.showConfirmation(msg, confirmed => {
      if (confirmed) this._performDestroyAsset(assetId);
    });
  }

  async _performDestroyAsset(assetId) {
    try {
      const token      = this._game.token;
      const currencyId = this._game.currencyId;
      const asset      = this._game.assetData.find(a => a.id === assetId);
      if (!asset) throw new Error("Asset not found");

      // remove on backend
      await removeAsset(assetId, token);

      // deduct destroyCost
      const cur = await getCurrencyById(currencyId, token);
      const updated = {
        greenEnergy: cur.greenEnergy,
        greyEnergy:  cur.greyEnergy,
        coins:       cur.coins - asset.destroyCost
      };
      await updateCurrency(currencyId, updated, token);

      this._coinsEl.textContent = updated.coins;

      const outer = this._game.scene.getScene("OuterCityScene");
      outer._removeAsset({
        id:  assetId,
        tx:  asset.xLocation,
        ty:  asset.yLocation,
        size:{ width: asset.xSize, height: asset.ySize }
      });

      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
    } catch (err) {
      console.error("Error destroying asset:", err);
    }
  }

  _confirmUpgradeBuilding(buildingId) {
    const building = this._game.buildingData.find(b => b.id === buildingId);
    if (!building) return;

    const currentLevel = building.level.level;
    const nextLevel    = currentLevel + 1;
    const cost         = building.level.upgradeCost;
    const msg = `Wil je dit gebouw upgraden naar niveau ${nextLevel} voor ${cost} coins?`;

    const scene = this._game.scene.getScene("CityScene");
    scene.showConfirmation(msg, confirmed => {
      if (confirmed) {
        this._performUpgradeBuilding(buildingId);
      }
    });
  }

  async _performUpgradeBuilding(buildingId) {
    try {
      const token      = this._game.token;
      const currencyId = this._game.currencyId;
      const building   = this._game.buildingData.find(b => b.id === buildingId);
      if (!building) throw new Error("Building not found");

      const nextLevel = building.level.level + 1;

      const upgradedBuilding = await upgradeBuilding(
        buildingId,
        { level: nextLevel },
        token
      );
      Object.assign(building, upgradedBuilding);

      const cur = await getCurrencyById(currencyId, token);
      const updatedCurrency = {
        greenEnergy: cur.greenEnergy,
        greyEnergy:  cur.greyEnergy,
        coins:       cur.coins - upgradedBuilding.level.upgradeCost
      };
      await updateCurrency(currencyId, updatedCurrency, token);

      this._coinsEl.textContent = updatedCurrency.coins;
      this._greenEl.textContent = updatedCurrency.greenEnergy;
      this._greyEl.textContent  = updatedCurrency.greyEnergy;

      const cityScene = this._game.scene.getScene("CityScene");
      if (typeof cityScene._updateBuildingSprite === "function") {
        cityScene._updateBuildingSprite(upgradedBuilding);
      }

      this._showBuildingDetail(buildingId);
    } catch (err) {
      console.error("Error upgrading building:", err);
    }
  }

}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
