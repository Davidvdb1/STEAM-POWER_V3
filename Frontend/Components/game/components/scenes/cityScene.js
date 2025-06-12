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

        if (
          this.buildingRegistry &&
          typeof this.buildingRegistry.clearRegistry === "function"
        ) {
          this.buildingRegistry.clearRegistry();
        }
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
      // In your preload method
      this.load.scenePlugin({
        key: 'AnimatedTiles',
        url: 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js',
        sceneKey: 'animatedTiles'
      });
      // this.load.tilemapTiledJSON("innerCityMap", "Assets/json/binnenstad.json");
      // this.load.image(
      //   "tilesetImage",
      //   "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      // );
      this.load.tilemapTiledJSON("innerCityMap", "assets/json/binnenstad-met-animaties.json");
      // Main tileset
      this.load.image("mainTileset", "assets/images/tilesets/Modern_Exteriors_Complete_Tileset_Custom.png");
      // Additional tilesets for animations
      this.load.image("billboardImage", "assets/images/tilesets/billboard.png");
      this.load.image("busDoorImage", "assets/images/tilesets/Bus_Door.png");
      this.load.image("charactersImage", "assets/images/tilesets/Characters.png");
      this.load.image("clothesHangingImage", "assets/images/tilesets/Clothes_Hanging.png");
      this.load.image("dumpsterImage", "assets/images/tilesets/Dumpster.png");
      this.load.image("fountainImage", "assets/images/tilesets/Fountain.png");
      this.load.image("helicopterDoorImage", "assets/images/tilesets/Helicopter_Door.png");
      this.load.image("hospitalGarageDoorImage", "assets/images/tilesets/Hospital_Garage_Door.png");
      this.load.image("hospitalStretcherImage", "assets/images/tilesets/Hospital_Stretcher.png");
      this.load.image("policeStationDoorImage", "assets/images/tilesets/Police_Station_Door.png");
      this.load.image("spotlightImage", "assets/images/tilesets/Spotlight.png");
      this.load.image("subwayBuskerImage", "assets/images/tilesets/Subway_Busker.png");
      this.load.image("subwayElevatorImage", "assets/images/tilesets/Subway_Elevator_Going_Down.png");
      this.load.image("townHallDoorImage", "assets/images/tilesets/Town_Hall_Balcony_Door.png");
    }

    /**
     * Creates the scene.
     * @memberof CityScene
     */
    create() {
      this.map = this.make.tilemap({ key: "innerCityMap" });
      const mainTileset = this.map.addTilesetImage("Modern_Exteriors_Complete_Tileset_Custom", "mainTileset");
      const billboardTileset = this.map.addTilesetImage("Billboard", "billboardImage");
      const busDoorTileset = this.map.addTilesetImage("Bus_Door", "busDoorImage");
      const charactersTileset = this.map.addTilesetImage("Characters", "charactersImage");
      const clothesHangingTileset = this.map.addTilesetImage("Clothes_Hanging", "clothesHangingImage");
      const dumpsterTileset = this.map.addTilesetImage("Dumpster", "dumpsterImage");
      const fountainTileset = this.map.addTilesetImage("Fountain", "fountainImage");
      const helicopterDoorTileset = this.map.addTilesetImage("Helicopter_Door", "helicopterDoorImage");
      const hospitalGarageDoorTileset = this.map.addTilesetImage("Hospital_Garage_Door", "hospitalGarageDoorImage");
      const hospitalStretcherTileset = this.map.addTilesetImage("Hospital_Stretcher", "hospitalStretcherImage");
      const policeStationDoorTileset = this.map.addTilesetImage("Police_Station_Door", "policeStationDoorImage");
      const spotlightTileset = this.map.addTilesetImage("Spotlight", "spotlightImage");
      const subwayBuskerTileset = this.map.addTilesetImage("Subway_Busker", "subwayBuskerImage");
      const subwayElevatorTileset = this.map.addTilesetImage("Subway_Elevator_Going_Down", "subwayElevatorImage");
      const townHallDoorTileset = this.map.addTilesetImage("Town_Hall_Balcony_Door", "townHallDoorImage");

      this.layer1 = this.map.createLayer("Layer-1", mainTileset);
      this.layer2 = this.map.createLayer("Layer-2", [mainTileset, fountainTileset, hospitalGarageDoorTileset, townHallDoorTileset]);
      this.layer3 = this.map.createLayer("Layer-3", [mainTileset, billboardTileset, charactersTileset, dumpsterTileset, helicopterDoorTileset, hospitalStretcherTileset, policeStationDoorTileset, spotlightTileset, subwayElevatorTileset]);
      this.layer4 = this.map.createLayer("Layer-4", [mainTileset, busDoorTileset, subwayBuskerTileset]);
      this.layer5 = this.map.createLayer("Layer-5", [mainTileset, clothesHangingTileset]);

      // In your create method (after creating layers)
      this.animatedTiles.init(this.map);

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

      document.removeEventListener(
        "scene:upgrade-building",
        this._onUpgradeBuilding
      );
      document.removeEventListener(
        "scene:toggle-building-energy",
        this._onToggleBuildingEnergy
      );

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
