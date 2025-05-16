export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super("CityScene");
    }

    preload() {
      this.load.tilemapTiledJSON("citymap", "Assets/json/binnenstad-v1.json");
      this.load.image("tilesetImage", "Assets/images/Modern_Exteriors_Complete_Tileset.png");
      this.load.on("complete", () => console.log("Assets geladen"));
    }

    create() {
      const map = this.make.tilemap({ key: "citymap" });
      this.map = map;

      const tileset = map.addTilesetImage("Modern_Exteriors_Complete_Tileset", "tilesetImage");
      if (!tileset) {
        console.error("Tileset niet gevonden.");
        return;
      }

      this.layer = map.createLayer("road-layout", tileset, 0, 0);
      if (!this.layer) {
        console.error("Laag kon niet aangemaakt worden.");
        return;
      }
      
      this.buildingsLayer = map.createLayer("buildings", tileset, 0, 0);
      if (!this.buildingsLayer) {
        console.warn("Buildings layer niet gevonden.");
      }

      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.WASD = this.input.keyboard.addKeys('Z,S,Q,D');

      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        let newZoom = this.cameras.main.zoom - deltaY * 0.001;
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

      cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, this.map.widthInPixels - cam.width / cam.zoom);
      cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, this.map.heightInPixels - cam.height / cam.zoom);
    }
  };
}
