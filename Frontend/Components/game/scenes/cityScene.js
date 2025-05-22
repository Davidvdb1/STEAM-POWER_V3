import { setCameraBounds, handleZoom, setMovementKeys, handleMovementKeys } from "../utils/phaserSceneUtils.js";
import { BuildingRegistry } from "../utils/buildingRegistry.js";

export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }


    preload() {
      // Load the tilemap and tileset image
      this.load.tilemapTiledJSON("innerCityMap", "Assets/json/binnenstad.json");
      this.load.image("tilesetImage", "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png");
    }


    create() {
      // Set up the tilemap and its layers
      this.map = this.make.tilemap({ key: "innerCityMap" });
      const tileset = this.map.addTilesetImage("Modern_Exteriors_Complete_Tileset_Custom", "tilesetImage");

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

      // Enable visibly hovering over a selection of tiles
      this.handleTileHover();
    }


    update(time, delta) {
      // Update the camera position based on user input
      handleMovementKeys(this, delta);
    }


    /**
     * Handles tile hover interactions in the city scene.
     * 
     * - Draws a hover marker over a 3x3 tile area centered on the currently hovered tile.
     * - TODO: Add interactive rectangles for each building zone, allowing for click events.
     * 
     * Assumes `this.layer1`, `this.map`, and `this.sys.game.buildingData` are defined.
     */
    handleTileHover() {
      this.hoverMarker = this.add.graphics();
      this.hoveredTile = null;
      this.input.on("pointermove", (pointer) => {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const tile = this.layer1.getTileAtWorldXY(worldPoint.x, worldPoint.y);

        if (tile) {
          if (
            !this.hoveredTile ||
            this.hoveredTile.x !== tile.x ||
            this.hoveredTile.y !== tile.y
          ) {
            this.hoveredTile = tile;
            this.hoverMarker.clear();
            this.hoverMarker.lineStyle(1, 0x0000ff, 1);
            this.hoverMarker.fillStyle(0x0000ff, 0.3);

            const tileW = this.map.tileWidth;
            const tileH = this.map.tileHeight;

            const startX = tile.x - 1;
            const startY = tile.y - 1;

            this.hoverMarker.strokeRect(
              startX * tileW,
              startY * tileH,
              tileW * 3,
              tileH * 3
            );
            this.hoverMarker.fillRect(
              startX * tileW,
              startY * tileH,
              tileW * 3,
              tileH * 3
            );
          }
        } else {
          this.hoverMarker.clear();
          this.hoveredTile = null;
        }
      });

      const zones = this.sys.game.buildingData || [];
      const tileW = this.map.tileWidth;
      const tileH = this.map.tileHeight;

      zones.forEach((b) => {
        const px = b.xLocation * tileW;
        const py = b.yLocation * tileH;
        const pw = b.xSize * tileW;
        const ph = b.ySize * tileH;

        this.add
          .rectangle(px, py, pw, ph, 0x0000ff, 0.3)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            console.log(`Clicked building ${b.id}`);
            // TODO: open building UI
          });
      });
    }


    /**
     * Configures the selectable tile regions for various buildings in the city scene.
     * 
     * Initializes a `BuildingRegistry` and registers multiple buildings by specifying their
     * names, associated map, and the tile coordinate ranges on different layers that define
     * their selectable areas. Each building can span multiple layers and rectangular regions.
     * 
     * This setup enables the game to recognize which tiles correspond to which buildings,
     * facilitating interactions such as selection, highlighting, or triggering building-specific logic.
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
        ["Layer-5", [117, 30], [139, 47]],
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
        "postOffice", 
        this.map,
        ["Layer-2", [72, 59], [75, 68]],
        ["Layer-3", [76, 56], [83, 68]],
        ["Layer-4", [76, 56], [83, 68]]
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
    };
  }
}
