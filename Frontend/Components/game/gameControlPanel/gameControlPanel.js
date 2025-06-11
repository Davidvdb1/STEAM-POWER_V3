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
  calculateTotalGreyProduction,
  calculateTotalGreyCost,
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

import { showAchievementsOverview } from "../utils/achievementOverview.js";
import { showGameInstructionsOverlay } from "../utils/gameInstructionsOverlay.js";

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

/**
 * Web Component for the game control panel, managing game state,
 * statistics, and transitions between city scenes.
 */
class GameControlPanel extends HTMLElement {
  static ENERGY_INTERVAL = 60_000;
  static TAX_INTERVAL = 300_000;

  /**
   * Initializes the game control panel, sets up shadow DOM,
   * and binds event handlers.
   */
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
    this._onShowGameInstructionsBound = this._handleShowGameInstructions.bind(this);
    this._onMenuOpenedBound = this._handleMenuOpened.bind(this);
    this._onMenuClosedBound = this._handleMenuClosed.bind(this);

    this._onBuildingClickedBound = this._handleBuildingClicked.bind(this);
    this._onAssetClickedBound = this._handleAssetClicked.bind(this);
    this._onForceStatsUpdateBound = this._updateStatistics.bind(this);

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";

    this._currentDetail = { type: null, id: null };

    this._lastMessageShown = null;

    this.solar = 1;
    this.wind = 1;
    this.water = 1;
    this._hasInitializedMessages = false; 

    this._lastEnergyTick = Date.now();
    this._lastTaxTick = Date.now();

    this._greyShortageTimeout = null;

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

  /**
   * Loads the Phaser library asynchronously.
   * @returns {Promise<void>} Resolves when Phaser is loaded.
   */
  _loadPhaser() {
    return new Promise((res) => {
      if (window.Phaser) return res();
      const s = document.createElement("script");
      s.id = "phaser-script";
      s.src = "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js";
      s.onload = () => res();
      this._shadow.appendChild(s);
    });
  }

  /**
   * Called when the element is added to the DOM.
   * Sets up event listeners and initializes the game.
   * @returns {void}
   */
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
      "show-game-instructions",
      this._onShowGameInstructionsBound
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

  /**
   * Called when the element is removed from the DOM.
   * Cleans up event listeners and destroys the Phaser game instance.
   * @returns {void}
   * */
  disconnectedCallback() {
    // 1) Remove all event listeners
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
      "show-game-instructions", 
      this._onShowGameInstructionsBound
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

    // 2) Remove the game container from the DOM
    if (this._game) {
      this._game.events.off("buildingClicked", this._onBuildingClickedBound);
      this._game.events.off("assetClicked", this._onAssetClickedBound);
      this._game.events.off("forceStatsUpdate", this._onForceStatsUpdateBound);
      this._game.destroy(true);
      this._game = null;
    }

    // 3) Clear all intervals
    clearInterval(this._interval);
    clearInterval(this._statsInterval);
    clearInterval(this._energyInterval);
    clearInterval(this._taxesInterval);
    clearInterval(this._countdownPulse);

    // 4) Remove the spinner if it exists
    this._shadow.getElementById("startSpinner")?.remove();

    // 5) Remove the game container from the shadow DOM
    delete window.phaserGame;
    delete window.gameContainer;

    // Remove the Phaser script from the shadow DOM
    this._shadow.getElementById("phaser-script")?.remove();

    // 6) Null out references as a courtesy
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

  /**
   * Initializes the Phaser game instance with scenes and event listeners.
   * @returns {void}
   */
  _initializeGame() {
    // If we already have a running game, destroy it first
    if (window.phaserGame) {
      window.phaserGame.destroy(true);
      delete window.phaserGame;
    }
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

  /**
   * Updates the game statistics and currency display.
   * Fetches the latest game statistics, transforms building data,
   * and updates the currency display payload.
   * Emits an event when the statistics update is complete.
   * @returns {Promise<void>}
   * */
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
    this._game.multipliers = gs.multiplier;

    const newMessage = gs.multiplier?.message;

    // Alleen tonen als:
    // - de game al eerder geïnit is (dus niet bij opstart)
    // - de message effectief nieuw is
    if (this._hasInitializedMessages && newMessage && newMessage !== this._lastMessageShown) {
      // voorkom tonen van allereerste boodschap
      if (this._lastMessageShown !== null) {
        for (const key of ["MenuScene", "CityScene", "OuterCityScene"]) {
          const scene = this._game.scene.getScene(key);
          if (scene?.scene?.isActive() && typeof scene.showError === "function") {
            scene.showError(newMessage);
            break;
          }
        }
      }

    // in alle gevallen updaten voor vergelijking met volgende messages
    this._lastMessageShown = newMessage;
  }

    // Eens dit doorlopen is, zetten we de flag actief
    this._hasInitializedMessages = true;

    const payload = buildCurrencyDisplayPayload({
      buildings: this._game.buildingData,
      assets: gs.assets,
      currency: gs.currency,
      componentMultipliers: {
        solar: this._game.multipliers.solar,
        water: this._game.multipliers.water,
        wind: this._game.multipliers.wind,
      },
    });
    this._statsContainer.data = payload;

    this._game.events.emit("statsUpdateComplete");
  } catch (e) {
    console.error("Error fetching stats:", e);
    this._game.events.emit("statsUpdateComplete");
  }
}


  async getEventMessage() {
  
  }

  /**
   * Updates the energy levels in the game.
   * Fetches the latest game statistics, calculates the total green cost,
   * updates the currency, and toggles buildings off green if necessary.
   * Handles errors gracefully and updates the UI accordingly.
   * @returns {Promise<void>}
   * */
  async _updateEnergy() {
    try {
      const { token, groupId } = getAuthFromSession();
      const gs = await fetchGameStatistics(groupId, token);

      // 1) Load & transform
      if (gs.gameBuildings && Array.isArray(gs.gameBuildings)) {
        this._game.buildingData = transformBuildingData(gs.gameBuildings);
      }
      this._game.token = token;
      this._game.groupId = groupId;
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;

      // 2) Compute per-tick green cost & current bank
      const totalGreenCost =
        calculateTotalGreenCost(this._game.buildingData) / 60;
      const greenBank = gs.currency.greenEnergy;

      // 3) Update green balance on backend
      const { id: currencyId, payload: currencyPayload, fine: fine } = buildUpdatedCurrency(
        gs.currency,
        totalGreenCost,
        gs.assets,
        this._game.buildingData
      );
      if (currencyPayload.greenEnergy < 0) {
        currencyPayload.greenEnergy = 0;
      }
      await updateCurrency(currencyId, currencyPayload, token);
      await this._updateStatistics();

      // 4) Determine green-shortage
      const isGreenShort = totalGreenCost > greenBank;

      // Ensure we clear grey-shortage flags if neither shortage persists
      const totalGreyCost =
        calculateTotalGreyCost(this._game.buildingData) / 60;
      const totalGreyProduction = calculateTotalGreyProduction(gs.assets) / 60;
      const isGreyShortGlobal = totalGreyCost > totalGreyProduction;
      const greyShortMessage = `Te weinig stroomvoorziening: de belastingen worden gehalveerd en het stroomtekort wordt elke minuut betaald met ${fine} coins.`

      if (
        !isGreenShort &&
        !isGreyShortGlobal &&
        this._greyShortageAlertActive
      ) {
        // fully OK now → reset flags
        this._greyShortageAlertActive = false;
        this._greyShortageDelayScheduled = false;
      }

      const activeScenes = this._game.scene
        .getScenes(true)
        .filter((s) => typeof s.showError === "function");

      // 5) Handle green-shortage first
      if (isGreenShort) {
        // a) Force off green
        await toggleAllBuildingsRunsOnGreenFalse(
          this._game.gameStatisticsId,
          token
        );
        await this._updateStatistics();

        // b) Recolor
        const cityScene = this._game.scene.getScene("CityScene");
        if (cityScene) {
          for (const b of this._game.buildingData) {
            setBuildingColor(cityScene, b);
          }
        }

        // c) Recompute grey-shortage on updated buildings
        const greyCostAfter =
          calculateTotalGreyCost(this._game.buildingData) / 60;
        const greyProduction = calculateTotalGreyProduction(gs.assets) / 60;
        const isGreyShort = greyCostAfter > greyProduction;

        if (isGreyShort) {
          // **dual-shortage**: green + grey
          if (
            !this._greyShortageAlertActive &&
            !this._greyShortageDelayScheduled
          ) {
            // first time: show green, then schedule grey after 4s
            activeScenes.forEach((s) =>
              s.showError(
                "Groene energie is op. Alle gebouwen gebruiken nu grijze energie."
              )
            );
            setTimeout(() => {
              activeScenes.forEach((s) =>
                s.showError(greyShortMessage)
              );
            }, 4000);
            this._greyShortageAlertActive = true;
            this._greyShortageDelayScheduled = true;
          } else {
            // subsequent calls: show grey shortage immediately
            activeScenes.forEach((s) =>
              s.showError(greyShortMessage)
            );
          }
        } else {
          // **only green-shortage**
          activeScenes.forEach((s) =>
            s.showError(
              "Groene energie is op. Alle gebouwen gebruiken nu grijze energie."
            )
          );
          // reset any grey flags
          this._greyShortageAlertActive = false;
          this._greyShortageDelayScheduled = false;
        }
      } else if (isGreyShortGlobal) {
        this._greyShortageDelayScheduled = false;
        // 6) pure grey-shortage (green OK)
        if (!this._greyShortageAlertActive) {
          activeScenes.forEach((s) =>
            s.showError(greyShortMessage)
          );
          this._greyShortageAlertActive = true;
          this._greyShortageDelayScheduled = false;
        } else {
          // repeat on subsequent ticks
          activeScenes.forEach((s) =>
            s.showError(greyShortMessage)
          );
        }
      }

      // 7) Refresh detail pane if open on a building
      const { type, id } = this._currentDetail;
      if (
        type === "building" &&
        id != null &&
        !this._detailContainer.classList.contains("hidden")
      ) {
        this._detailContainer.innerHTML = "";
        showDetail(
          this._detailContainer,
          this._game.buildingData,
          this._game.assetData,
          "building",
          id
        );
      }
    } catch (e) {
      console.error("Error updating energy:", e);
    }
  }

  /**
   * Formats milliseconds into a string representation of minutes and seconds.
   * @param {number} ms - The time in milliseconds to format.
   * @return {string} A string in the format "m:ss".
   */
  _formatMs(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /**
   * Handles the click event on the "Start" button.
   * Hides the button, fetches game statistics, and transitions to the CityScene.
   * Sets up promises to ensure the scene and statistics are ready before proceeding.
   * @returns {Promise<void>}
   */
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

    this._statsInterval = setInterval(() => this._updateStatistics(), 3_000);

    // Single master timer for energy & taxes
    this._intervalStart = Date.now();
    this._lastEnergyTick = this._intervalStart;
    this._lastTaxTick = this._intervalStart;
    const EI = this.constructor.ENERGY_INTERVAL;
    const TI = this.constructor.TAX_INTERVAL;
    let tickCount = 0;
    const TAX_RATIO = TI / EI;

    const masterInterval = setInterval(async () => {
      // energy update first
      await this._updateEnergy();
      this._lastEnergyTick = Date.now();

      // then taxes every 5th tick
      if (++tickCount % TAX_RATIO === 0) {
        await this._handleTaxes();
        this._lastTaxTick = Date.now();
      }
    }, EI);

    this._energyInterval = masterInterval;
    this._taxesInterval = masterInterval;

    // countdown based on fixed anchor, so no drift on reset
    this._countdownPulse = setInterval(() => {
      const now = Date.now();
      const since = now - this._intervalStart;

      const energyRem = EI - (since % EI);
      const taxRem = TI - (since % TI);

      const cdRoot = this._statsContainer.shadowRoot;
      cdRoot.getElementById("greenTimer").textContent =
        this._formatMs(energyRem);
      cdRoot.getElementById("taxTimer").textContent = this._formatMs(taxRem);
    }, 1_000);

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

  /**
   * Creates a spinner element to indicate loading state.
   * @returns {HTMLDivElement} The spinner element.
   * */
  _createSpinner() {
    const spinner = document.createElement("div");
    spinner.id = "startSpinner";
    spinner.classList.add("spinner");
    return spinner;
  }

  /**
   * Handles the click event to close the detail container.
   * Clears the detail container and resets the current detail state.
   * @returns {void}
   * */
  _handleCloseDetail() {
    this._detailContainer.classList.add("hidden");
    this._detailContainer.innerHTML = "";
    this._currentDetail = { type: null, id: null };
  }

  /**
   * Handles the event to destroy an asset.
   * Dispatches a custom event with the asset ID to be destroyed.
   * @param {CustomEvent} e - The event containing the asset ID.
   * @returns {void}
   * */
  _handleDestroyAsset(e) {
    const assetId = e.detail.assetId;
    document.dispatchEvent(
      new CustomEvent("scene:destroy-asset", {
        detail: { assetId },
      })
    );
  }

  /**
   * Handles the event to show achievements overview.
   * Calls the utility function to display achievements overview
   * in the game control panel.
   * 
   * @function _handleShowAchievements
   * @memberOf GameControlPanel
   * @returns {void}
   * */
  _handleShowAchievements() {
    showAchievementsOverview(this._wrapper, this._shadow);
  }

  /**
   * Handles the event to show game instructions.
   * Calls the utility function to display game instructions
   * in the game control panel.
   * 
   * @function _handleShowGameInstructions
   * @memberOf GameControlPanel
   * @returns {void}
   */
  _handleShowGameInstructions() {
    showGameInstructionsOverlay(this._wrapper, this._shadow);
  }

  /**
   * Handles the event when the menu is opened.
   * Hides the inner and outer containers,
   * and the detail container to prevent interaction with the game.
   * 
   * @function _handleMenuOpened
   * @memberOf GameControlPanel
   * @returns {void}
   */
  _handleMenuOpened() {
    // Hide navigation buttons + detail when menu opens
    this._innerContainer.style.display = "none";
    this._outerContainer.style.display = "none";
    this._detailContainer.style.display = "none";
  }

  /**
   * Handles the event when the menu is closed.
   * Shows the correct navigation button and detail container
   * based on the target scene.
   * 
   * @function _handleMenuClosed
   * @memberOf GameControlPanel
   * @param {CustomEvent} e - The event containing the target scene.
   * @returns {void} 
   */
  _handleMenuClosed(e) {
    // Show correct nav button and detail when menu closes
    if (e.detail.targetScene === "CityScene") {
      this._outerContainer.style.display = "flex";
    } else {
      this._innerContainer.style.display = "flex";
    }
    this._detailContainer.style.display = "block";
  }

  /**
   * Handles the click event when a building is clicked.
   * Updates the current detail to show the building detail,
   * clears the detail container, and shows the building detail.
   * @param {number} id - The ID of the clicked building.
   * @returns {void}
   */
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

  /**
   * Handles the click event on an asset.
   * Sets the current detail to the asset type and ID,
   * clears the detail container,
   * and shows the asset detail.
   * @param {number} id - The ID of the clicked asset.
   * @returns {void}
   * */
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

  /**
   * Handles the click event to transition to the outer city scene.
   * Hides the detail container, animates the wrapper, and switches to the OuterCityScene.
   * @param {Event} e - The click event.
   * @returns {void}
   * */
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

  /**
   * Handles the click event to transition to the inner city scene.
   * Hides the detail container, animates the wrapper, and switches to the CityScene.
   * @param {Event} e - The click event.
   * @returns {void}
   * */
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

  /**
   * Animates the wrapper and statistics container to a new position.
   * Uses the `animateWrapperAndStats` utility function to perform the animation.
   * @param {number} offsetX - The horizontal offset to animate to.
   * @param {Function} onComplete - Callback function to execute when the animation is complete.
   * @returns {void}
   * */
  _animateWrapper(offsetX, onComplete) {
    animateWrapperAndStats(
      this._wrapper,
      this._statsContainer,
      offsetX,
      onComplete
    );
  }

  /**
   * Handles the saving of a checkpoint in the game.
   * Prompts the user for confirmation, performs the save operation,
   * and shows a confirmation message.
   * @returns {void}
   * */
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

  /**
   * Performs the actual saving of the checkpoint.
   * Fetches the game statistics, records the checkpoint,
   * and logs a success message.
   * @returns {Promise<void>} Resolves when the checkpoint is saved.
   * */
  async _performSaveCheckpoint() {
    const { token, groupId } = getAuthFromSession();

    const stats = await fetchGameStatistics(groupId, token);
    const gameStatisticsId = stats.id;

    await recordCheckpoint(gameStatisticsId, token);
    console.log("Currency saved successfully!");
  }

  /**
   * Handles the loading of a checkpoint in the game.
   * Prompts the user to select a checkpoint,
   * confirms the selection, and performs the load operation.
   * @returns {void}
   * */
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
                  this._detailContainer.classList.add("hidden");
                  this._detailContainer.innerHTML = "";

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

  /**
   * Performs the actual loading of a checkpoint.
   * Fetches the game statistics for the selected checkpoint,
   * updates the game state, and sets up the game scenes accordingly.
   * Handles errors gracefully and updates the UI.
   * @param {number} selectedCheckpointId - The ID of the checkpoint to load.
   * @returns {Promise<void>} Resolves when the checkpoint is loaded.
   * */
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
   * @returns {Promise<void>} Resolves when the tax handling process is complete.
   */
  async _handleTaxes() {
    const { token } = getAuthFromSession();

    // compute grey‐energy production/usage
    const greyEnergyProduction = calculateTotalGreyProduction(
      this._game.assetData
    );
    const greyEnergyUse = calculateTotalGreyCost(this._game.buildingData);

    // 1 coin per score point, plus base 10
    let collectedTaxes =
      this._game.currency.score <= 0 ? 10 : 10 + this._game.currency.score;

    // if grey‐energy is insufficient, halve the taxes
    const isGreyShort = greyEnergyProduction < greyEnergyUse;
    if (isGreyShort) {
      collectedTaxes = Math.floor(collectedTaxes / 2);
    }

    // Update the currency
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

    // Show a popup on the active scene
    const showTaxMessage = () => {
      for (const key of ["MenuScene", "CityScene", "OuterCityScene"]) {
        const scene = this._game.scene.getScene(key);
        if (scene?.scene?.isActive() && typeof scene.showError === "function") {
          scene.showError(
            `De stad verdiende ${collectedTaxes} coins van de belastingen!`
          );
          break;
        }
      }
    };

    if (isGreyShort) {
      // delay the popup by 4 seconds when grey is short
      setTimeout(showTaxMessage, 4000);
    } else {
      // show immediately otherwise
      showTaxMessage();
    }

    // Refresh stats so the display updates
    await this._updateStatistics();
  }
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
