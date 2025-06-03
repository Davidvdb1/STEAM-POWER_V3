// src/components/game/GameControlPanel.js

import { createLogoScene } from "../components/scenes/logoScene.js";
import { createCityScene } from "../components/scenes/cityScene.js";
import { createOuterCityScene } from "../components/scenes/outerCityScene.js";
import {
  fetchGameStatistics,
  removeAsset,
  getCurrencyById,
  updateCurrency,
  upgradeBuilding,
  toggleGameBuildingRunsOnGreen,
  recordCheckpoint,
  refactorGameStatistics,
} from "../service/gameService.js";

const cssResponse = await fetch("./Components/game/gameControlPanel/style.css");
const cssText = await cssResponse.text();

// register our detail-panel components
import "../components/details/buildingDetail.js";
import "../components/details/assetDetail.js";
import "../components/shop/shop.js";
import "../components/currencyDisplay/currencyDisplay.js";
import { handleAchievements } from "../utils/achievementHandler.js";
import { createCheckpointLoadPopup } from "../utils/checkpointLoadPopup.js";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    ${cssText}
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
    this._gameContainer = this._shadow.getElementById("game-container");

    this._greyEl = this._statsContainer.greyEl;
    this._greenEl = this._statsContainer.greenEl;
    this._coinsEl = this._statsContainer.coinsEl;
    this._scoreEl = this._statsContainer.scoreEl;

    this._outerContainer.style.display = "none";
    this._innerContainer.style.display = "none";

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
    });

    this._shadow.addEventListener("destroy-asset", (e) => {
      this._confirmDestroyAsset(e.detail.assetId);
    });

    this._shadow.addEventListener("upgrade-build", (e) => {
      this._confirmUpgradeBuilding(e.detail.GameBuildingId);
    });
    this._shadow.addEventListener("toggle-building-energy", (e) => {
      this._confirmToggleBuildingEnergy(e.detail.GameBuildingId);
    });
    this._statsContainer.addEventListener("saveCheckpoint", () =>
      this._onSaveCheckpoint()
    );
    this._statsContainer.addEventListener("loadCheckpoint", () =>
      this._onLoadCheckpoint()
    );
    document.addEventListener('asset-placed', this._boundAssetPlacedHandler);

    this._loadPhaser().then(() => this._initializeGame());

    const bluetooth = JSON.parse(sessionStorage.getItem("bluetoothEnabled"));
    if (bluetooth) {
      this._interval = setInterval(() => {
        this._updateCurrency();
      }, 5000);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('asset-placed', this._boundAssetPlacedHandler);
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

      const totalGreyCost = this._game.buildingData
        .filter((b) => b.runsOnGreen === false)
        .reduce((sum, b) => {
          return sum + (b.level.energyCost || 0);
        }, 0);

      const totalGreyProduction = gs.assets
        .filter((a) => a.type === "Kerncentrale")
        .reduce((sum, a) => {
          return sum + (a.energy || 0);
        }, 0);

      this._greyEl.textContent = `${totalGreyCost} / ${totalGreyProduction}`;
      const cur = gs.currency;
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._coinsEl.textContent = cur.coins;
      this._scoreEl.textContent = cur.score;
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
      level: gb.buildingLevel,
      runsOnGreen: gb.runsOnGreen, // Directly use buildingLevel as level
    }));
  }

  async _updateEnergy() {
    try {
      const user = sessionStorage.getItem("loggedInUser");
      if (!user) throw new Error("Not logged in");
      const { token, groupId } = JSON.parse(user);

      // 1) Fetch game statistics
      const gs = await fetchGameStatistics(groupId, token);

      // 2) Transform building data
      if (gs.gameBuildings && Array.isArray(gs.gameBuildings)) {
        this._game.buildingData = this._transformBuildingData(gs.gameBuildings);
      }
      this._game.token = token;
      this._game.groupId = groupId;
      this._game.assetData = gs.assets;
      this._game.gameStatisticsId = gs.id;
      this._game.currencyId = gs.currency.id;

      // 3) Compute total grey-cost from buildings on grey
      const totalGreyCost = this._game.buildingData
        .filter((b) => b.runsOnGreen === false)
        .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);

      // 4) Compute total grey-production from “Kerncentrale” assets
      const totalGreyProduction = gs.assets
        .filter((a) => a.type === "Kerncentrale")
        .reduce((sum, a) => sum + (a.energy || 0), 0);

      // 5) (optional) Compute extra from assets and push minimal changes to server
      const counts = gs.assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {});
      const extra = { greenEnergy: 0, greyEnergy: 0 };
      if (counts["Windmolen"]) extra.greenEnergy += counts["Windmolen"] * 50;
      if (counts["Waterrad"]) extra.greenEnergy += counts["Waterrad"] * 50;
      if (counts["Zonnepaneel"])
        extra.greenEnergy += counts["Zonnepaneel"] * 50;

      const totalGreenCost = this._game.buildingData
        .filter((b) => b.runsOnGreen === true)
        .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);

      const cur = gs.currency;
      const updated = {
        greenEnergy: cur.greenEnergy + extra.greenEnergy - totalGreenCost,
        greyEnergy: cur.greyEnergy + extra.greyEnergy, // remains unchanged if extra.greyEnergy = 0
        coins: cur.coins,
        score: cur.score,
      };
      await updateCurrency(cur.id, updated, token);

      // 6) Overwrite the “grey” display with “<building-cost> / <asset-prod>”
      this._greyEl.textContent = `${totalGreyCost} / ${totalGreyProduction}`;

      // 7) Make sure green always shows three decimals:
      this._greenEl.textContent = updated.greenEnergy.toFixed(3);
      this._coinsEl.textContent = updated.coins;
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

    await this._updateStatistics();


    if (cityScene.setBuildingColor) {
      for (const b of this._game.buildingData) {
        cityScene.setBuildingColor(b);
      }

      const cur = gs.currency;
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._greyEl.textContent = `${totalGreyCost} / ${totalGreyProduction}`;
      this._coinsEl.textContent = cur.coins;
      this._scoreEl.textContent = cur.score;
      this._statsContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Error fetching stats:", e);

    }

    this._energyInterval = setInterval(() => this._updateEnergy(), 60_000);
    this._statsInterval = setInterval(() => this._updateStatistics(), 3_000);
  }

  async _updateCurrency() {
    try {
      const cur = await gameService.getCurrencyById(
        this._game.currencyId,
        this._game.token
      );
      this._greenEl.textContent = Number(cur.greenEnergy).toFixed(3);
      this._greyEl.textContent = `${totalGreyCost} / ${totalGreyProduction}`;
      this._coinsEl.textContent = cur.coins;
      this._scoreEl.textContent = cur.score;
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

      // Remove on backend
      const response = await removeAsset(assetId, token);

      // Handle any achievements earned by destroying this asset
      handleAchievements(response, this._gameContainer);

      // Fetch the latest currency values
      const cur = await getCurrencyById(currencyId, token);

      // Subtract only if this is a Kerncentrale
      const greyDelta = asset.type === "Kerncentrale" ? asset.energy : 0;

      const updated = {
        greenEnergy: cur.greenEnergy,
        greyEnergy: cur.greyEnergy - greyDelta,
        coins: cur.coins - asset.destroyCost,
        score: cur.score,
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

  _confirmToggleBuildingEnergy(GameBuildingId) {
    const building = this._game.buildingData.find(
      (b) => b.id === GameBuildingId
    );
    if (!building) return;

    // const currentRunsOnGreen = building.runsOnGreen;

    const scene = this._game.scene.getScene("CityScene");
    this._performToggleBuildingEnergy(GameBuildingId);
  }

  /**
   * Upgrades a GameBuilding to the next level by calling the backend API, updates local building data,
   * refreshes game statistics, and updates the building detail panel in the UI.
   *
   * @async
   * @param {string} GameBuildingId - The id of the building to upgrade.
   * @throws {Error} Throws an error if the building is not found or if the upgrade process fails.
   */
  async _performUpgradeBuilding(GameBuildingId) {
    try {
      const building = this._game.buildingData.find(
        (b) => b.id === GameBuildingId
      );
      if (!building) throw new Error("Building not found");

      // Call the backend to upgrade the building to the next level
      const response = await upgradeBuilding(
        GameBuildingId,
        { nextLevel: building.level.level + 1 },
        this._game.token
      );

      // Update the local building data to avoid data inconsistency
      Object.assign(building, response.gameBuilding);

      // Update the building color in the game data
      const cityScene = this._game.scene.getScene("CityScene");
      if (cityScene && cityScene.setBuildingColor) {
        // Pass the updated object (with runsOnGreen) into the helper
        cityScene.setBuildingColor(building);
      }

      // Handle any achievements that were earned
      handleAchievements(response, this._gameContainer);

      // Refetch the game statistics to update the UI with the updated currency values
      this._updateStatistics();

      // Update the detail panel with the new building data
      this._detailContainer.querySelector("building-detail").data = building;
    } catch (err) {
      throw new Error(`Error upgrading building: ${err.message}`);
    }
  }

  async _performToggleBuildingEnergy(GameBuildingId) {
    try {
      const building = this._game.buildingData.find(
        (b) => b.id === GameBuildingId
      );
      if (!building) throw new Error("Building not found");

      // Call the backend to toggle the building's energy type
      const response = await toggleGameBuildingRunsOnGreen(
        GameBuildingId,
        this._game.token
      );

      // Update the local building data to avoid data inconsistency
      console.log("Response from toggle:", response);
      Object.assign(building, response);

      //recolor the building in the game scene
      const cityScene = this._game.scene.getScene("CityScene");
      if (cityScene && typeof cityScene.setBuildingColor === "function") {
        cityScene.setBuildingColor(building);
      }

      // Handle any achievements that were earned
      handleAchievements(response, this._gameContainer);

      // Refetch the game statistics to update the UI with the updated currency values
      this._updateStatistics();

      // Update the detail panel with the new building data
      this._detailContainer.querySelector("building-detail").data = building;
    } catch (err) {
      throw new Error(`Error upgrading building: ${err.message}`);
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
          activeScene.showSavedConfirmation(`Checkpoint opgeslagen!`);
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

    active.showCheckpointList((selectedCheckpointId, selectedChekpointName) => {
      active.showConfirmation(
        `Wil je ${selectedChekpointName} laden?`,
        (confirmed) => {
          if (confirmed) {
            this._performLoadCheckpoint(selectedCheckpointId);
            active.showSavedConfirmation(
              `Spel geladen van ${selectedChekpointName}!`
            );
          }
        }
      );
    });
  }

  async _performLoadCheckpoint(selectedCheckpointId) {
    const raw = sessionStorage.getItem("loggedInUser");
    if (!raw) return console.error("No user in sessionStorage!");
    const { token } = JSON.parse(raw);

  try {
    // fetch gameStatistics, assets and gameBuildings
    const gameStatistics = await refactorGameStatistics(selectedCheckpointId, token);

    // stash into the game state
    this._game.gameStatisticsId   = gameStatistics.id;
    this._game.currencyId         = gameStatistics.currency.id; 
    this._game.assetData          = gameStatistics.assets;
    this._game.gameBuildingsData  = gameStatistics.gameBuildings;

      clearInterval(this._energyInterval);
      clearInterval(this._statsInterval);

    // handle assets in OuterCityScene
    const outer = this._game.scene.getScene("OuterCityScene");
    outer.clearAllAssets();
    outer.checkpointAssets = gameStatistics.assets;
    outer.reloadCheckpointAssets();
    
    // Fetch newly updated GameStatistics object
    this._updateStatistics();

    // rebind your click events
    this._game.events.off("assetClicked");
    this._game.events.on("assetClicked", id => this._showAssetDetail(id));

    this._game.events.off("buildingClicked");
    this._game.events.on("buildingClicked", id => this._showBuildingDetail(id));
  } catch (err) {
    console.error("Error loading checkpoint:", err);
    const outer = this._game.scene.getScene("OuterCityScene");
    if (outer?.showError) outer.showError("Kon checkpoint niet laden: " + err.message);
  }
}

}

window.customElements.define("gamecontrolpanel-れ", GameControlPanel);
