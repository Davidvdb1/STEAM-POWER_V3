// components/scenes/outerCityScene.js

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super({ key: "OuterCityScene" });
    }

    preload() {
      this.load.tilemapTiledJSON("citymap", "Assets/json/binnenstad-v1.json");
      // Uncomment and update the path if you need the tileset image
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

            const assetSizes = {
        Kerncentrale: { width: 12, height: 10 },
        Windmolen: { width: 6, height: 10 },
        Waterrad: { width: 7, height: 8 },
        Zonnepaneel: { width: 4, height: 6 },
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

      const bottomLayerName = this.map.layers[0].name;
      this.map.createLayer(bottomLayerName, tileset, 0, 0);

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

      this.highlight = this.add.graphics();

            this.draggedAssetType = null;
this.dragHighlight = this.add.graphics();
this.input.on("pointermove", (pointer) => {
  const worldPoint = pointer.positionToCamera(this.cameras.main);
  const tileX = Math.floor(worldPoint.x / this.map.tileWidth);
  const tileY = Math.floor(worldPoint.y / this.map.tileHeight);

  const tile = this.map.getTileAt(tileX, tileY);
  if (tile) {
    this.highlightTile(tile);
  }

  if (this.draggedAssetType && assetSizes[this.draggedAssetType]) {
    const size = assetSizes[this.draggedAssetType];
    this.dragHighlight.clear();
    this.dragHighlight.fillStyle(0x00ff00, 0.4);

    for (let dx = 0; dx < size.width; dx++) {
      for (let dy = 0; dy < size.height; dy++) {
        const x = (tileX + dx) * this.map.tileWidth;
        const y = (tileY + dy) * this.map.tileHeight;
        this.dragHighlight.fillRect(
          x,
          y,
          this.map.tileWidth,
          this.map.tileHeight
        );
      }
    }
  } else {
    this.dragHighlight.clear();
  }
});
;

      this.game.canvas.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      this.game.canvas.addEventListener("dragenter", (event) => {
  const type = event.dataTransfer.getData("text/plain");
  this.draggedAssetType = type;
});

this.game.canvas.addEventListener("dragleave", (event) => {
  this.draggedAssetType = null;
  this.dragHighlight.clear();
});



      this.tileAssetMap = {};

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
  const spriteKey = typeToSprite[type];
  const size = assetSizes[type] || { width: 1, height: 1 };

  let canPlace = true;
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      const key = `${tileX + dx},${tileY + dy}`;
      if (this.tileAssetMap[key]) {
        canPlace = false;
        break;
      }
    }
  }

  if (!canPlace) {
    console.log("Kan gebouw hier niet plaatsen, tegels zijn bezet.");
    return;
  }

  const sprite = this.add
    .image(
      tileX * this.map.tileWidth,
      tileY * this.map.tileHeight,
      spriteKey
    )
    .setOrigin(0)
    .setDisplaySize(
      size.width * this.map.tileWidth,
      size.height * this.map.tileHeight
    )
    .setInteractive();

  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      const tx = tileX + dx;
      const ty = tileY + dy;
      const key = `${tx},${ty}`;
      this.tileAssetMap[key] = {
        type,
        parentSprite: sprite,
        origin: { x: tileX, y: tileY },
        localOffset: { x: dx, y: dy },
      };
    }
  }

  console.log(
    `Asset ${type} geplaatst van (${tileX}, ${tileY}) tot (${
      tileX + size.width - 1
    }, ${tileY + size.height - 1})`
  );

  // **Hier toevoegen:**
  this.draggedAssetType = null;
  this.dragHighlight.clear();
});


      const assets = this.sys.game.assetData || [];
      assets.forEach((a) => {
        const worldX = a.xLocation * this.map.tileWidth;
        const worldY = a.yLocation * this.map.tileHeight;
        const spriteKey = typeToSprite[a.type] || "Zonnepaneel";

        console.log(
          `Asset ${a.id} geplaatst op tiles: X: ${a.xLocation} tot ${
            a.xLocation + a.xSize - 1
          } Y: ${a.yLocation} tot ${a.yLocation + a.ySize - 1}`
        );

        this.add
          .image(worldX, worldY, spriteKey)
          .setOrigin(0)
          .setDisplaySize(
            a.xSize * this.map.tileWidth,
            a.ySize * this.map.tileHeight
          )
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
