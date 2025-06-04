import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
} from "../../utils/phaserSceneUtils.js";
import {
  setupAssetDragAndDrop,
  createAssetSprite,
  reserveTiles,
  releaseTiles,
} from "../../utils/assetHandler.js";
import {
  createErrorPopup,
  createConfirmationPopup,
} from "../../utils/uiPopups.js";
import { createCheckpointLoadPopup } from "../../utils/checkpointLoadPopup.js";

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super("OuterCityScene");
    }

    init(data) {
      // 1) Pre-shutdown hook:
      this.events.once("shutdown", () => {
        if (this.layer1) this.layer1.destroy();
        if (this.layer2) this.layer2.destroy();
        if (this.map) this.map.destroy();
        "dragHighlight".forEach((p) => this[p] && this[p].destroy());
      });

      // 2) Clear and inject checkpoint data:
      this.assetObjects = [];
      this.tileAssetMap = {};
      if (data.assets) {
        this.checkpointAssets = data.assets;
        this.sys.game.gameStatisticsId = data.gameStatisticsId;
        this.sys.game.token = data.token;
      }
    }

    preload() {
      this.load.tilemapTiledJSON("outerCityMap", "Assets/json/buitenstad.json");
      this.load.image(
        "tilesetImage",
        "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png"
      );
      this.load.image("Zonnepaneel", "Assets/images/solar_panel.png");
      this.load.image("Windmolen", "Assets/images/windturbine.png");
      this.load.image("Waterrad", "Assets/images/waterrad.png");
      this.load.image("Kerncentrale", "Assets/images/kerncentrale.png");
      this.load.image("Eik", "Assets/images/Eik.png");
      this.load.image("Beuk", "Assets/images/Beuk.png");
      this.load.image("Buxus", "Assets/images/Buxus.png");
      this.load.image("Hulst", "Assets/images/Hulst.png");
    }

    create() {
      this.map = this.make.tilemap({ key: "outerCityMap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset_Custom",
        "tilesetImage"
      );
      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);

      setCameraBounds(this);
      handleZoom(this);
      setMovementKeys(this);
      handleMapDragging(this);

      this.dragHighlight = this.add.graphics({ depth: 100 });

      createErrorPopup(this);
      createConfirmationPopup(this);
      createCheckpointLoadPopup(this);

      // Setup asset placement functionality
      setupAssetDragAndDrop(this);

      this.loadExistingAssets();
    }

    // call this to completely wipe out your old assets (sprites & tile reservations)
    clearAllAssets() {
      // destroy each sprite
      if (this.assetObjects) {
        this.assetObjects.forEach((o) => o.image.destroy());
      }
      // reset arrays/maps
      this.assetObjects = [];
      this.tileAssetMap = {};
    }

    // call this *after* setting checkpointAssets; it simply draws them on the existing map
    reloadCheckpointAssets() {
      const assets = Array.isArray(this.checkpointAssets)
        ? this.checkpointAssets
        : this.sys.game.assetData;
      if (!Array.isArray(assets)) return;
      assets.forEach((a) => {
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
            this.isDragging = false;
            this.game.events.emit("assetClicked", a.id);
          });
        reserveTiles(this.tileAssetMap, a.xLocation, a.yLocation, {
          width: a.xSize,
          height: a.ySize,
        });
        this.assetObjects.push({
          id: a.id,
          image: sprite,
          tx: a.xLocation,
          ty: a.yLocation,
          size: { width: a.xSize, height: a.ySize },
          type: a.type,
        });
      });
    }

    loadExistingAssets() {
      // Prefer checkpointAssets if provided, else fallback
      const assets = Array.isArray(this.checkpointAssets)
        ? this.checkpointAssets
        : this.sys.game.assetData;
      if (!Array.isArray(assets)) return;

      assets.forEach((a) => {
        const assetData = createAssetSprite(
          this,
          a.type,
          a.xLocation,
          a.yLocation,
          { width: a.xSize, height: a.ySize },
          a.id
        );

        this.assetObjects.push(assetData);
      });
    }

    // Remove an asset from the map
    _removeAsset(asset) {
      const idx = this.assetObjects.findIndex((a) =>
        asset.id
          ? a.id === asset.id
          : a.tx === asset.tx && a.ty === asset.ty && a.type === asset.type
      );

      if (idx === -1) return;

      const toRem = this.assetObjects[idx];
      toRem.image.destroy();

      releaseTiles(this.tileAssetMap, toRem.tx, toRem.ty, toRem.size);
      this.assetObjects.splice(idx, 1);
    }

    update(time, delta) {
      handleMovementKeys(this, delta);
    }
  };
}
