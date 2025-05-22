import { setCameraBounds, handleZoom, setMovementKeys, handleMovementKeys, handleMapDragging } from "../utils/phaserSceneUtils.js";
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

      // Enable dragging the map with the mouse
      handleMapDragging(this);


      // Configure the building info panel and 'upgrade building' dialog
      // Setup confirmation dialog UI
      const popupWidth = 700;
      const popupHeight = 300;
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      // Background panel
      this.confirmBg = this.add
        .graphics()
        .fillStyle(0x222222, 0.9)
        .fillRoundedRect(
          centerX - popupWidth / 2,
          centerY - popupHeight / 2,
          popupWidth,
          popupHeight,
          20
        )
        .setDepth(299)
        .setScrollFactor(0)
        .setVisible(false);

      // Confirmation text
      this.confirmText = this.add.text(
        centerX,
        centerY - 40,
        "",
        {
          fontSize: '32px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold',
          wordWrap: { width: popupWidth - 50 }
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(300)
      .setScrollFactor(0)
      .setVisible(false);

      const buttonWidth = 180;
      const buttonHeight = 60;
      const padding = 20;

      // "Yes" button
      this.confirmYesButton = this.add.graphics()
        .fillStyle(0x4CAF50, 1)
        .fillRoundedRect(
          centerX - buttonWidth - padding,
          centerY + 40,
          buttonWidth,
          buttonHeight,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(
          new Phaser.Geom.Rectangle(
            centerX - buttonWidth - padding,
            centerY + 40,
            buttonWidth,
            buttonHeight
          ),
          Phaser.Geom.Rectangle.Contains
        );

      this.confirmYesText = this.add.text(
        centerX - buttonWidth / 2 - padding,
        centerY + 40 + buttonHeight / 2,
        "Ja",
        {
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(301)
      .setScrollFactor(0)
      .setVisible(false);

      // "No" button
      this.confirmNoButton = this.add.graphics()
        .fillStyle(0xF44336, 1)
        .fillRoundedRect(
          centerX + padding,
          centerY + 40,
          buttonWidth,
          buttonHeight,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(
          new Phaser.Geom.Rectangle(
            centerX + padding,
            centerY + 40,
            buttonWidth,
            buttonHeight
          ),
          Phaser.Geom.Rectangle.Contains
        );

      this.confirmNoText = this.add.text(
        centerX + buttonWidth / 2 + padding,
        centerY + 40 + buttonHeight / 2,
        "Nee",
        {
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(301)
      .setScrollFactor(0)
      .setVisible(false);

      // Methods to show/hide confirmation
      this.showConfirmation = (msg, callback) => {
        this.confirmBg.setVisible(true);
        this.confirmText.setText(msg).setVisible(true);
        this.confirmYesButton.setVisible(true);
        this.confirmYesText.setVisible(true);
        this.confirmNoButton.setVisible(true);
        this.confirmNoText.setVisible(true);

        // Disable keyboard input while dialog is open
        this.input.keyboard.enabled = false;

        const onYes = () => { this.hideConfirmation(); callback(true); };
        const onNo = () => { this.hideConfirmation(); callback(false); };

        this.confirmYesButton.off('pointerdown').on('pointerdown', onYes);
        this.confirmNoButton.off('pointerdown').on('pointerdown', onNo);
      };

      this.hideConfirmation = () => {
        this.confirmBg.setVisible(false);
        this.confirmText.setVisible(false);
        this.confirmYesButton.setVisible(false);
        this.confirmYesText.setVisible(false);
        this.confirmNoButton.setVisible(false);
        this.confirmNoText.setVisible(false);
        this.input.keyboard.enabled = true;
      };
    }


    update(time, delta) {
      handleMovementKeys(this, delta);
    }


    /**
     * Handles tile hover interactions in the city scene.
     * Draws a hover marker and clickable zones for buildings.
     */
    handleTileHover() {
      this.hoverMarker = this.add.graphics();
      this.hoveredTile = null;
      this.input.on("pointermove", (pointer) => {
        // Skip hover effects when dragging
        if (this.isDragging) {
          this.hoverMarker.clear();
          return;
        }
        
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
            // Prevent drag when clicking on buildings
            this.isDragging = false;
            // open detail panel
            this.game.events.emit("buildingClicked", b.id);
          });
      });
    }


    /**
     * Configures the selectable tile regions for various buildings on the city map.
     */
    configureTileSelections() {
      // Set up A building registry to define buildings
      this.buildingRegistry = new BuildingRegistry();

      // Define buildings by specific tile coordinates
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
