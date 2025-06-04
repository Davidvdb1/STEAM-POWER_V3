import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
  setupMenuButton
} from "../../utils/phaserSceneUtils.js";
import { BuildingRegistry } from "../../utils/buildingRegistry.js";
import { createConfirmationPopup } from "../../utils/uiPopups.js";
import { createCheckpointLoadPopup } from "../../utils/checkpointLoadPopup.js";
import { BUILDING_DEFINITIONS } from "../../utils/buildingDefinitions.js";

export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }

    init(data) {
      // 1) Pre-shutdown hook:
      this.events.once("shutdown", () => {
        if (this.layer1) this.layer1.destroy();
        if (this.layer2) this.layer2.destroy();
        if (this.layer3) this.layer3.destroy();
        if (this.layer4) this.layer4.destroy();
        if (this.layer5) this.layer5.destroy();
        if (this.map) this.map.destroy();
      });

      // 2) Clear and inject checkpoint data:
      if (data.buildings) {
        this.checkpointBuildings = data.buildings;
        this.sys.game.gameStatisticsId = data.gameStatisticsId;
        this.sys.game.token = data.token;
      }
    }

    preload() {
      // Load the tilemap and tileset image
      this.load.tilemapTiledJSON("innerCityMap", "Assets/json/binnenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
    }

    create() {
      // Set up the tilemap and its layers
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

      // Set camera boundaries to match the tilemap dimensions
      setCameraBounds(this);

      // Enable zooming with mouse wheel
      handleZoom(this);

      // Set up keyboard input for camera navigation
      setMovementKeys(this);

      // Configure tile selections for buildings
      this.configureTileSelections();

      // Gray out all buildings at the start of the game
      this.buildingRegistry.grayoutAllBuildings(1);

      // Enable dragging the map with the mouse
      handleMapDragging(this);

      // Make buildings clickable
      this.makeBuildingsInteractive();

      // Create the confirmation dialog UI for upgrading a building but set it to hidden initially
      createConfirmationPopup(this);

      // Create the checkpoint load popup UI
      createCheckpointLoadPopup(this);

      // Add menu button to top right corner
      setupMenuButton(this);
    }

    update(time, delta) {
      handleMovementKeys(this, delta);
    }

    /**
     * Configures the selectable tile regions for various buildings in the city scene.
     *
     * This method initializes a `BuildingRegistry` and registers multiple buildings by specifying
     * their names, the map reference, and the tile coordinate ranges for each relevant layer.
     * Each building is defined by one or more layer and coordinate range tuples, which determine
     * the tiles that constitute the building's selectable area.
     *
     * The method does not return a value and is intended to be called during scene setup.
     */
    configureTileSelections() {
      // Set up A building registry to define buildings
      this.buildingRegistry = new BuildingRegistry();

      // Define buildings by specific tile coordinates and layers, defined in BUILDING_DEFINITIONS
      BUILDING_DEFINITIONS.forEach((building) => {
        this.buildingRegistry.createBuilding(
          building.name,
          this.map,
          ...building.layers
        );
      });
    }

    /**
     * Iterates over all registered buildings and creates a single interactive transparent rectangle
     * for each building, covering its entire area based on its tiles across all layers.
     * When a building's rectangle is clicked, emits a "buildingClicked" event with the building's ID
     * (if found in the global building data), or falls back to emitting the building's name.
     */
    makeBuildingsInteractive() {
      for (const [
        buildingName,
        tileSelection,
      ] of this.buildingRegistry.buildings.entries()) {
        // Find bounding box for each building
        const tileW = this.map.tileWidth;
        const tileH = this.map.tileHeight;

        // For each building, calculate its overall bounds
        let minX = Infinity,
          minY = Infinity;
        let maxX = -Infinity,
          maxY = -Infinity;

        // Process all layers of this building
        for (const [layerName, data] of tileSelection.originalTiles.entries()) {
          data.tiles.forEach((tile) => {
            minX = Math.min(minX, tile.x);
            minY = Math.min(minY, tile.y);
            maxX = Math.max(maxX, tile.x);
            maxY = Math.max(maxY, tile.y);
          });
        }

        // Create a single interactive rectangle that covers the entire building
        if (minX !== Infinity) {
          const rect = this.add
            .rectangle(
              minX * tileW,
              minY * tileH,
              (maxX - minX + 1) * tileW,
              (maxY - minY + 1) * tileH,
              0x0000ff,
              0.0 // Transparent
            )
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })
            // .setStrokeStyle(2, 0x0000ff, 0.5) // Add a green outline with 50% opacity
            .on("pointerdown", () => {
              this.isDragging = false;

              // Find the building data by name
              const buildingData = this.sys.game.buildingData?.find(
                (b) =>
                  b.name === buildingName ||
                  (b.building && b.building.name === buildingName)
              );

              if (buildingData) {
                // Emit the building ID instead of name
                this.game.events.emit("buildingClicked", buildingData.id);
              } else {
                console.warn(`No building data found for ${buildingName}`);
                // Fallback to the original behavior
                this.game.events.emit("buildingClicked", buildingName);
              }
            });
        }
      }
    }

    /**
     * Make one building either grayscale or full‐color
     * based on its runsOnGreen flag.
     *
     * @param {{ name: string, runsOnGreen: boolean }} b
     *   Any object with `name` and `runsOnGreen`.
     *   We look up the TileSelection by `name` in the registry.
     */
    setBuildingColor(b) {
      const tileSel = this.buildingRegistry.getBuilding(b.name);
      if (!tileSel) return;
      if (b.runsOnGreen) {
        tileSel.removeGrayscale();
      } else {
        tileSel.applyGrayscale(1);
      }
    }
  };
}
