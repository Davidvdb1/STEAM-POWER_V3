// components/scenes/outerCityScene.js

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super({ key: "OuterCityScene" });
    }

    preload() {
      this.load.tilemapTiledJSON("citymap", "Assets/json/binnenstad-v1.json");
      // this.load.image(
      //   "tilesetImage",
      //   "Assets/images/Modern_Exteriors_Complete_Tileset.png"
      // );
      this.load.on("complete", () => console.log("Assets geladen"));

      this.load.image("Zonnepaneel", "Assets/images/solar_panel.png");
      this.load.image("Windmolen", "Assets/images/windturbine.png");
      this.load.image("Waterrad", "Assets/images/waterrad.png");
      this.load.image("Kerncentrale", "Assets/images/kerncentrale.png");
    }

    create() {
      const typeToSprite = {
        Windmolen: "Windmolen",
        Zonnepaneel: "Zonnepaneel",
        Waterrad: "Waterrad",
        Kerncentrale: "Kerncentrale",
      };

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
for (let i = 0; i < this.map.layers.length; i++) {
  const layerName = this.map.layers[i].name;
  if (layerName === "buildings") continue; // skip buildings laag
  this.map.createLayer(layerName, tileset, 0, 0);
}

      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );


      for (let i = 0; i < this.map.layers.length; i++) {
        this.map.createLayer(i, tileset, 0, 0);
      }

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

      this.input.on("pointermove", (pointer) => {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const tile = this.map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
        if (tile) {
          this.highlightTile(tile);
        }
      });

      this.highlight = this.add.graphics();

      this.game.canvas.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      this.game.canvas.addEventListener("drop", (event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData("text/plain");
        if (!type || !typeToSprite[type]) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;

        const worldPoint = this.cameras.main.getWorldPoint(pointerX, pointerY);
        const tileX = Math.floor(worldPoint.x / this.map.tileWidth);
        const tileY = Math.floor(worldPoint.y / this.map.tileHeight);

        const tileW = this.map.tileWidth;
        const tileH = this.map.tileHeight;
        const spriteKey = typeToSprite[type];

        console.log(`Asset ${type} geplaatst op (${tileX}, ${tileY})`);

        this.add
          .image(tileX * tileW, tileY * tileH, spriteKey)
          .setOrigin(0)
          .setDisplaySize(tileW * 3, tileH * 3)
          .setInteractive();
      });

      // Assets (PNG's) plaatsen bij opstart
      const assets = this.sys.game.assetData || [];
      const tileW = this.map.tileWidth;
      const tileH = this.map.tileHeight;

      assets.forEach((a) => {
        const worldX = a.xLocation * tileW;
        const worldY = a.yLocation * tileH;

        const spriteKey = typeToSprite[a.type] || "Zonnepaneel"; // fallback indien onbekend

        console.log(
          `Asset ${a.id} geplaatst op tiles: X: ${a.xLocation} tot ${a.xLocation + a.xSize - 1} Y: ${a.yLocation} tot ${a.yLocation + a.ySize - 1}`
        );

        this.add
          .image(worldX, worldY, spriteKey)
          .setOrigin(0)
          .setDisplaySize(a.xSize * tileW, a.ySize * tileH)
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            console.log(
              `Clicked asset ${a.id} van type ${a.type} op tile (${a.xLocation}, ${a.yLocation})`
            );
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

    highlightTile(tile) {
      const tileWorldX = tile.getCenterX();
      const tileWorldY = tile.getCenterY();
      const tileSize = this.map.tileWidth;

      this.highlight.clear();
      this.highlight.lineStyle(2, 0xffff00, 1);
      this.highlight.strokeRect(
        tileWorldX - tileSize / 2,
        tileWorldY - tileSize / 2,
        tileSize,
        tileSize
      );
    }
  };
}