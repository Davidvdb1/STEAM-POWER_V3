// scenes/outerCityScene.js

import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging
} from "../utils/phaserSceneUtils.js";

import {
  addAsset,
  updateCurrency,
  getCurrencyById
} from "../utils/gameService.js";

import { ASSETS } from "../utils/assetConfig.js";
import {
  canPlaceAsset,
  reserveTiles,
  releaseTiles
} from "../utils/assetPlacer.js";
import {
  createErrorPopup,
  createConfirmationPopup
} from "../utils/uiPopups.js";

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super("OuterCityScene");
    }

    preload() {
      this.load.tilemapTiledJSON("outerCityMap", "Assets/json/buitenstad.json");
      this.load.image("tilesetImage", "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png");
      Object.keys(ASSETS).forEach(asset => {
        this.load.image(asset, `Assets/images/${asset.toLowerCase()}.png`);
      });
    }

    create() {
      console.log("OuterCityScene created");
      this.assetObjects = [];
      this.tileAssetMap = {};
      this.draggedAssetType = null;

      this.map = this.make.tilemap({ key: "outerCityMap" });
      const tileset = this.map.addTilesetImage("Modern_Exteriors_Complete_Tileset_Custom", "tilesetImage");
      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);

      setCameraBounds(this);
      handleZoom(this);
      setMovementKeys(this);
      handleMapDragging(this);

      this.dragHighlight       = this.add.graphics({ depth: 100 });
      this.hoverMarker         = this.add.graphics({ depth:  99 });
      this.hoverTilesHighlight = this.add.graphics({ depth: 101 });

      createErrorPopup(this);
      createConfirmationPopup(this);

      this.setupDragAndDrop();
      this.loadExistingAssets();
    }

    loadExistingAssets() {
      const assets = this.sys.game.assetData;
      if (!Array.isArray(assets)) return;

      assets.forEach(a => {
        const wx = a.xLocation * this.map.tileWidth;
        const wy = a.yLocation * this.map.tileHeight;

        const sprite = this.add.image(wx, wy, a.type)
          .setOrigin(0)
          .setDisplaySize(
            a.xSize * this.map.tileWidth,
            a.ySize * this.map.tileHeight
          )
          .setInteractive()
          .on("pointerdown", () => {
            this.isDragging = false;
            this.game.events.emit("assetClicked", a.id);
          });

        reserveTiles(this.tileAssetMap, a.xLocation, a.yLocation, {
          width: a.xSize,
          height: a.ySize
        });

        this.assetObjects.push({
          id: a.id,
          image: sprite,
          tx: a.xLocation,
          ty: a.yLocation,
          size: { width: a.xSize, height: a.ySize },
          type: a.type
        });
      });
    }

    setupDragAndDrop() {
      const canvas = this.game.canvas;
      let currentType = null;

      canvas.addEventListener("dragenter", e => {
        e.preventDefault();
        try {
          currentType = e.dataTransfer.getData("text/plain");
          this.draggedAssetType = currentType;
        } catch {}
      });

      canvas.addEventListener("dragover", e => {
        e.preventDefault();
        const type = this.draggedAssetType || currentType;
        if (!type) return;

        const [tx, ty] = this._getTileFromEvent(e);
        const size = ASSETS[type];

        const canPlace = canPlaceAsset(this.tileAssetMap, tx, ty, size);

        this.dragHighlight.clear().fillStyle(canPlace ? 0x00ff00 : 0xff0000, 0.4);
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

      canvas.addEventListener("drop", async e => {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/plain");
        if (!type) return;

        const [tx, ty] = this._getTileFromEvent(e);
        const size = ASSETS[type];
        const cost = size.cost;

        const canPlace = canPlaceAsset(this.tileAssetMap, tx, ty, size);
        if (!canPlace) {
          this.showError("Kan hier niets plaatsen. Niet genoeg ruimte");
          this.dragHighlight.clear();
          this.draggedAssetType = null;
          return;
        }

        const msg = `Wil je een ${type} hier plaatsen voor ${cost} coins?`;
        this.showConfirmation(msg, async confirmed => {
          if (!confirmed) {
            this.dragHighlight.clear();
            this.draggedAssetType = null;
            return;
          }
          try {
            const { gameStatisticsId, token, currencyId } = this.sys.game;
            const currentCurrency = await getCurrencyById(currencyId, token);
            const updatedCurrency = {
              greenEnergy: currentCurrency.greenEnergy,
              greyEnergy:  currentCurrency.greyEnergy,
              coins:       currentCurrency.coins - cost
            };

            const response = await addAsset(gameStatisticsId, {
              buildCost: cost,
              destroyCost: cost,
              energy: size.energy,
              xLocation: tx,
              yLocation: ty,
              xSize: size.width,
              ySize: size.height,
              type
            }, token);

            this._placeAsset(type, tx, ty, size, response.id);
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
        const tile = this.layer1.getTileAtWorldXY(world.x, world.y);
        this.hoverMarker.clear();
        if (!tile || this.isDragging) return;

        const { tileWidth: tw, tileHeight: th } = this.map;
        const startX = tile.x - 1, startY = tile.y - 1;

        this.hoverMarker.lineStyle(1, 0x0000ff, 1)
          .fillStyle(0x0000ff, 0.3)
          .strokeRect(startX*tw, startY*th, tw*3, th*3)
          .fillRect(startX*tw, startY*th, tw*3, th*3);

        const under = this.assetObjects.find(a =>
          tile.x >= a.tx && tile.x < a.tx + a.size.width &&
          tile.y >= a.ty && tile.y < a.ty + a.size.height
        );

        this.hoverTilesHighlight.clear();
        if (under) {
          this.hoverTilesHighlight.fillStyle(0x00ff00, 0.3);
          for (let dx = 0; dx < under.size.width; dx++) {
            for (let dy = 0; dy < under.size.height; dy++) {
              this.hoverTilesHighlight.fillRect(
                (under.tx+dx)*tw,
                (under.ty+dy)*th,
                tw, th
              );
            }
          }
        }
      });
    }

    _placeAsset(type, tx, ty, size, assetId) {
      const sprite = this.add.image(tx * this.map.tileWidth, ty * this.map.tileHeight, type)
        .setOrigin(0)
        .setDisplaySize(size.width * this.map.tileWidth, size.height * this.map.tileHeight)
        .setInteractive()
        .on("pointerdown", () => this.game.events.emit("assetClicked", assetId));

      reserveTiles(this.tileAssetMap, tx, ty, size);
      this.assetObjects.push({ id: assetId, image: sprite, tx, ty, size, type });
      this.showError(`${type} succesvol geplaatst!`);
    }

    update(time, delta) {
      handleMovementKeys(this, delta);
    }

    _getTileFromEvent(e) {
      const rect = this.game.canvas.getBoundingClientRect();
      const scaleX = this.game.config.width / rect.width;
      const scaleY = this.game.config.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const world = this.cameras.main.getWorldPoint(x, y);
      return [
        Math.floor(world.x / this.map.tileWidth),
        Math.floor(world.y / this.map.tileHeight)
      ];
    }
  };
}
