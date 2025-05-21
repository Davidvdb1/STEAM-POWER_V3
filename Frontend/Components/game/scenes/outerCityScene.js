import { setCameraBounds, handleZoom, setMovementKeys, handleMovementKeys } from "../utils/phaserSceneUtils.js";
import { addAsset, updateCurrency, getCurrencyById, removeAsset } from "../utils/gameService.js";

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super("OuterCityScene");
    }


    preload() {
      // Load the tilemap, tileset image and assets
      this.load.tilemapTiledJSON("outerCityMap", "Assets/json/buitenstad.json");
      this.load.image("tilesetImage", "Assets/images/Modern_Exteriors_Complete_Tileset_Custom.png");
      this.load.image("Zonnepaneel", "Assets/images/solar_panel.png");
      this.load.image("Windmolen", "Assets/images/windturbine.png");
      this.load.image("Waterrad", "Assets/images/waterrad.png");
      this.load.image("Kerncentrale", "Assets/images/kerncentrale.png");
    }


    create() {
      this.assetObjects = [];
      this.tileAssetMap = {};

      // Set up the tilemap and its layers
      this.map = this.make.tilemap({ key: "outerCityMap" });
      const tileset = this.map.addTilesetImage("Modern_Exteriors_Complete_Tileset_Custom", "tilesetImage");

      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);

      // Set camera boundaries to match the tilemap dimensions 
      setCameraBounds(this);

      // Enable zooming with mouse wheel
      handleZoom(this);

      // Set up keyboard input for camera navigation
      setMovementKeys(this);

      this.dragHighlight = this.add.graphics({ depth: 100 });
      this.hoverMarker = this.add.graphics({ depth: 99 });
      this.hoverTilesHighlight = this.add.graphics({ depth: 101 });


      const popupWidth = 700;
      const popupHeight = 300;
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.errorBg = this.add
        .graphics()
        .fillStyle(0x000000, 1)
        .fillRoundedRect(
          centerX - popupWidth / 2,
          centerY - popupHeight / 2,
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
        .setOrigin(0.5, 0.5)
        .setDepth(200)
        .setScrollFactor(0)
        .setVisible(false);

      this.confirmBg = this.add
        .graphics()
        .fillStyle(0x222222, 0.9)
        .fillRoundedRect(
          centerX - popupWidth / 2,
          centerY - popupHeight / 2,
          popupWidth,
          popupHeight,
          20
        )
        .setDepth(299)
        .setScrollFactor(0)
        .setVisible(false);

      this.confirmText = this.add.text(
        centerX,
        centerY - 40,
        "",
        {
          fontSize: '32px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold',
          wordWrap: { width: popupWidth - 50 }
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(300)
      .setScrollFactor(0)
      .setVisible(false);

      const buttonWidth = 180;
      const buttonHeight = 60;
      const padding = 20;

      this.confirmYesButton = this.add.graphics()
        .fillStyle(0x4CAF50, 1)
        .fillRoundedRect(
          centerX - buttonWidth - padding,
          centerY + 40,
          buttonWidth,
          buttonHeight,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(new Phaser.Geom.Rectangle(
          centerX - buttonWidth - padding,
          centerY + 40,
          buttonWidth,
          buttonHeight
        ), Phaser.Geom.Rectangle.Contains);

      this.confirmYesText = this.add.text(
        centerX - buttonWidth/2 - padding,
        centerY + 40 + buttonHeight/2,
        "Ja",
        {
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(301)
      .setScrollFactor(0)
      .setVisible(false);

      this.confirmNoButton = this.add.graphics()
        .fillStyle(0xF44336, 1)
        .fillRoundedRect(
          centerX + padding,
          centerY + 40,
          buttonWidth,
          buttonHeight,
          10
        )
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(new Phaser.Geom.Rectangle(
          centerX + padding,
          centerY + 40,
          buttonWidth,
          buttonHeight
        ), Phaser.Geom.Rectangle.Contains);

      this.confirmNoText = this.add.text(
        centerX + buttonWidth/2 + padding,
        centerY + 40 + buttonHeight/2,
        "Nee",
        {
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(301)
      .setScrollFactor(0)
      .setVisible(false);

      const assetSizes = {
        Kerncentrale: { width: 12, height: 10 },
        Windmolen:    { width:  6, height: 10 },
        Waterrad:     { width:  7, height:  8 },
        Zonnepaneel:  { width:  4, height:  6 },
      };
      const assetCosts = {
        Kerncentrale: 20,
        Windmolen:    20,
        Waterrad:     20,
        Zonnepaneel:  20,
      };

      this.showError = (msg) => {
        this.errorBg.setVisible(true).setAlpha(1);
        this.errorText.setText(msg).setVisible(true).setAlpha(1);
        this.tweens.killTweensOf([this.errorBg, this.errorText]);
        this.tweens.add({
          targets: [this.errorBg, this.errorText],
          alpha: { from: 1, to: 0 },
          delay: 2000,
          duration: 600,
          onComplete: () => {
            this.errorBg.setVisible(false).setAlpha(1);
            this.errorText.setVisible(false).setAlpha(1);
          }
        });
      };

      this.showConfirmation = (msg, callback) => {
        this.confirmBg.setVisible(true);
        this.confirmText.setText(msg).setVisible(true);
        this.confirmYesButton.setVisible(true);
        this.confirmYesText.setVisible(true);
        this.confirmNoButton.setVisible(true);
        this.confirmNoText.setVisible(true);
        
        this.input.keyboard.enabled = false;
        
        const onYesClick = () => {
          this.hideConfirmation();
          callback(true);
        };
        
        const onNoClick = () => {
          this.hideConfirmation();
          callback(false);
        };
        
        this.confirmYesButton.off('pointerdown');
        this.confirmNoButton.off('pointerdown');
        
        this.confirmYesButton.on('pointerdown', onYesClick);
        this.confirmNoButton.on('pointerdown', onNoClick);
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

      const canvas = this.game.canvas;

      canvas.addEventListener('dragenter', e => {
        e.preventDefault();
        this.draggedAssetType = e.dataTransfer.getData('text/plain');
      });

      canvas.addEventListener('dragover', e => {
        e.preventDefault();
        if (!this.draggedAssetType) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const world = this.cameras.main.getWorldPoint(mx, my);
        const tx = Math.floor(world.x / this.map.tileWidth);
        const ty = Math.floor(world.y / this.map.tileHeight);
        const size = assetSizes[this.draggedAssetType] || { width:1, height:1 };
        this.dragHighlight.clear().fillStyle(0x00ff00, 0.4);
        for (let dx=0; dx<size.width; dx++)
          for (let dy=0; dy<size.height; dy++)
            this.dragHighlight.fillRect(
              (tx+dx)*this.map.tileWidth,
              (ty+dy)*this.map.tileHeight,
              this.map.tileWidth,
              this.map.tileHeight
            );
      });

      canvas.addEventListener('dragleave', () => {
        this.draggedAssetType = null;
        this.dragHighlight.clear();
      });

      canvas.addEventListener('drop', e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const world = this.cameras.main.getWorldPoint(mx, my);
        const tx = Math.floor(world.x / this.map.tileWidth);
        const ty = Math.floor(world.y / this.map.tileHeight);
        const size = assetSizes[type] || { width:1, height:1 };

        let canPlace = true;
        for (let dx=0; dx<size.width; dx++){
          for (let dy=0; dy<size.height; dy++){
            if (this.tileAssetMap[`${tx+dx},${ty+dy}`]){
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (!canPlace) {
          this.showError('Kan hier niets plaatsen. Niet genoeg ruimte');
          this.dragHighlight.clear();
          this.draggedAssetType = null;
          return;
        }

        const cost = assetCosts[type] || 0;
        const msg = `Wil je een ${type} hier plaatsen voor ${cost} coins?`;
        
        this.showConfirmation(msg, async (confirmed) => {
          if (confirmed) {
            try {
              this._placeAsset(type, tx, ty, size);

              const gameStatsId = this.sys.game.gameStatisticsId;
              const groupId = this.sys.game.groupId;
              const token = this.sys.game.token;
              const currencyId = this.sys.game.currencyId;

              const assetData = {
                buildCost: cost,
                destroyCost: cost,
                energy: 10,
                xLocation: tx,
                yLocation: ty,
                xSize: size.width,
                ySize: size.height,
                type
              };

              const currentCurrencyData = await getCurrencyById(currencyId, token)
              
              const currencyData = {
                greenEnergy: currentCurrencyData.greenEnergy,
                greyEnergy: currentCurrencyData.greyEnergy,
                coins: currentCurrencyData.coins - cost
              };

              console.log("Hello" + currencyId)
              await addAsset(gameStatsId, assetData, token);
              await updateCurrency(currencyId, currencyData, token);
            } catch (err) {
              this.showError("Plaatsen mislukt: " + err.message);
            }
          }

          this.dragHighlight.clear();
          this.draggedAssetType = null;
        });
      });

      this.input.on("pointermove", (pointer) => {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const tile = this.layer1.getTileAtWorldXY(worldPoint.x, worldPoint.y);

        this.hoverMarker.clear();

        if (!tile) {
          this.hoverTilesHighlight.clear();
          this.hoveredTile = null;
          return;
        }

        if (
          !this.hoveredTile ||
          this.hoveredTile.x !== tile.x ||
          this.hoveredTile.y !== tile.y
        ) {
          this.hoveredTile = tile;

          this.hoverMarker.lineStyle(1, 0x0000ff, 1);
          this.hoverMarker.fillStyle(0x0000ff, 0.3);

          const tileW = this.map.tileWidth;
          const tileH = this.map.tileHeight;
          const startX = tile.x - 1;
          const startY = tile.y - 1;

          this.hoverMarker.strokeRect(
            startX * tileW,
            startY * tileH,
            tileW * 3,
            tileH * 3
          );
          this.hoverMarker.fillRect(
            startX * tileW,
            startY * tileH,
            tileW * 3,
            tileH * 3
          );

          const assetUnderPointer = this.assetObjects.find((asset) => {
            return (
              tile.x >= asset.tx &&
              tile.x < asset.tx + asset.size.width &&
              tile.y >= asset.ty &&
              tile.y < asset.ty + asset.size.height
            );
          });

          if (assetUnderPointer) {
            this.hoverTilesHighlight.clear();
            this.hoverTilesHighlight.fillStyle(0x00ff00, 0.3);

            for (let dx = 0; dx < assetUnderPointer.size.width; dx++) {
              for (let dy = 0; dy < assetUnderPointer.size.height; dy++) {
                this.hoverTilesHighlight.fillRect(
                  (assetUnderPointer.tx + dx) * tileW,
                  (assetUnderPointer.ty + dy) * tileH,
                  tileW,
                  tileH
                );
              }
            }
          } else {
            this.hoverTilesHighlight.clear();
          }
        }
      });

      (this.sys.game.assetData || []).forEach((a) => {
        const wx = a.xLocation * this.map.tileWidth;
        const wy = a.yLocation * this.map.tileHeight;
        const asset = this.add
          .image(wx, wy, a.type)
          .setOrigin(0)
          .setDisplaySize(
            a.xSize * this.map.tileWidth,
            a.ySize * this.map.tileHeight
          )
          .setInteractive()
          .on("pointerdown", () => {
            // open detail panel
            this.game.events.emit("assetClicked", a.id);
            return;

            const msg = `Wil je deze ${a.type} verwijderen?`;
            this.showConfirmation(msg, async (confirmed) => {
              if (confirmed) {
                try {
                  await removeAsset(a.id, this.sys.game.token);
                  
                  this._removeAsset(a);
                  
                  this.showError(`${a.type} succesvol verwijderd!`);
                } catch (err) {
                  console.error("Fout bij verwijderen:", err);
                  this.showError("Verwijderen mislukt: " + err.message);
                }
              } else {
                console.log("Actie geannuleerd");
              }
            });
          });

        for (let dx = 0; dx < a.xSize; dx++)
          for (let dy = 0; dy < a.ySize; dy++)
            this.tileAssetMap[`${a.xLocation + dx},${a.yLocation + dy}`] = true;

        this.assetObjects.push({
          id: a.id,
          image: asset,
          tx: a.xLocation,
          ty: a.yLocation,
          size: { width: a.xSize, height: a.ySize },
          type: a.type,
        });
      });
    }


    update(time, delta) {
      handleMovementKeys(this, delta);
    }


    _placeAsset(type, tx, ty, size) {
      const image = this.add
        .image(tx * this.map.tileWidth, ty * this.map.tileHeight, type)
        .setOrigin(0)
        .setDisplaySize(
          size.width * this.map.tileWidth,
          size.height * this.map.tileHeight
        )
        .setInteractive()
        .on("pointerdown", () => {
          // open detail panel for newly placed asset
          this.game.events.emit("assetClicked", null);
          return;

          const msg = `Wil je deze ${type} verwijderen?`;
          this.showConfirmation(msg, (confirmed) => {
            if (confirmed) {
              console.log(`${type} bevestigd geklikt`);
            } else {
              console.log("Actie geannuleerd");
            }
          });
        });

      for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
          this.tileAssetMap[`${tx + dx},${ty + dy}`] = true;
        }
      }

      this.assetObjects.push({
        image,
        tx,
        ty,
        size,
        type,
      });

      this.dragHighlight.clear();
      this.draggedAssetType = null;
    }
    
    _removeAsset(asset) {
      const assetIndex = this.assetObjects.findIndex(a => {
        if (asset.id && a.id) {
          return a.id === asset.id;
        }
        return a.tx === asset.tx && a.ty === asset.ty && a.type === asset.type;
      });
      
      if (assetIndex !== -1) {
        const assetToRemove = this.assetObjects[assetIndex];
        
        assetToRemove.image.destroy();
        
        for (let dx = 0; dx < assetToRemove.size.width; dx++) {
          for (let dy = 0; dy < assetToRemove.size.height; dy++) {
            delete this.tileAssetMap[`${assetToRemove.tx + dx},${assetToRemove.ty + dy}`];
          }
        }
        
        this.assetObjects.splice(assetIndex, 1);
        
        this.hoverTilesHighlight.clear();
      }
    }
  };
}
