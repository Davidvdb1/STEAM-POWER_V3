// src/components/game/scenes/cityScene.js

import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
  setupMenuButton,
} from "../../utils/phaserSceneUtils.js";

import {
  createConfirmationPopup,
  createErrorPopup,
} from "../../utils/uiPopups.js";
import { createCheckpointLoadPopup } from "../../utils/checkpointLoadPopup.js";

import {
  initializeBuildingRegistry,
  makeBuildingsInteractive,
  setBuildingColor,
  handleUpgradeRequest,
  handleToggleEnergyRequest,
} from "../../utils/buildingHandler.js";

export function createCityScene() {
  /**
   * Phaser Scene for the city map, handling building interactions,
   * camera movement, and UI popups.
   * @class CityScene
   * @extends Phaser.Scene
   */
  return class CityScene extends Phaser.Scene {
    /**
     * Creates a new CityScene instance.
     * @constructor
     * @memberof CityScene
     */
    constructor() {
      super("CityScene");
      this._onUpgradeBuilding = this._onUpgradeBuilding.bind(this);
      this._onToggleBuildingEnergy = this._onToggleBuildingEnergy.bind(this);
    }

    /**
     * Initializes the scene with checkpoint data if available.
     * @param {Object} data - The checkpoint data containing buildings and game statistics.
     * @param {string} data.gameStatisticsId - The ID of the game statistics.
     * @param {string} data.token - The token for the game session.
     * @param {Array} [data.buildings] - Optional array of buildings to carry over from the checkpoint.
     * @memberof CityScene
     */
    init(data) {
      this.events.once("shutdown", () => {
        document.removeEventListener(
          "scene:upgrade-building",
          this._onUpgradeBuilding
        );
        document.removeEventListener(
          "scene:toggle-building-energy",
          this._onToggleBuildingEnergy
        );
      });

      // Carry over checkpoint data (if any)
      if (data.buildings) {
        this.checkpointBuildings = data.buildings;
        this.sys.game.gameStatisticsId = data.gameStatisticsId;
        this.sys.game.token = data.token;
      }
    }

    /**
     * Preloads assets for the scene.
     * @memberof CityScene
     */
    preload() {
      this.load.tilemapTiledJSON("innerCityMap", "Assets/json/binnenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
    }

    /**
     * Creates the scene.
     * @memberof CityScene
     */
    create() {
      this.map = this.make.tilemap({ key: "innerCityMap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset_Custom",
        "tilesetImage"
      );

      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);
      this.layer3 = this.map.createLayer("Layer-3", tileset);
      this.layer4 = this.map.createLayer("Layer-4", tileset);
      this.layer5 = this.map.createLayer("Layer-5", tileset);

      setCameraBounds(this);
      handleZoom(this);
      setMovementKeys(this);
      handleMapDragging(this);

      initializeBuildingRegistry(this);

      if (Array.isArray(this.checkpointBuildings)) {
        this.checkpointBuildings.forEach((b) => setBuildingColor(this, b));
      } else {
        this.buildingRegistry.buildings.forEach((_sel, name) => {
          const tileSel = this.buildingRegistry.getBuilding(name);
          if (tileSel) tileSel.applyGrayscale(1);
        });
      }

      makeBuildingsInteractive(this);

      createConfirmationPopup(this);
      createErrorPopup(this);
      createCheckpointLoadPopup(this);

      // Add the menu button last
      setupMenuButton(this);

      document.addEventListener(
        "scene:upgrade-building",
        this._onUpgradeBuilding
      );
      document.addEventListener(
        "scene:toggle-building-energy",
        this._onToggleBuildingEnergy
      );
    }

    /**
     * Updates the scene.
     * @param {number} time
     * @param {number} delta
     * @memberof CityScene
     */
    update(time, delta) {
      handleMovementKeys(this, delta);
    }

    /**
     * Handles building upgrades.
     * @param {Event} e
     * @memberof CityScene
     */
    _onUpgradeBuilding(e) {
      handleUpgradeRequest(this, e.detail.GameBuildingId, e.detail.upgradeCost);
    }

    /**
     * Handles toggling building energy.
     * @param {Event} e
     * @memberof CityScene
     */
    _onToggleBuildingEnergy(e) {
      handleToggleEnergyRequest(this, e.detail.GameBuildingId);
    }
  };
}
