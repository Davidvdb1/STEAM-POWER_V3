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
  /**
   * Phaser Scene for the outer city map, handling asset management,
   * camera movement, and UI popups.
   * @class OuterCityScene
   * @extends Phaser.Scene
   */
  return class OuterCityScene extends Phaser.Scene {
    /**
     * Creates a new OuterCityScene instance.
     * @constructor
     * @memberof OuterCityScene
     */
    constructor() {
      super("OuterCityScene");
      this._onDestroyAsset = this._onDestroyAsset.bind(this);
    }

    /**
     * Initializes the scene with checkpoint data if available.
     * @param {Object} data - The checkpoint data containing assets and game statistics.
     * @param {string} data.gameStatisticsId - The ID of the game statistics.
     * @param {string} data.token - The token for the game session.
     * @param {Array} [data.assets] - Optional array of assets to carry over from the checkpoint.
     * @memberof OuterCityScene
     */
    init(data) {
      this.events.once("shutdown", () => {
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

    /**
     * Preloads the assets required for the outer city scene.
     * @memberof OuterCityScene
     */
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

    /**
     * Creates the outer city scene, setting up the map, layers,
     * camera bounds, movement keys, and asset management.
     * @memberof OuterCityScene
     * @return {void}
     * */
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

    /**
     * Clears all assets from the scene, removing their images.
     * @memberof OuterCityScene
     * @return {void}
     */
    clearAllAssets() {
      if (this.assetObjects) {
        this.assetObjects.forEach((o) => o.image.destroy());
      }
      this.assetObjects = [];
      this.tileAssetMap = {};
    }

    /**
     * Reloads checkpoint assets into the scene.
     * @memberof OuterCityScene
     * @return {void}
     */
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

    /**
     * Loads existing assets from the game data
     * into the scene, creating sprites for each asset.
     * @memberof OuterCityScene
     * @return {void}
     */
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

    /**
     * Updates the scene, handling movement keys and refreshing currency if needed.
     * @param {number} time - The current time in milliseconds.
     * @param {number} delta - The time since the last update in milliseconds.
     * @memberof OuterCityScene
     */
    update(time, delta) {
      handleMovementKeys(this, delta);

      if (this._currencyNeedsRefresh) {
        this._currencyNeedsRefresh = false;
        this.game.events.emit("forceStatsUpdate");
      }
    }

    /**
     * Handles the destruction of an asset, requesting the server to destroy it
     * and updating the scene accordingly.
     * @param {Event} e - The event containing asset details.
     * @memberof OuterCityScene
     */
    _onDestroyAsset(e) {
      requestDestroyAsset(this, e.detail.assetId, e.detail.destroyCost);
    }
  };
}
