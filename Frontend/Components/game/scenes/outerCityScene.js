// components/game/gameControlPanel/scenes/outerCityScene.js

import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
} from "../utils/phaserSceneUtils.js";
import {
  addAsset,
  updateCurrency,
  getCurrencyById,
  removeAsset,
} from "../utils/gameService.js";

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super("OuterCityScene");
    }

    preload() {
      // Load the tilemap and tileset
      this.load.tilemapTiledJSON("outerCityMap", "Assets/json/buitenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
      // Load asset images
      this.load.image("Zonnepaneel", "Assets/images/solar_panel.png");
      this.load.image("Windmolen", "Assets/images/windturbine.png");
      this.load.image("Waterrad", "Assets/images/waterrad.png");
      this.load.image("Kerncentrale", "Assets/images/kerncentrale.png");
    }

    create() {
      console.log("OuterCityScene created");

      // State
      this.assetObjects = [];
      this.tileAssetMap = {};
      this.draggedAssetType = null;

      // Asset definitions
      this.assetSizes = {
        Kerncentrale: { width: 12, height: 10 },
        Windmolen:    { width: 6,  height: 10 },
        Waterrad:     { width: 7,  height: 8  },
        Zonnepaneel:  { width: 4,  height: 6  },
      };
      this.assetCosts = {
        Kerncentrale: 20,
        Windmolen:    20,
        Waterrad:     20,
        Zonnepaneel:  20,
      };

      // Create map layers
      this.map   = this.make.tilemap({ key: "outerCityMap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset_Custom",
        "tilesetImage"
      );
      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);

      // Camera & input setup
      setCameraBounds(this);
      handleZoom(this);
      setMovementKeys(this);

      // Highlights
      this.dragHighlight       = this.add.graphics({ depth: 100 });
      this.hoverMarker         = this.add.graphics({ depth:  99 });
      this.hoverTilesHighlight = this.add.graphics({ depth: 101 });

      // Error popup
      const popupWidth  = 700;
      const popupHeight = 300;
      const centerX     = this.cameras.main.width  / 2;
      const centerY     = this.cameras.main.height / 2;

      this.errorBg = this.add
        .graphics()
        .fillStyle(0x000000, 1)
        .fillRoundedRect(
          centerX - popupWidth/2,
          centerY - popupHeight/2,
          popupWidth,
          popupHeight,
          20
        )
        .setDepth(199)
        .setScrollFactor(0)
        .setVisible(false);

      this.errorText = this.add
        .text(centerX, centerY, "", {
          fontSize: "40px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: popupWidth - 32 },
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(200)
        .setScrollFactor(0)
        .setVisible(false);

      this.showError = (msg) => {
        this.errorBg.setVisible(true).setAlpha(1);
        this.errorText.setText(msg).setVisible(true).setAlpha(1);
        this.tweens.killTweensOf([this.errorBg, this.errorText]);
        this.tweens.add({
          targets: [this.errorBg, this.errorText],
          alpha:    { from: 1, to: 0 },
          delay:    2000,
          duration: 600,
          onComplete: () => {
            this.errorBg.setVisible(false).setAlpha(1);
            this.errorText.setVisible(false).setAlpha(1);
          },
        });
      };

      // Confirmation popup
      this.confirmBg = this.add
        .graphics()
        .fillStyle(0x222222, 0.9)
        .fillRoundedRect(
          centerX - popupWidth/2,
          centerY - popupHeight/2,
          popupWidth,
          popupHeight,
          20
        )
        .setDepth(299)
        .setScrollFactor(0)
        .setVisible(false);

      this.confirmText = this.add
        .text(centerX, centerY - 40, "", {
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
          fontStyle: "bold",
          wordWrap: { width: popupWidth - 50 },
        })
        .setOrigin(0.5)
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false);

      const buttonW = 180, buttonH = 60, pad = 20;

      this.confirmYesButton = this.add
        .graphics()
        .fillStyle(0x4caf50, 1)
        .fillRoundedRect(
          centerX - buttonW - pad,
          centerY + 40,
          buttonW,
          buttonH,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(
          new Phaser.Geom.Rectangle(
            centerX - buttonW - pad,
            centerY + 40,
            buttonW,
            buttonH
          ),
          Phaser.Geom.Rectangle.Contains
        );

      this.confirmYesText = this.add
        .text(
          centerX - buttonW/2 - pad,
          centerY + 40 + buttonH/2,
          "Ja",
          { fontSize: "28px", color: "#ffffff", align: "center", fontStyle: "bold" }
        )
        .setOrigin(0.5)
        .setDepth(301)
        .setScrollFactor(0)
        .setVisible(false);

      this.confirmNoButton = this.add
        .graphics()
        .fillStyle(0xf44336, 1)
        .fillRoundedRect(
          centerX + pad,
          centerY + 40,
          buttonW,
          buttonH,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(
          new Phaser.Geom.Rectangle(
            centerX + pad,
            centerY + 40,
            buttonW,
            buttonH
          ),
          Phaser.Geom.Rectangle.Contains
        );

      this.confirmNoText = this.add
        .text(
          centerX + buttonW/2 + pad,
          centerY + 40 + buttonH/2,
          "Nee",
          { fontSize: "28px", color: "#ffffff", align: "center", fontStyle: "bold" }
        )
        .setOrigin(0.5)
        .setDepth(301)
        .setScrollFactor(0)
        .setVisible(false);

      this.showConfirmation = (msg, callback) => {
        this.confirmBg.setVisible(true);
        this.confirmText.setText(msg).setVisible(true);
        this.confirmYesButton.setVisible(true);
        this.confirmYesText.setVisible(true);
        this.confirmNoButton.setVisible(true);
        this.confirmNoText.setVisible(true);
        this.input.keyboard.enabled = false;

        const onYes = () => { this.hideConfirmation(); callback(true); };
        const onNo  = () => { this.hideConfirmation(); callback(false); };

        this.confirmYesButton.off("pointerdown").on("pointerdown", onYes);
        this.confirmNoButton.off("pointerdown").on("pointerdown", onNo);
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

      // Set up drag & drop and load existing
      this.setupDragAndDrop();
      console.log("Game assets data:", this.sys.game.assetData);
      this.loadExistingAssets();
    }

    loadExistingAssets() {
      console.log("Loading existing assets");
      const assets = this.sys.game.assetData;
      if (!Array.isArray(assets)) return;

      assets.forEach(a => {
        console.log("Loading asset:", a);
        const wx = a.xLocation * this.map.tileWidth;
        const wy = a.yLocation * this.map.tileHeight;

        const sprite = this.add
          .image(wx, wy, a.type)
          .setOrigin(0)
          .setDisplaySize(
            a.xSize * this.map.tileWidth,
            a.ySize * this.map.tileHeight
          )
          .setInteractive()
          .on("pointerdown", () => {
            // DETAIL PANEL: emit and open
            this.game.events.emit("assetClicked", a.id);
          });

        for (let dx = 0; dx < a.xSize; dx++) {
          for (let dy = 0; dy < a.ySize; dy++) {
            this.tileAssetMap[`${a.xLocation + dx},${a.yLocation + dy}`] = true;
          }
        }

        this.assetObjects.push({
          id:   a.id,
          image: sprite,
          tx:   a.xLocation,
          ty:   a.yLocation,
          size: { width: a.xSize, height: a.ySize },
          type: a.type,
        });
      });

      console.log("Initialized tileAssetMap:", this.tileAssetMap);
    }

    setupDragAndDrop() {
      const canvas = this.game.canvas;
      let currentType = null;

      canvas.addEventListener("dragenter", e => {
        e.preventDefault();
        try {
          currentType = e.dataTransfer.getData("text/plain");
          this.draggedAssetType = currentType;
        } catch { }
      });

      canvas.addEventListener("dragover", e => {
        e.preventDefault();
        const type = this.draggedAssetType || currentType;
        if (!type) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = this.game.config.width  / rect.width;
        const scaleY = this.game.config.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const world = this.cameras.main.getWorldPoint(x, y);

        const tx = Math.floor(world.x / this.map.tileWidth);
        const ty = Math.floor(world.y / this.map.tileHeight);
        const size = this.assetSizes[type] || { width: 1, height: 1 };

        let canPlace = true;
        for (let dx = 0; dx < size.width; dx++) {
          for (let dy = 0; dy < size.height; dy++) {
            if (this.tileAssetMap[`${tx+dx},${ty+dy}`]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        this.dragHighlight
          .clear()
          .fillStyle(canPlace ? 0x00ff00 : 0xff0000, 0.4);

        for (let dx = 0; dx < size.width; dx++) {
          for (let dy = 0; dy < size.height; dy++) {
            this.dragHighlight.fillRect(
              (tx + dx) * this.map.tileWidth,
              (ty + dy) * this.map.tileHeight,
              this.map.tileWidth,
              this.map.tileHeight
            );
          }
        }
      });

      canvas.addEventListener("dragleave", () => {
        this.dragHighlight.clear();
      });

      canvas.addEventListener("drop", e => {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/plain");
        if (!type) {
          this.dragHighlight.clear();
          this.draggedAssetType = null;
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = this.game.config.width  / rect.width;
        const scaleY = this.game.config.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        const world = this.cameras.main.getWorldPoint(mx, my);

        const tx = Math.floor(world.x / this.map.tileWidth);
        const ty = Math.floor(world.y / this.map.tileHeight);
        const size = this.assetSizes[type] || { width: 1, height: 1 };

        let canPlace = true;
        for (let dx = 0; dx < size.width; dx++) {
          for (let dy = 0; dy < size.height; dy++) {
            if (this.tileAssetMap[`${tx+dx},${ty+dy}`]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (!canPlace) {
          this.showError("Kan hier niets plaatsen. Niet genoeg ruimte");
          this.dragHighlight.clear();
          this.draggedAssetType = null;
          return;
        }

        const cost = this.assetCosts[type] || 0;
        const msg  = `Wil je een ${type} hier plaatsen voor ${cost} coins?`;

        this.showConfirmation(msg, async confirmed => {
          if (!confirmed) {
            this.dragHighlight.clear();
            this.draggedAssetType = null;
            return;
          }
          try {
            const { gameStatisticsId, token, currencyId } = this.sys.game;
            // determine energy...
            const energy = (type === "Kerncentrale") ? 30 : 1;
            const assetData = {
              buildCost:   cost,
              destroyCost: cost,
              energy,
              xLocation: tx,
              yLocation: ty,
              xSize:     size.width,
              ySize:     size.height,
              type,
            };

            const currentCurrency = await getCurrencyById(currencyId, token);
            const updatedCurrency = {
              greenEnergy: currentCurrency.greenEnergy,
              greyEnergy:  currentCurrency.greyEnergy,
              coins:       currentCurrency.coins - cost,
            };

            // add to server
            const response = await addAsset(gameStatisticsId, assetData, token);
            const assetId  = response.id;

            // place locally
            this._placeAsset(type, tx, ty, size, assetId);

            // update currency on server
            await updateCurrency(currencyId, updatedCurrency, token);
          } catch (err) {
            console.error("Error placing asset:", err);
            this.showError("Plaatsen mislukt: " + err.message);
          } finally {
            this.dragHighlight.clear();
            this.draggedAssetType = null;
          }
        });
      });

      this.input.on("pointermove", pointer => {
        const world = pointer.positionToCamera(this.cameras.main);
        const tile  = this.layer1.getTileAtWorldXY(world.x, world.y);
        this.hoverMarker.clear();

        if (!tile) {
          this.hoverTilesHighlight.clear();
          return;
        }

        const tileW = this.map.tileWidth, tileH = this.map.tileHeight;
        const startX = tile.x - 1, startY = tile.y - 1;

        this.hoverMarker
          .lineStyle(1, 0x0000ff, 1)
          .fillStyle(0x0000ff, 0.3)
          .strokeRect(startX*tileW, startY*tileH, tileW*3, tileH*3)
          .fillRect(startX*tileW, startY*tileH, tileW*3, tileH*3);

        const under = this.assetObjects.find(a =>
          tile.x >= a.tx &&
          tile.x <  a.tx + a.size.width &&
          tile.y >= a.ty &&
          tile.y <  a.ty + a.size.height
        );

        this.hoverTilesHighlight.clear();
        if (under) {
          this.hoverTilesHighlight
            .fillStyle(0x00ff00, 0.3);
          for (let dx = 0; dx < under.size.width; dx++) {
            for (let dy = 0; dy < under.size.height; dy++) {
              this.hoverTilesHighlight.fillRect(
                (under.tx+dx)*tileW,
                (under.ty+dy)*tileH,
                tileW, tileH
              );
            }
          }
        }
      });
    }

    _placeAsset(type, tx, ty, size, assetId) {
      const sprite = this.add
        .image(tx * this.map.tileWidth, ty * this.map.tileHeight, type)
        .setOrigin(0)
        .setDisplaySize(
          size.width  * this.map.tileWidth,
          size.height * this.map.tileHeight
        )
        .setInteractive()
        .on("pointerdown", () => {
          // DETAIL PANEL: emit properly
          this.game.events.emit("assetClicked", assetId);
        });

      for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
          this.tileAssetMap[`${tx+dx},${ty+dy}`] = true;
        }
      }

      this.assetObjects.push({ id: assetId, image: sprite, tx, ty, size, type });
      this.showError(`${type} succesvol geplaatst!`);
    }

    _removeAsset(asset) {
      const idx = this.assetObjects.findIndex(a =>
        asset.id ? a.id === asset.id :
        a.tx === asset.tx && a.ty === asset.ty && a.type === asset.type
      );
      if (idx === -1) return;

      const toRem = this.assetObjects[idx];
      toRem.image.destroy();

      for (let dx = 0; dx < toRem.size.width; dx++) {
        for (let dy = 0; dy < toRem.size.height; dy++) {
          delete this.tileAssetMap[`${toRem.tx+dx},${toRem.ty+dy}`];
        }
      }

      this.assetObjects.splice(idx, 1);
      this.hoverTilesHighlight.clear();
    }

    update(time, delta) {
      handleMovementKeys(this, delta);
    }
  };
}
