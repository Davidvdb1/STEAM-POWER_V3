// src/components/game/scenes/cityScene.js

import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
} from "../../utils/phaserSceneUtils.js";

import {
  createConfirmationPopup,
  createErrorPopup,
} from "../popups/uiPopups.js";
import { createCheckpointLoadPopup } from "../popups/checkpointLoadPopup.js";

import {
  initializeBuildingRegistry,
  makeBuildingsInteractive,
  setBuildingColor,
  handleUpgradeRequest,
  handleToggleEnergyRequest,
} from "../../utils/buildingHandler.js";

export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }

    init(data) {
      this.events.once("shutdown", () => {
        if (this.layer1) this.layer1.destroy();
        if (this.layer2) this.layer2.destroy();
        if (this.layer3) this.layer3.destroy();
        if (this.layer4) this.layer4.destroy();
        if (this.layer5) this.layer5.destroy();
        if (this.map) this.map.destroy();
      });

      if (data.buildings) {
        this.checkpointBuildings = data.buildings;
        this.sys.game.gameStatisticsId = data.gameStatisticsId;
        this.sys.game.token = data.token;
      }
    }

    preload() {
      this.load.tilemapTiledJSON("innerCityMap", "Assets/json/binnenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
    }

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

      document.addEventListener(
        "scene:upgrade-building",
        (e) => {
          handleUpgradeRequest(this, e.detail.GameBuildingId);
        },
        false
      );

      document.addEventListener(
        "scene:toggle-building-energy",
        (e) => {
          handleToggleEnergyRequest(this, e.detail.GameBuildingId);
        },
        false
      );
    }

    update(time, delta) {
      handleMovementKeys(this, delta);
    }
  };
}
