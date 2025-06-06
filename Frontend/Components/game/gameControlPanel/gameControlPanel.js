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
    <div id="detail-container" class="hidden"></div>
    <div id="inner-container">
      <shop-sidebar></shop-sidebar>

      <div class="test" style="z-index: 1000;">
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
    this._gameContainer = this._shadow.getElementById("game-container");

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
      this._currentDetail = { type: null, id: null };
    });

    this._statsContainer.addEventListener("saveCheckpoint", () =>
      this._onSaveCheckpoint()
    );
    this._statsContainer.addEventListener("loadCheckpoint", () =>
      this._onLoadCheckpoint()
    );
    document.addEventListener("asset-placed", this._boundAssetPlacedHandler);

    this._gameContainer.addEventListener("show-achievements", () => {
      showAchievementsOverview(this._wrapper, this._shadow);
    });

    this._gameContainer.addEventListener("menu-opened", () => {
      // Hide navigation buttons and detail container when menu opens
      this._innerContainer.style.display = "none";
      this._outerContainer.style.display = "none";
      this._detailContainer.style.display = "none";
    });

    this._gameContainer.addEventListener("menu-closed", (e) => {
      // Show the appropriate navigation button based on current scene
      if (e.detail.targetScene === "CityScene") {
        this._outerContainer.style.display = "flex";
      } else {
        this._innerContainer.style.display = "flex";
      }
      this._detailContainer.style.display = "block";
    });

    this._loadPhaser().then(() => this._initializeGame());

    this._shadow.addEventListener("destroy-asset", (e) => {
      const assetId = e.detail.assetId;
      document.dispatchEvent(
        new CustomEvent("scene:destroy-asset", {
          detail: { assetId },
        })
      );
    });

    document.addEventListener("asset-deleted", this._onAssetDeleted);
    document.addEventListener(
      "scene:refresh-detail",
      this._onSceneRefreshDetail
    );

    // this._shadow.addEventListener("close-detail", () => {
    //   this._detailContainer.classList.add("hidden");
    //   this._detailContainer.innerHTML = "";
    //   this._currentDetail = { type: null, id: null };
    // });

    const bluetooth = JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
    if (bluetooth) {
      this._interval = setInterval(() => {
        this._updateStatistics();
      }, 5000);
    }
  }

  disconnectedCallback() {
    // 1) Destroy Phaser
    if (this._game && typeof this._game.destroy === "function") {
      this._game.destroy(true);
      this._game = null;
    }

    // 2) Clear all intervals
    clearInterval(this._interval);
    clearInterval(this._energyInterval);
    clearInterval(this._statsInterval);

    // 3) Remove document‐level listeners
    document.removeEventListener("asset-placed", this._boundAssetPlacedHandler);
    document.removeEventListener("asset-deleted", this._onAssetDeleted);
    document.removeEventListener(
      "scene:refresh-detail",
      this._onSceneRefreshDetail
    );

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

    this._game.events.on("buildingClicked", (id) => {
      this._currentDetail = { type: "building", id };
      this._detailContainer.innerHTML = "";
      showDetail(
        this._detailContainer,
        this._game.buildingData,
        this._game.assetData,
        "building",
        id
      );
    });

    this._game.events.on("assetClicked", (id) => {
      this._currentDetail = { type: "asset", id };
      this._detailContainer.innerHTML = "";
      showDetail(
        this._detailContainer,
        this._game.buildingData,
        this._game.assetData,
        "asset",
        id
      );
    });

    this._game.events.on("forceStatsUpdate", () => {
      this._updateStatistics();
    });
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
    // 1) Hide the “Start” button immediately (LogoScene still visible).
    this._startButton.classList.add("hidden");

    // 2) Start CityScene “in the background” (LogoScene stays on top).
    this._game.scene.run("CityScene");

    // 3) Wait for CityScene’s create() to finish.
    const cityScene = this._game.scene.getScene("CityScene");
    await new Promise((resolve) => {
      if (cityScene.sys.isCreated) {
        resolve();
      } else {
        cityScene.events.once("create", () => resolve());
      }
    });

    // ───────────────────────────────────────────────────────────────────────
    // 4) BEFORE fetching stats, set up a one‐time listener for “data-ready”:
    //    This promise will resolve as soon as <currency-display> finishes rendering.
    const dataReadyPromise = new Promise((resolve) => {
      const onDataReady = () => {
        this._statsContainer.removeEventListener("data-ready", onDataReady);
        resolve();
      };
      this._statsContainer.addEventListener("data-ready", onDataReady);
    });
    // ───────────────────────────────────────────────────────────────────────

    // 5) Fetch stats and recolor buildings—but leave <currency-display> hidden.
    //    As soon as _updateStatistics() sets `this._statsContainer.data = payload`,
    //    the <currency-display> setter will dispatch “data-ready” that we’re now listening for.
    try {
      await this._updateStatistics();
      if (typeof setBuildingColor === "function") {
        for (const b of this._game.buildingData) {
          setBuildingColor(cityScene, b);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Even on error, we still allow the flow to continue so the user isn’t stuck on Logo.
    }

    // 6) Wait here until <currency-display> has truly rendered:
    await dataReadyPromise;

    // ───────────────────────────────────────────────────────────────────────
    // 7) ONLY NOW: un‐hide the currency display, stop LogoScene, and bring CityScene to front.
    this._statsContainer.classList.remove("hidden");
    this._game.scene.stop("LogoScene");
    this._game.scene.bringToTop("CityScene");
    // ───────────────────────────────────────────────────────────────────────

    // 8) Show the “naar buitenstad” button (everything is fully painted).
    this._outerContainer.style.display = "flex";
    this._innerContainer.style.display = "none";

    // 9) Restart your periodic energy/stat updates as before.
    this._energyInterval = setInterval(() => this._updateEnergy(), 60_000);
    this._statsInterval = setInterval(() => this._updateStatistics(), 3_000);
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
    animateWrapperAndStats(
      this._wrapper,
      this._statsContainer,
      offsetX,
      onComplete
    );
  }

  _onSaveCheckpoint() {
    for (const key of ["MenuScene", "CityScene", "OuterCityScene"]) {
      const scene = this._game.scene.getScene(key);

      // Check if scene is running and the required methods exist
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
      const scene = this._game.scene.getScene(key);

      // Check if scene is running and the required methods exist
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
      outer.reloadCheckpointAssets();

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

      // Check if scene is running and has the showError method
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
