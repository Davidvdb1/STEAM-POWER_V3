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
      this.events.once("shutdown", () => {
        if (this.layer1) this.layer1.destroy();
        if (this.layer2) this.layer2.destroy();
        if (this.map) this.map.destroy();
        "dragHighlight".forEach((p) => this[p] && this[p].destroy());
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

    _onRequestDestroyAsset(assetId) {
      const asset = this.assetObjects.find((o) => o.id === assetId);
      if (!asset) {
        console.warn(`Tried to delete asset ${assetId}, but couldn’t find it.`);
        return;
      }

      const type = asset.image.texture.key;
      const fullAssetData =
        this.sys.game.assetData?.find((a) => a.id === assetId) || {};
      const cost = fullAssetData.destroyCost ?? 0;
      const msg = `Wil je deze ${type} slopen voor ${cost} coins?`;

      this.showConfirmation(msg, (confirmed) => {
        if (confirmed) {
          this._performDestroyAsset(assetId);
        }
      });
    }

    async _performDestroyAsset(assetId) {
      try {
        const token = this.sys.game.token;
        const currencyId = this.sys.game.currencyId;

        const response = await removeAsset(assetId, token);

        handleAchievements(response, this.game.canvas);

        const cur = await getCurrencyById(currencyId, token);

        const fullAssetData =
          this.sys.game.assetData.find((a) => a.id === assetId) || {};
        const greyDelta =
          fullAssetData.type === "Kerncentrale" ? fullAssetData.energy : 0;

        const updatedCurrency = {
          greenEnergy: cur.greenEnergy,
          greyEnergy: cur.greyEnergy - greyDelta,
          coins: cur.coins - (fullAssetData.destroyCost || 0),
          score: cur.score,
        };

        await updateCurrency(currencyId, updatedCurrency, token);

        const idx = this.assetObjects.findIndex((o) => o.id === assetId);
        if (idx > -1) {
          const toRem = this.assetObjects[idx];
          toRem.image.destroy();
          releaseTiles(this.tileAssetMap, toRem.tx, toRem.ty, toRem.size);
          this.assetObjects.splice(idx, 1);
        }

        this._currencyNeedsRefresh = true;
      } catch (err) {
        console.error("Error destroying asset in scene:", err);
        this.showError("Kon asset niet slopen: " + err.message);
      }
    }
  };
}
