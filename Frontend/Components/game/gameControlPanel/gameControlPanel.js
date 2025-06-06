// src/components/game/GameControlPanel.js

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

    document.addEventListener("asset-deleted", () => {
      this._detailContainer.classList.add("hidden");
      this._detailContainer.innerHTML = "";
    });

    document.addEventListener(
      "scene:refresh-detail",
      (e) => {
        const { type, id } = e.detail;
        showDetail(
          this._detailContainer,
          this._game.buildingData,
          this._game.assetData,
          type,
          id
        );
      },
      false
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
    document.removeEventListener("asset-placed", this._boundAssetPlacedHandler);
    clearInterval(this._interval);
    clearInterval(this._energyInterval);
    clearInterval(this._statsInterval);
  }

  _initializeGame() {
    const LogoScene = createLogoScene(this._startButton);
    const CityScene = createCityScene();
    const OuterCityScene = createOuterCityScene();
    const MenuScene = createMenuScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this._shadow.getElementById("game-container"),
      width: 140 * 16,
      height: 70 * 16,
      scene: [LogoScene, CityScene, OuterCityScene, MenuScene],
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
      this._statsContainer.classList.remove("hidden");

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
    this._startButton.classList.add("hidden");
    this._game.scene.start("CityScene");
    this._outerContainer.style.display = "flex";
    this._innerContainer.style.display = "none";

    const cityScene = this._game.scene.getScene("CityScene");
    await new Promise((resolve) => {
      cityScene.events.once("create", resolve);
    });

    try {
      await this._updateStatistics();

      if (setBuildingColor) {
        for (const b of this._game.buildingData) {
          setBuildingColor(cityScene, b);
        }
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }

    this._energyInterval = setInterval(() => this._updateEnergy(), 60_000);
    this._statsInterval = setInterval(() => this._updateStatistics(), 3_000);

    this._game.scene.remove("LogoScene");
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
    const activeScene = this._game.scene.getScene("CityScene").scene.isActive()
      ? this._game.scene.getScene("CityScene")
      : this._game.scene.getScene("OuterCityScene");

    activeScene.showConfirmation(
      "Wil je je voortgang opslaan?",
      (confirmed) => {
        if (confirmed) {
          this._performSaveCheckpoint();
          activeScene.showSavedConfirmation(`Checkpoint opgeslagen!`);
        }
      }
    );
  }

  async _performSaveCheckpoint() {
    const { token, groupId } = getAuthFromSession();

    const stats = await fetchGameStatistics(groupId, token);
    const gameStatisticsId = stats.id;

    await recordCheckpoint(gameStatisticsId, token);
    console.log("Currency saved successfully!");
  }

  _onLoadCheckpoint() {
    const active = this._game.scene.isActive("CityScene")
      ? this._game.scene.getScene("CityScene")
      : this._game.scene.getScene("OuterCityScene");

    active.showCheckpointList(
      (selectedCheckpointId, selectedCheckpointName) => {
        active.showConfirmation(
          `Wil je ${selectedCheckpointName} laden?`,
          (confirmed) => {
            if (confirmed) {
              this._performLoadCheckpoint(selectedCheckpointId);
              active.showSavedConfirmation(
                `Spel geladen van ${selectedCheckpointName}!`
              );
            }
          }
        );
      }
    );
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
}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
