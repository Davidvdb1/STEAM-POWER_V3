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

      this.buildingRegistry.grayoutAllBuildings(0.6);
      this.buildingRegistry.grayoutBuilding("gasStation", 0.2);

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

    configureTileSelections() {
      // Set up A building registry to define buildings
      this.buildingRegistry = new BuildingRegistry();

      // Define buildings by specific tile coordinates
      this.buildingRegistry.createBuilding("office", this.map, 0, 0, 21, 24);
      this.buildingRegistry.createBuilding("apartmentBlockTopLeft", this.map, 22, 0, 52, 24);
      this.buildingRegistry.createBuilding("townhall", this.map, 58, 0, 82, 24);
      this.buildingRegistry.createBuilding("gasStation", this.map, 88, 0, 103, 14);
      this.buildingRegistry.createBuilding("hotdogStand", this.map, 88, 15, 103, 24);
      this.buildingRegistry.createBuilding("hospital", this.map, 104, 0, 139, 24);
      this.buildingRegistry.createBuilding("hotel", this.map, 7, 51, 23, 69);
    };
  }
}
