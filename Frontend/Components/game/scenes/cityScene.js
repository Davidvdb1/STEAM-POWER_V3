export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }

    preload() {
      this.load.tilemapTiledJSON("citymap", "Assets/json/binnenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
      this.load.on("complete", () => console.log("Assets geladen"));
    }

    create() {
      this.map = this.make.tilemap({ key: "citymap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset_Custom",
        "tilesetImage"
      );

      if (!tileset) {
        console.error("Tileset niet gevonden.");
        return;
      }
      
      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);
      this.layer3 = this.map.createLayer("Layer-3", tileset);
      this.layer4 = this.map.createLayer("Layer-4", tileset);
      this.layer5 = this.map.createLayer("Layer-5", tileset);

      // Set camera boundaries to match the tilemap dimensions 
      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );

      // Set up keyboard input for camera navigation
      this.cursors = this.input.keyboard.createCursorKeys();
      this.WASD = this.input.keyboard.addKeys("Z,S,Q,D");

      // Enable zooming with mouse wheel
      this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
        let newZoom = this.cameras.main.zoom - dy * 0.001;
        newZoom = Phaser.Math.Clamp(newZoom, 1, 2);
        this.cameras.main.setZoom(newZoom);
      });
      
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

    update(time, delta) {
      const speed = 300;
      const cam = this.cameras.main;

      if (this.cursors.left.isDown || this.WASD.Q.isDown) {
        cam.scrollX -= speed * (delta / 1000);
      } else if (this.cursors.right.isDown || this.WASD.D.isDown) {
        cam.scrollX += speed * (delta / 1000);
      }
      if (this.cursors.up.isDown || this.WASD.Z.isDown) {
        cam.scrollY -= speed * (delta / 1000);
      } else if (this.cursors.down.isDown || this.WASD.S.isDown) {
        cam.scrollY += speed * (delta / 1000);
      }

      cam.scrollX = Phaser.Math.Clamp(
        cam.scrollX,
        0,
        this.map.widthInPixels - cam.width / cam.zoom
      );
      cam.scrollY = Phaser.Math.Clamp(
        cam.scrollY,
        0,
        this.map.heightInPixels - cam.height / cam.zoom
      );
    }
  };
}
