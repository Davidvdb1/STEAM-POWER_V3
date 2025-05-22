import { setCameraBounds, handleZoom, setMovementKeys, handleMovementKeys } from "../utils/phaserSceneUtils.js";

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

      // Begin tile hover functionality
      this.handleTileHover();
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
            // open detail panel
            this.game.events.emit("buildingClicked", b.id);
          });
      });
    }
  };
}
