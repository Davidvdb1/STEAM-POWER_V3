import {
  setCameraBounds,
  handleZoom,
  setMovementKeys,
  handleMovementKeys,
  handleMapDragging,
  setupMenuButton,
} from "../../utils/phaserSceneUtils.js";
import {
  setupAssetDragAndDrop,
  createAssetSprite,
  reserveTiles,
  releaseTiles,
  requestDestroyAsset,
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
      this._onDestroyAsset = this._onDestroyAsset.bind(this);
    }

    init(data) {
      this.events.once("shutdown", () => {
        if (this.layer1) this.layer1.destroy();
        if (this.layer2) this.layer2.destroy();
        if (this.map) this.map.destroy();

        if (this.dragHighlight) this.dragHighlight.destroy();

        document.removeEventListener(
          "scene:destroy-asset",
          this._onDestroyAsset
        );
      });

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

      setupAssetDragAndDrop(this);

      this.loadExistingAssets();

      setupMenuButton(this);

      document.addEventListener(
        "scene:destroy-asset",
        this._onDestroyAsset,
        false
      );
    }

    clearAllAssets() {
      if (this.assetObjects) {
        this.assetObjects.forEach((o) => o.image.destroy());
      }
      this.assetObjects = [];
      this.tileAssetMap = {};
    }

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

    update(time, delta) {
      handleMovementKeys(this, delta);

      if (this._currencyNeedsRefresh) {
        this._currencyNeedsRefresh = false;
        this.game.events.emit("forceStatsUpdate");
      }
    }

    _onDestroyAsset(e) {
      requestDestroyAsset(this, e.detail.assetId, e.detail.destroyCost);
    }
  };
}
