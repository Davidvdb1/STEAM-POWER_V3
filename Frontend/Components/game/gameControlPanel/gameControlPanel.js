import { createLogoScene } from "../components/scenes/logoScene.js";
import { createCityScene } from "../components/scenes/cityScene.js";
import { createOuterCityScene } from "../components/scenes/outerCityScene.js";
import { createMenuScene } from "../components/scenes/menuScene.js";
import {
  fetchGameStatistics,
  updateCurrency,
  recordCheckpoint,
  refactorGameStatistics,
  toggleAllBuildingsRunsOnGreenFalse,
} from "../service/gameService.js";
import {
  transformBuildingData,
  buildCurrencyDisplayPayload,
  calculateTotalGreenCost,
  unpackCheckpointPayload,
} from "../utils/gameDataHelpers.js";
import { getAuthFromSession } from "../utils/sessionHelper.js";
import { buildUpdatedCurrency } from "../utils/currencyHelpers.js";
import { animateWrapperAndStats } from "../utils/animationHandler.js";
import { showDetail } from "../utils/detailHelper.js";
import { setBuildingColor } from "../utils/buildingHandler.js";

const cssResponse = await fetch("./Components/game/gameControlPanel/style.css");
const cssText = await cssResponse.text();

import "../components/details/buildingDetail.js";
import "../components/details/assetDetail.js";
import "../components/shop/shop.js";
import "../components/currencyDisplay/currencyDisplay.js";

import { handleAchievements } from "../utils/achievementHandler.js";
import { showAchievementsOverview } from "../utils/achievementOverview.js";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    ${cssText}
    :host { display: block; position: relative; }
    #detail-container { position: absolute; top: 0; left: -220px; width: 200px; z-index: 10; }
  </style>

  <div id="wrapper">
    <div id="detail-container" data-cy="detail-container" class="hidden"></div>
    <div id="inner-container">
      <shop-sidebar data-cy="shop-sidebar"></shop-sidebar>

      <div class="test" style="z-index: 1000;">
        <img id="inner-button" data-cy="inner-city-btn" src="Assets/images/toInner.png" alt="Ga naar binnenstad" />
        <div id="inner-text">Ga naar binnenstad</div>
      </div>
    </div>

    <div id="game-container" data-cy="game-container"></div>

    <div id="outer-container">
      <img id="outer-button" data-cy="outer-city-btn" src="Assets/images/toOuter.png" alt="Ga naar buitenstad" />
      <div id="outer-text">Ga naar buitenstad</div>
    </div>

    <button id="startButton" data-cy="start-game-btn" class="hidden">Start</button>
  </div>

  <currency-display id="stats" data-cy="currency-display" class="hidden"></currency-display>
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
    this._gameContainer = this._shadow.getElementById("game-container");

    this._onStartClickBound = this._onStartClick.bind(this);
    this._onOuterClickBound = this._transitionToOuterCity.bind(this);
    this._onInnerClickBound = this._transitionToCity.bind(this);
    this._onCloseDetailBound = this._handleCloseDetail.bind(this);
    this._onDestroyAssetBound = this._handleDestroyAsset.bind(this);
    this._onSaveCheckpointBound = this._onSaveCheckpoint.bind(this);
    this._onLoadCheckpointBound = this._onLoadCheckpoint.bind(this);

    this._onShowAchievementsBound = this._handleShowAchievements.bind(this);
    this._onMenuOpenedBound = this._handleMenuOpened.bind(this);
    this._onMenuClosedBound = this._handleMenuClosed.bind(this);

    this._onBuildingClickedBound = this._handleBuildingClicked.bind(this);
    this._onAssetClickedBound = this._handleAssetClicked.bind(this);
    this._onForceStatsUpdateBound = this._updateStatistics.bind(this);

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";

    this._currentDetail = { type: null, id: null };

    this.solar = 1;
    this.wind = 1;
    this.water = 1;

    this._onAssetDeleted = () => {
      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
      this._currentDetail = { type: null, id: null };
    };

    this._onSceneRefreshDetail = (e) => {
      const { type, id } = e.detail;
      showDetail(
        this._detailContainer,
        this._game.buildingData,
        this._game.assetData,
        type,
        id
      );
    };

    this._boundAssetPlacedHandler = () => this._updateStatistics();
    this._onAssetPlacedBound = this._boundAssetPlacedHandler;
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
    this._startButton.addEventListener("click", this._onStartClickBound);
    this._outerButton.addEventListener("click", this._onOuterClickBound);
    this._innerButton.addEventListener("click", this._onInnerClickBound);

    this._shadow.addEventListener("close-detail", this._onCloseDetailBound);
    this._shadow.addEventListener("destroy-asset", this._onDestroyAssetBound);

    this._statsContainer.addEventListener(
      "saveCheckpoint",
      this._onSaveCheckpointBound
    );
    this._statsContainer.addEventListener(
      "loadCheckpoint",
      this._onLoadCheckpointBound
    );

    this._gameContainer.addEventListener(
      "show-achievements",
      this._onShowAchievementsBound
    );
    this._gameContainer.addEventListener(
      "menu-opened",
      this._onMenuOpenedBound
    );
    this._gameContainer.addEventListener(
      "menu-closed",
      this._onMenuClosedBound
    );

    document.addEventListener("asset-placed", this._onAssetPlacedBound);
    document.addEventListener("asset-deleted", this._onAssetDeleted);
    document.addEventListener(
      "scene:refresh-detail",
      this._onSceneRefreshDetail
    );

    this._loadPhaser().then(() => this._initializeGame());

    if (JSON.parse(sessionStorage.getItem("bluetoothEnabled"))) {
      this._interval = setInterval(() => this._updateStatistics(), 5000);
    }
  }

  disconnectedCallback() {
    this._startButton.removeEventListener("click", this._onStartClickBound);
    this._outerButton.removeEventListener("click", this._onOuterClickBound);
    this._innerButton.removeEventListener("click", this._onInnerClickBound);

    this._shadow.removeEventListener("close-detail", this._onCloseDetailBound);
    this._shadow.removeEventListener(
      "destroy-asset",
      this._onDestroyAssetBound
    );

    this._statsContainer.removeEventListener(
      "saveCheckpoint",
      this._onSaveCheckpointBound
    );
    this._statsContainer.removeEventListener(
      "loadCheckpoint",
      this._onLoadCheckpointBound
    );

    this._gameContainer.removeEventListener(
      "show-achievements",
      this._onShowAchievementsBound
    );
    this._gameContainer.removeEventListener(
      "menu-opened",
      this._onMenuOpenedBound
    );
    this._gameContainer.removeEventListener(
      "menu-closed",
      this._onMenuClosedBound
    );

    document.removeEventListener("asset-placed", this._onAssetPlacedBound);
    document.removeEventListener("asset-deleted", this._onAssetDeleted);
    document.removeEventListener(
      "scene:refresh-detail",
      this._onSceneRefreshDetail
    );

    if (this._game) {
      this._game.events.off("buildingClicked", this._onBuildingClickedBound);
      this._game.events.off("assetClicked", this._onAssetClickedBound);
      this._game.events.off("forceStatsUpdate", this._onForceStatsUpdateBound);
      this._game.destroy(true);
      this._game = null;
    }

    // 4) Clear all intervals
    clearInterval(this._interval);
    clearInterval(this._energyInterval);
    clearInterval(this._statsInterval);
    clearInterval(this._taxesInterval);
    // 4) Null out references as a courtesy
    this._boundAssetPlacedHandler = null;
    this._onAssetDeleted = null;
    this._onSceneRefreshDetail = null;
    this._statsContainer = null;
    this._startButton = null;
    this._innerContainer = null;
    this._outerContainer = null;
    this._wrapper = null;
    this._detailContainer = null;
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
    window.gameContainer = this._gameContainer;

    this._game.events.on("buildingClicked", this._onBuildingClickedBound);
    this._game.events.on("assetClicked", this._onAssetClickedBound);
    this._game.events.on("forceStatsUpdate", this._onForceStatsUpdateBound);
  }

  async _updateStatistics() {
    try {
      const { token, groupId } = getAuthFromSession();
      const gs = await fetchGameStatistics(groupId, token);

      if (gs.gameBuildings && Array.isArray(gs.gameBuildings)) {
        this._game.buildingData = transformBuildingData(gs.gameBuildings);
      }
      this._game.token = token;
      this._game.groupId = groupId;
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;
      this._game.currency = gs.currency;

      const payload = buildCurrencyDisplayPayload({
        buildings: this._game.buildingData,
        assets: gs.assets,
        currency: gs.currency,
        componentMultipliers: {
          solar: this.solar,
          water: this.water,
          wind: this.wind,
        },
      });
      this._statsContainer.data = payload;

      // Emit event when statistics update is complete
      this._game.events.emit("statsUpdateComplete");
    } catch (e) {
      console.error("Error fetching stats:", e);
      // Still emit the event to prevent hanging
      this._game.events.emit("statsUpdateComplete");
    }
  }

  async _updateEnergy() {
    try {
      const { token, groupId } = getAuthFromSession();
      const gs = await fetchGameStatistics(groupId, token);

      if (gs.gameBuildings && Array.isArray(gs.gameBuildings)) {
        this._game.buildingData = transformBuildingData(gs.gameBuildings);
      }
      this._game.token = token;
      this._game.groupId = groupId;
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;

      const totalGreenCost =
        calculateTotalGreenCost(this._game.buildingData) / 60;

      const { id: currencyId, payload: currencyPayload } = buildUpdatedCurrency(
        gs.currency,
        totalGreenCost
      );

      if (currencyPayload.greenEnergy < 0) {
        currencyPayload.greenEnergy = 0;
      }

      await updateCurrency(currencyId, currencyPayload, token);

      await this._updateStatistics();

      //if greenEnergy is now zero, force all buildings off green, recolor, refresh detail ===
      if (this._game.currency.greenEnergy <= 0) {
        await toggleAllBuildingsRunsOnGreenFalse(
          this._game.gameStatisticsId,
          token
        );

        await this._updateStatistics();

        const cityScene = this._game.scene.getScene("CityScene");
        if (cityScene) {
          for (const b of this._game.buildingData) {
            setBuildingColor(cityScene, b);
          }
        }

        const actieveScenes = this._game.scene.getScenes(true);
        actieveScenes.forEach(function (scene) {
          if (typeof scene.showError === "function") {
            scene.showError(
              "Groene energie is op. Alle gebouwen gebruiken nu grijze energie."
            );
          }
        });
        // If the detail pane is currently showing a BUILDING, tear it down and re-render:
        const { type, id } = this._currentDetail;
        if (
          type === "building" &&
          id != null &&
          !this._detailContainer.classList.contains("hidden")
        ) {
          // Clear whatever was inside detail‐container, then call showDetail(...) again:
          this._detailContainer.innerHTML = "";
          showDetail(
            this._detailContainer,
            this._game.buildingData,
            this._game.assetData,
            "building",
            id
          );
        }
      }
    } catch (e) {
      console.error("Error updating energy:", e);
    }
  }

  async _onStartClick() {
    // 1) Hide the “Start” button
    const spinner = this._createSpinner();
    this._startButton.replaceWith(spinner);

    // 2) **First load your stats** so buildingData is populated
    await this._updateStatistics();

    this._game.scene.run("CityScene", {
      buildings: this._game.buildingData,
      gameStatisticsId: this._game.gameStatisticsId,
      token: this._game.token,
    });
    const cityScene = this._game.scene.getScene("CityScene");

    // 3) Promise for CityScene.create()
    const createPromise = new Promise((resolve) => {
      if (cityScene.sys.isCreated) {
        resolve();
      } else {
        cityScene.events.once("create", resolve);
      }
    });

    // 4) Promise for <currency-display> “data-ready”
    const dataReadyPromise = new Promise((resolve) => {
      const onDataReady = () => {
        this._statsContainer.removeEventListener("data-ready", onDataReady);
        resolve();
      };
      this._statsContainer.addEventListener("data-ready", onDataReady);
    });

    // 5) Kick off stats fetch (which will dispatch “data-ready” when done)
    const statsPromise = this._updateStatistics().catch((err) => {
      console.error("Failed to fetch stats:", err);
      // resolve anyway so we don’t hang
    });

    this._energyInterval = setInterval(() => this._updateEnergy(), 60_000);
    this._statsInterval = setInterval(() => this._updateStatistics(), 3_000);
    this._taxesInterval = setInterval(() => this._handleTaxes(), 300_000);

    // 6) Wait for both scene.create AND stats+render
    await Promise.all([createPromise, statsPromise, dataReadyPromise]);

    // 7) In one frame: stop the logo, show stats & city
    requestAnimationFrame(() => {
      // remove spinner
      const spinner = this._shadow.getElementById("startSpinner");
      if (spinner) spinner.remove();
      // show currency panel
      this._statsContainer.classList.remove("hidden");

      // stop/logo → city
      this._game.scene.stop("LogoScene");
      this._game.scene.bringToTop("CityScene");

      // show the “naar buitenstad” button
      this._outerContainer.style.display = "flex";
      this._innerContainer.style.display = "none";
    });
  }

  _createSpinner() {
    const spinner = document.createElement("div");
    spinner.id = "startSpinner";
    spinner.classList.add("spinner");
    return spinner;
  }

  _handleCloseDetail() {
    this._detailContainer.classList.add("hidden");
    this._detailContainer.innerHTML = "";
    this._currentDetail = { type: null, id: null };
  }

  _handleDestroyAsset(e) {
    const assetId = e.detail.assetId;
    document.dispatchEvent(
      new CustomEvent("scene:destroy-asset", {
        detail: { assetId },
      })
    );
  }

  _handleShowAchievements() {
    showAchievementsOverview(this._wrapper, this._shadow);
  }

  _handleMenuOpened() {
    // Hide navigation buttons + detail when menu opens
    this._innerContainer.style.display = "none";
    this._outerContainer.style.display = "none";
    this._detailContainer.style.display = "none";
  }

  _handleMenuClosed(e) {
    // Show correct nav button and detail when menu closes
    if (e.detail.targetScene === "CityScene") {
      this._outerContainer.style.display = "flex";
    } else {
      this._innerContainer.style.display = "flex";
    }
    this._detailContainer.style.display = "block";
  }

  _handleBuildingClicked(id) {
    this._currentDetail = { type: "building", id };
    this._detailContainer.innerHTML = "";
    showDetail(
      this._detailContainer,
      this._game.buildingData,
      this._game.assetData,
      "building",
      id
    );
  }

  _handleAssetClicked(id) {
    this._currentDetail = { type: "asset", id };
    this._detailContainer.innerHTML = "";
    showDetail(
      this._detailContainer,
      this._game.buildingData,
      this._game.assetData,
      "asset",
      id
    );
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

    this._game.scene.switch("OuterCityScene", "CityScene");

    this._innerContainer.style.display = "none";
    this._outerContainer.style.display = "flex";

    const distance = this._wrapper.offsetWidth + 800;
    this._animateWrapper(distance, () => {});
  }

  _animateWrapper(offsetX, onComplete) {
    animateWrapperAndStats(
      this._wrapper,
      this._statsContainer,
      offsetX,
      onComplete
    );
  }

  _onSaveCheckpoint() {
    for (const key of ["MenuScene", "CityScene", "OuterCityScene"]) {
      const scene = this._game?.scene?.getScene(key);
      if (!scene) continue; // skip if scene is not yet created

      if (
        scene.scene.isActive() &&
        typeof scene.showConfirmation === "function" &&
        typeof scene.showSavedConfirmation === "function"
      ) {
        scene.showConfirmation("Wil je je voortgang opslaan?", (confirmed) => {
          if (confirmed) {
            this._performSaveCheckpoint();
            scene.showSavedConfirmation(`Checkpoint opgeslagen!`);
          }
        });
        break;
      }
    }
  }

  async _performSaveCheckpoint() {
    const { token, groupId } = getAuthFromSession();

    const stats = await fetchGameStatistics(groupId, token);
    const gameStatisticsId = stats.id;

    await recordCheckpoint(gameStatisticsId, token);
    console.log("Currency saved successfully!");
  }

  _onLoadCheckpoint() {
    for (const key of ["CityScene", "OuterCityScene", "MenuScene"]) {
      const scene = this._game?.scene?.getScene(key);
      if (!scene) continue; // skip if scene is not yet created

      if (
        scene.scene.isActive() &&
        typeof scene.showConfirmation === "function" &&
        typeof scene.showSavedConfirmation === "function" &&
        typeof scene.showCheckpointList === "function"
      ) {
        scene.showCheckpointList(
          (selectedCheckpointId, selectedCheckpointName) => {
            scene.showConfirmation(
              `Wil je ${selectedCheckpointName} laden?`,
              (confirmed) => {
                if (confirmed) {
                  this._performLoadCheckpoint(selectedCheckpointId);
                  scene.showSavedConfirmation(
                    `Spel geladen van ${selectedCheckpointName}!`
                  );
                }
              }
            );
          }
        );
        break;
      }
    }
  }

  async _performLoadCheckpoint(selectedCheckpointId) {
    const { token, groupId } = getAuthFromSession();

    try {
      const gameStatistics = await refactorGameStatistics(
        selectedCheckpointId,
        token
      );

      const { gameStatisticsId, currencyId, assetData, buildingData } =
        unpackCheckpointPayload(gameStatistics);

      clearInterval(this._energyInterval);
      clearInterval(this._statsInterval);

      const cityScene = this._game.scene.getScene("CityScene");
      for (const b of gameStatistics.gameBuildings) {
        const buildingInCorrectFormat = {
          name: b.building.name,
          runsOnGreen: b.runsOnGreen,
        };
        setBuildingColor(cityScene, buildingInCorrectFormat);
      }

      const outer = this._game.scene.getScene("OuterCityScene");
      outer.clearAllAssets();
      outer.checkpointAssets = gameStatistics.assets;
      if (outer.map) {
        outer.reloadCheckpointAssets();
      } else {
        outer.events.once("create", () => {
          outer.reloadCheckpointAssets();
        });
      }

      this._updateStatistics();

      this._game.events.off("assetClicked");
      this._game.events.on("assetClicked", (id) =>
        showDetail(
          this._detailContainer,
          this._game.buildingData,
          this._game.assetData,
          "asset",
          id
        )
      );

      this._game.events.off("buildingClicked");
      this._game.events.on("buildingClicked", (id) =>
        showDetail(
          this._detailContainer,
          this._game.buildingData,
          this._game.assetData,
          "building",
          id
        )
      );
    } catch (err) {
      console.error("Error loading checkpoint:", err);
      const outer = this._game.scene.getScene("OuterCityScene");
      if (outer?.showError)
        outer.showError("Kon checkpoint niet laden: " + err.message);
    }
  }

  /**
   * Handles the collection of taxes in the game.
   *
   * @async
   * @function _handleTaxes
   * @memberOf GameControlPanel
   * @returns {Promise<void>} Resolves when the tax handling process is complete.
   */
  async _handleTaxes() {
    // Get the JWT token from the session
    const { token } = getAuthFromSession();
    const collectedTaxes = Math.floor(this._game.currency.score * 1.9);

    // Update the currency with the added tax revenue
    await updateCurrency(
      this._game.currency.id,
      {
        greenEnergy: this._game.currency.greenEnergy,
        greyEnergy: this._game.currency.greyEnergy,
        coins: this._game.currency.coins + collectedTaxes,
        score: this._game.currency.score,
      },
      token
    );

    // Show a popup on the active scene with the collected taxes
    for (const key of ["MenuScene", "CityScene", "OuterCityScene"]) {
      const scene = this._game.scene.getScene(key);
      if (!scene || !scene.scene) continue;

      if (scene.scene.isActive() && typeof scene.showError === "function") {
        scene.showError(
          `De stad verdiende ${collectedTaxes} coins van de belastingen!`
        );
        break;
      }
    }

    // Update the statistics after collecting taxes to rerender the currency display
    await this._updateStatistics();
  }
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
