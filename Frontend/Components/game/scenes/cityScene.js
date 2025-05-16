export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }

    preload() {
      this.load.tilemapTiledJSON(
        "citymap",
        "Assets/json/binnenstad-v1.json"
      );
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset.png"
      );
      this.load.on("complete", () => console.log("Assets geladen"));
    }

    create() {
      this.map = this.make.tilemap({ key: "citymap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset",
        "tilesetImage"
      );
      if (!tileset) {
        console.error("Tileset niet gevonden.");
        return;
      }
      this.layer = this.map.createLayer("road-layout", tileset, 0, 0);
      this.buildingsLayer = this.map.createLayer("buildings", tileset, 0, 0);
      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );

      this.cursors = this.input.keyboard.createCursorKeys();
      this.WASD = this.input.keyboard.addKeys("Z,S,Q,D");
      this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
        let newZoom = this.cameras.main.zoom - dy * 0.001;
        newZoom = Phaser.Math.Clamp(newZoom, 0.5, 2);
        this.cameras.main.setZoom(newZoom);
      });
      this.hoverMarker = this.add.graphics();
      this.hoveredTile = null;
      this.input.on("pointermove", (pointer) => {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const tile = this.layer.getTileAtWorldXY(worldPoint.x, worldPoint.y);
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
            this.hoverMarker.fillRect(
              tile.pixelX,
              tile.pixelY,
              this.map.tileWidth,
              this.map.tileHeight
            );
            this.hoverMarker.strokeRect(
              tile.pixelX,
              tile.pixelY,
              this.map.tileWidth,
              this.map.tileHeight
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
