// src/components/game/GameControlPanel.js

import { createLogoScene } from "../components/scenes/logoScene.js";
import { createCityScene } from "../components/scenes/cityScene.js";
import { createOuterCityScene } from "../components/scenes/outerCityScene.js";
import {
  fetchGameStatistics,
  getAllGameBuildingsByGroupId,
  removeAsset,
  getCurrencyById,
  updateCurrency,
  upgradeBuilding,
  recordCheckpoint,
  getCheckpointsByGameStatisticsId,
  refactorGameStatistics,
} from "../service/gameService.js";

// register our detail-panel components
import "../components/details/buildingDetail.js";
import "../components/details/assetDetail.js";
import "../components/shop/shop.js";
import "../components/currencyDisplay/currencyDisplay.js";
import { createCheckpointLoadPopup } from "../utils/checkpointLoadPopup.js";

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
      <!-- now using our extracted shop-sidebar component -->
      <shop-sidebar></shop-sidebar>

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

  <currency-display id="stats" class="hidden"></currency-display>
`;

class GameControlPanel extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));

    this._detailContainer = this._shadow.getElementById("detail-container");
    this._wrapper = this._shadow.getElementById("wrapper");
    this._statsContainer = this._shadow.getElementById("stats");
    this._startButton = this._shadow.getElementById("startButton");
    this._innerContainer = this._shadow.getElementById("inner-container");
    this._innerButton = this._shadow.getElementById("inner-button");
    this._outerContainer = this._shadow.getElementById("outer-container");
    this._outerButton = this._shadow.getElementById("outer-button");

    this._greyEl = this._statsContainer.greyEl;
    this._greenEl = this._statsContainer.greenEl;
    this._coinsEl = this._statsContainer.coinsEl;

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";
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

  connectedCallback() {
    this._startButton.addEventListener("click", () => this._onStartClick());
    this._outerButton.addEventListener("click", () =>
      this._transitionToOuterCity()
    );
    this._innerButton.addEventListener("click", () => this._transitionToCity());

    this._shadow.addEventListener("close-detail", () => {
      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
    });

    this._shadow.addEventListener("destroy-asset", (e) => {
      this._confirmDestroyAsset(e.detail.assetId);
    });

    this._shadow.addEventListener("upgrade-build", (e) => {
      this._confirmUpgradeBuilding(e.detail.GameBuildingId);
    });
    this._statsContainer.addEventListener("saveCheckpoint", () =>
      this._onSaveCheckpoint()
    );
    this._statsContainer.addEventListener("loadCheckpoint", () =>
      this._onLoadCheckpoint()
    );

    this._loadPhaser().then(() => this._initializeGame());

    const bluetooth = JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
    if (bluetooth) {
      this._interval = setInterval(() => {
        this._updateCurrency();
      }, 2000);
    }
  }

  _initializeGame() {
    const LogoScene = createLogoScene(this._startButton);
    const CityScene = createCityScene();
    const OuterCityScene = createOuterCityScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this._shadow.getElementById("game-container"),
      width: 140 * 16,
      height: 70 * 16,
      scene: [LogoScene, CityScene, OuterCityScene],
      backgroundColor: "#9bd5e4",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    window.phaserGame = this._game;
    this._game.events.on("buildingClicked", (id) =>
      this._showBuildingDetail(id)
    );
    this._game.events.on("assetClicked", (id) => this._showAssetDetail(id));
  }

  async _updateStatistics() {
    try {
      const raw = sessionStorage.getItem("loggedInUser");
      if (!raw) throw new Error("Not logged in");
      const { token, groupId } = JSON.parse(raw);
      const gs = await fetchGameStatistics(groupId, token);

      // If buildings are included in game statistics, transform them
      if (gs.gameBuildings && Array.isArray(gs.gameBuildings)) {
        this._game.buildingData = this._transformBuildingData(gs.gameBuildings);
      }

      this._game.token = token;
      this._game.groupId = groupId;
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;

      const cur = gs.currency;
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._greyEl.textContent = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
      this._statsContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  _transformBuildingData(gameBuildings) {
    if (!gameBuildings || !Array.isArray(gameBuildings)) return [];

    return gameBuildings.map((gb) => ({
      id: gb.id,
      name: gb.building ? gb.building.name : "Unknown Building",
      building: gb.building, // Keep original reference if needed
      level: gb.buildingLevel, // Directly use buildingLevel as level
    }));
  }

  async _updateEnergy() {
    try {
      const user = sessionStorage.getItem("loggedInUser");
      if (!user) throw new Error("Not logged in");
      const { token, groupId } = JSON.parse(user);
      const gs = await fetchGameStatistics(groupId, token);

      const counts = gs.assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {});

      const extra = {
        greenEnergy: 0,
        greyEnergy: 0,
      };
      if (counts["Windmolen"]) extra.greenEnergy += counts["Windmolen"] * 50;
      if (counts["Waterrad"]) extra.greenEnergy += counts["Waterrad"] * 50;
      if (counts["Zonnepaneel"])
        extra.greenEnergy += counts["Zonnepaneel"] * 50;
      if (counts["Kerncentrale"])
        extra.greyEnergy += counts["Kerncentrale"] * 100;

      const cur = gs.currency;
      const updated = {
        greenEnergy: cur.greenEnergy + extra.greenEnergy,
        greyEnergy: cur.greyEnergy + extra.greyEnergy,
        coins: cur.coins,
      };
      await updateCurrency(cur.id, updated, token);

      this._greenEl.textContent = updated.greenEnergy;
      this._greyEl.textContent = updated.greyEnergy;
    } catch (e) {
      console.error("Error updating energy:", e);
    }
  }

  async _onStartClick() {
    this._startButton.classList.add("hidden");
    this._game.scene.start("CityScene");
    this._outerContainer.style.display = "flex";
    this._innerContainer.style.display = "none";

    await this._updateStatistics();
    this._energyInterval = setInterval(() => this._updateEnergy(), 60_000);
    this._statsInterval = setInterval(() => this._updateStatistics(), 3000);
    try {
      const raw = sessionStorage.getItem("loggedInUser");
      if (!raw) throw new Error("Not logged in");
      const { token, groupId } = JSON.parse(raw);
      const gs = await fetchGameStatistics(groupId, token);
      const gameBuildings = await getAllGameBuildingsByGroupId(groupId, token);

      this._game.token = token;
      this._game.groupId = groupId;
      this._game.buildingData = this._transformBuildingData(gameBuildings);
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;

      const cur = gs.currency;
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._greyEl.textContent = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
      this._statsContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  async _updateCurrency() {
    try {
      const cur = await gameService.getCurrencyById(
        this._game.currencyId,
        this._game.token
      );
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._greyEl.textContent = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
    } catch (e) {
      console.error("Error fetching currency:", e);
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
    els.forEach((el) => {
      el.style.transition = "transform 0.5s ease";
      el.style.transform = `translateX(${offsetX}px)`;
    });

    let done = 0;
    els.forEach((el) => {
      el.addEventListener(
        "transitionend",
        () => {
          done++;
          if (done === els.length) {
            onComplete();
            els.forEach((inner) => {
              inner.style.transition = "none";
              inner.style.transform = `translateX(${-offsetX}px)`;
              void inner.offsetWidth;
              inner.style.transition = "transform 0.5s ease";
              inner.style.transform = "translateX(0)";
            });
          }
        },
        { once: true }
      );
    });
  }

  _showBuildingDetail(id) {
    this._detailContainer.innerHTML = "";
    const detail = document.createElement("building-detail");
    const building = this._game.buildingData.find((b) => b.id === id);
    if (building) detail.data = building;
    console.log("Building detail:", building);
    this._detailContainer.appendChild(detail);
    this._detailContainer.classList.remove("hidden");
  }

  _showAssetDetail(id) {
    this._detailContainer.innerHTML = "";
    const detail = document.createElement("asset-detail");
    const asset = this._game.assetData.find((a) => a.id === id);
    if (asset) detail.data = asset;
    this._detailContainer.appendChild(detail);
    this._detailContainer.classList.remove("hidden");
  }

  _confirmDestroyAsset(assetId) {
    const asset = this._game.assetData.find((a) => a.id === assetId);
    if (!asset) return;

    const msg = `Wil je deze ${asset.type} slopen voor ${asset.destroyCost} coins?`;
    const outer = this._game.scene.getScene("OuterCityScene");
    outer.showConfirmation(msg, (confirmed) => {
      if (confirmed) this._performDestroyAsset(assetId);
    });
  }

  async _performDestroyAsset(assetId) {
    try {
      const token = this._game.token;
      const currencyId = this._game.currencyId;
      const asset = this._game.assetData.find((a) => a.id === assetId);
      if (!asset) throw new Error("Asset not found");

      // remove on backend
      await removeAsset(assetId, token);

      // deduct destroyCost
      const cur = await getCurrencyById(currencyId, token);
      const updated = {
        greenEnergy: cur.greenEnergy,
        greyEnergy: cur.greyEnergy,
        coins: cur.coins - asset.destroyCost,
      };
      await updateCurrency(currencyId, updated, token);

      this._coinsEl.textContent = updated.coins;

      const outer = this._game.scene.getScene("OuterCityScene");
      outer._removeAsset({
        id: assetId,
        tx: asset.xLocation,
        ty: asset.yLocation,
        size: { width: asset.xSize, height: asset.ySize },
      });

      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
    } catch (err) {
      console.error("Error destroying asset:", err);
    }
  }

  _confirmUpgradeBuilding(GameBuildingId) {
    const building = this._game.buildingData.find(
      (b) => b.id === GameBuildingId
    );
    if (!building) return;

    const currentLevel = building.level.level;
    const nextLevel = currentLevel + 1;
    const cost = building.level.upgradeCost;
    const msg = `Wil je dit gebouw upgraden naar niveau ${nextLevel} voor ${cost} coins?`;

    const scene = this._game.scene.getScene("CityScene");
    scene.showConfirmation(msg, (confirmed) => {
      if (confirmed) {
        this._performUpgradeBuilding(GameBuildingId);
      }
    });
  }

  async _performUpgradeBuilding(GameBuildingId) {
    try {
      const token = this._game.token;
      const currencyId = this._game.currencyId;
      const building = this._game.buildingData.find(
        (b) => b.id === GameBuildingId
      );
      console.log("Performing upgrade for building:", GameBuildingId);
      console.log("Performing upgrade for building:", building);
      if (!building) throw new Error("Building not found");

      // Get level data from either level or buildingLevel property
      const currentLevel = building.level
        ? building.level.level
        : building.buildingLevel
        ? building.buildingLevel.level
        : 1;
      const nextLevel = currentLevel + 1;

      // Call the backend to upgrade the building
      const upgradedBuilding = await upgradeBuilding(
        GameBuildingId,
        { level: nextLevel },
        token
      );

      // Update the local building data with transformed data if needed
      if (upgradedBuilding.buildingLevel && !upgradedBuilding.level) {
        // Transform the response to match our expected format
        upgradedBuilding.level = upgradedBuilding.buildingLevel;
      }

      Object.assign(building, upgradedBuilding);

      // Update currency
      const cur = await getCurrencyById(currencyId, token);
      const upgCost = building.level
        ? building.level.upgradeCost
        : building.buildingLevel
        ? building.buildingLevel.upgradeCost
        : 0;

      const updatedCurrency = {
        greenEnergy: cur.greenEnergy,
        greyEnergy: cur.greyEnergy,
        coins: cur.coins - upgCost,
      };

      await updateCurrency(currencyId, updatedCurrency, token);

      this._coinsEl.textContent = updatedCurrency.coins;
      this._greenEl.textContent = updatedCurrency.greenEnergy;
      this._greyEl.textContent = updatedCurrency.greyEnergy;

      const cityScene = this._game.scene.getScene("CityScene");
      if (typeof cityScene._updateBuildingSprite === "function") {
        cityScene._updateBuildingSprite(building);
      }

      this._showBuildingDetail(GameBuildingId);
    } catch (err) {
      console.error("Error upgrading building:", err);
    }
  }

  _onSaveCheckpoint() {
    const activeScene = this._game.scene.getScene("CityScene").scene.isActive()
      ? this._game.scene.getScene("CityScene")
      : this._game.scene.getScene("OuterCityScene");

    activeScene.showConfirmation(
      "Wil je je voortgang opslaan?",
      (confirmed) => {
        if (confirmed) {
          this._performSaveCheckpoint();
        }
      }
    );
  }

  async _performSaveCheckpoint() {
    const raw = sessionStorage.getItem("loggedInUser");
    if (!raw) {
      console.error("No user in sessionStorage!");
      return;
    }
    const { groupId, token } = JSON.parse(raw);

    console.log("groupId:", groupId, "token:", token);

    const stats = await fetchGameStatistics(groupId, token);
    const gameStatisticsId = stats.id;

    await recordCheckpoint(gameStatisticsId, token);
    console.log("Currency saved successfully!");
  }

  _onLoadCheckpoint() {
    const active = this._game.scene.isActive("CityScene")
      ? this._game.scene.getScene("CityScene")
      : this._game.scene.getScene("OuterCityScene");

    active.showCheckpointList((selectedId) => {
      active.showConfirmation(
        `Wil je checkpoint ${selectedId} laden?`,
        (confirmed) => {
          if (confirmed) {
            this._performLoadCheckpoint(selectedId);
            
          }
        }
      );
    });
  }

  async _performLoadCheckpoint(selectedCheckpointId) {
    // 1) grab your credentials
    const raw = sessionStorage.getItem("loggedInUser");
    if (!raw) {
      console.error("No user in sessionStorage!");
      return;
    }
    const { groupId, token } = JSON.parse(raw);

    // 2) re-fetch your gameStatistics so you get a valid ID
    const stats = await fetchGameStatistics(groupId, token);
    const gameStatsId = stats.id;

    // 3) fetch all checkpoints for that statistics record
    const checkpoints = await getCheckpointsByGameStatisticsId(
      gameStatsId,
      token
    );

    // 4) find the one the user clicked
    const cp = checkpoints.find((c) => c.id === selectedCheckpointId);
    if (!cp) {
      console.error("Checkpoint not found:", selectedCheckpointId);
      return;
    }

    // 5) now actually *apply* the checkpoint.
    //    (you’ll need a backend call or local logic here;
    //     e.g. recordCheckpoint or a custom loadCheckpoint call)
    await refactorGameStatistics(selectedCheckpointId, token);

    console.log("Loaded checkpoint:", cp);
  }
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
