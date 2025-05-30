import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
} from "../../utils/phaserSceneUtils.js";
import { BuildingRegistry } from "../../utils/buildingRegistry.js";
import { createConfirmationPopup } from "../../utils/uiPopups.js";
import { createCheckpointLoadPopup } from "../../utils/checkpointLoadPopup.js";

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

      // Load existing buildings (checkpoint or regular game data)
      // this.loadExistingBuildings();

      // Create the confirmation dialog UI for upgrading a building but set it to hidden initially
      createConfirmationPopup(this);

      // Create the checkpoint load popup UI
      createCheckpointLoadPopup(this);
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

      // Define buildings by specific tile coordinates and layers
      this.buildingRegistry.createBuilding(
        "office",
        this.map,
        ["Layer-2", [0, 0], [20, 24]],
        ["Layer-3", [0, 0], [20, 24]]
      );

      this.buildingRegistry.createBuilding(
        "apartmentBlockTopLeft",
        this.map,
        ["Layer-2", [21, 0], [52, 24]],
        ["Layer-3", [21, 0], [52, 24]],
        ["Layer-4", [21, 0], [52, 24]],
        ["Layer-5", [30, 5], [40, 9]]
      );

      this.buildingRegistry.createBuilding(
        "townhall",
        this.map,
        ["Layer-2", [58, 0], [82, 24]],
        ["Layer-3", [58, 0], [82, 24]]
      );

      this.buildingRegistry.createBuilding(
        "gasStation",
        this.map,
        ["Layer-2", [88, 0], [103, 13]],
        ["Layer-2", [88, 14], [90, 14]],
        ["Layer-3", [88, 0], [103, 13]]
      );

      this.buildingRegistry.createBuilding(
        "hotdogStand",
        this.map,
        ["Layer-2", [90, 15], [102, 22]],
        ["Layer-3", [90, 15], [102, 22]],
        ["Layer-3", [100, 14], [101, 14]],
        ["Layer-4", [90, 15], [102, 22]]
      );

      this.buildingRegistry.createBuilding(
        "hospital",
        this.map,
        ["Layer-2", [104, 0], [139, 24]],
        ["Layer-3", [104, 0], [139, 24]]
      );

      this.buildingRegistry.createBuilding(
        "shoppingCenter",
        this.map,
        ["Layer-2", [0, 31], [25, 47]],
        ["Layer-3", [0, 30], [27, 47]]
      );

      this.buildingRegistry.createBuilding(
        "school",
        this.map,
        ["Layer-2", [32, 25], [49, 46]],
        ["Layer-3", [32, 25], [49, 46]]
      );

      this.buildingRegistry.createBuilding(
        "bakery",
        this.map,
        ["Layer-2", [52, 29], [59, 35]],
        ["Layer-3", [52, 29], [59, 33]]
      );

      this.buildingRegistry.createBuilding(
        "fireStation",
        this.map,
        ["Layer-2", [96, 30], [115, 45]],
        ["Layer-3", [96, 30], [115, 45]]
      );

      this.buildingRegistry.createBuilding(
        "policeStation",
        this.map,
        ["Layer-2", [117, 27], [139, 47]],
        ["Layer-3", [117, 27], [139, 47]],
        ["Layer-4", [117, 27], [139, 47]],
        ["Layer-5", [117, 30], [139, 47]]
      );

      this.buildingRegistry.createBuilding(
        "apartmentBlockBottomLeft",
        this.map,
        ["Layer-2", [0, 51], [6, 69]],
        ["Layer-3", [0, 51], [6, 69]],
        ["Layer-4", [0, 51], [6, 69]],
        ["Layer-5", [0, 51], [6, 69]]
      );

      this.buildingRegistry.createBuilding(
        "hotel",
        this.map,
        ["Layer-2", [7, 51], [25, 69]],
        ["Layer-3", [7, 51], [23, 69]]
      );

      this.buildingRegistry.createBuilding(
        "apartmentBlockBottomCenter",
        this.map,
        ["Layer-2", [31, 50], [53, 56]],
        ["Layer-3", [31, 50], [66, 68]],
        ["Layer-4", [31, 50], [67, 69]],
        ["Layer-5", [31, 57], [49, 68]]
      );

      this.buildingRegistry.createBuilding(
        "apartmentBlockBottomRight",
        this.map,
        ["Layer-2", [76, 52], [88, 57]],
        ["Layer-3", [76, 52], [88, 55]],
        ["Layer-3", [84, 57], [90, 68]],
        ["Layer-4", [76, 52], [88, 55]],
        ["Layer-4", [84, 57], [90, 68]]
      );

      this.buildingRegistry.createBuilding(
        "postOffice",
        this.map,
        ["Layer-2", [72, 59], [75, 68]],
        ["Layer-3", [76, 56], [83, 68]],
        ["Layer-4", [76, 56], [83, 68]]
      );

      this.buildingRegistry.createBuilding(
        "constructionSite",
        this.map,
        ["Layer-1", [93, 57], [109, 68]],
        ["Layer-2", [93, 54], [109, 68]],
        ["Layer-3", [93, 54], [109, 68]],
        ["Layer-4", [93, 54], [109, 68]],
        ["Layer-5", [93, 54], [109, 68]]
      );

      this.buildingRegistry.createBuilding(
        "trainStation",
        this.map,
        ["Layer-1", [113, 67], [139, 68]],
        ["Layer-2", [112, 58], [139, 69]],
        ["Layer-3", [112, 58], [139, 69]],
        ["Layer-4", [112, 58], [139, 69]],
        ["Layer-5", [112, 58], [139, 69]]
      );
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
              console.log(`Building clicked: ${buildingName}`);

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

    // call this to reset all buildings to their initial state (level 1, grayed out)
// inside your CityScene class

// clearAllGameBuildings() {
//   if (this.buildingSprites) {
//     this.buildingSprites.forEach(sprite => sprite.destroy());
//   }
//   this.buildingSprites = [];
// }

// reloadCheckpointGameBuildings() {
//   const buildings = Array.isArray(this.checkpointBuildings)
//     ? this.checkpointBuildings
//     : this.sys.game.buildingData;
//   if (!Array.isArray(buildings)) return;

//   this.clearAllGameBuildings();

//   buildings.forEach(buildingData => {
//     const name = buildingData.name || buildingData.building?.name;
//     if (!this.buildingRegistry.buildings.has(name)) return;

//     const lvl =
//       buildingData.buildingLevel?.level ??
//       buildingData.level?.level ??
//       buildingData.level ??
//       1;
//     this.buildingRegistry.grayoutAllBuildings(lvl, name);

//     const rect = this._makeBuildingRect(name);
//     this.buildingSprites.push(rect);
//   });
// }

// _makeBuildingRect(buildingName) {
//   const tileSelection = this.buildingRegistry.buildings.get(buildingName);

//   // compute min/max tile coords across all layers
//   let minX = Infinity, minY = Infinity;
//   let maxX = -Infinity, maxY = -Infinity;
//   for (const [, { tiles }] of tileSelection.originalTiles.entries()) {
//     tiles.forEach(tile => {
//       minX = Math.min(minX, tile.x);
//       minY = Math.min(minY, tile.y);
//       maxX = Math.max(maxX, tile.x);
//       maxY = Math.max(maxY, tile.y);
//     });
//   }

//   const tileW = this.map.tileWidth, tileH = this.map.tileHeight;
//   return this.add
//     .rectangle(
//       minX * tileW,
//       minY * tileH,
//       (maxX - minX + 1) * tileW,
//       (maxY - minY + 1) * tileH,
//       0x0000ff,
//       0.0
//     )
//     .setOrigin(0)
//     .setInteractive();
// }


// loadExistingBuildings() {
//   const buildings = Array.isArray(this.checkpointBuildings)
//     ? this.checkpointBuildings
//     : this.sys.game.buildingData;
//   if (!Array.isArray(buildings)) return;

//   console.log("loadExistingBuildings drawing", buildings.length, "buildings");
//   this.clearAllGameBuildings();

//   buildings.forEach(buildingData => {
//     const name = buildingData.name
//       || buildingData.building?.name;
//     if (!this.buildingRegistry.buildings.has(name)) return;

//     // extract numeric level
//     const lvl =
//       buildingData.buildingLevel?.level   // if you have buildingLevel object
//       ?? buildingData.level?.level        // or if your API uses level object
//       ?? buildingData.level               // or if it's already a number
//       ?? 1;

//     this.makeBuildingsInteractive();
//     this.buildingRegistry.grayoutAllBuildings(lvl, name);

//     // store the sprite if you need it elsewhere:
//     const rect = this._makeBuildingRect(name);
//     this.buildingSprites.push(rect);
//   });
// }
  }}