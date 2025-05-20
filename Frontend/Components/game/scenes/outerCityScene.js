import { addAsset, updateCurrency, getCurrencyById } from "../utils/gameService.js";

export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super({ key: "OuterCityScene" });
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
    }

    create() {
      this.map = this.make.tilemap({ key: "outerCityMap" });
      const tileset = this.map.addTilesetImage(
        "Modern_Exteriors_Complete_Tileset_Custom",
        "tilesetImage"
      );

      this.layer1 = this.map.createLayer("Layer-1", tileset);
      this.layer2 = this.map.createLayer("Layer-2", tileset);
      this.layer3 = this.map.createLayer("Layer-3", tileset);

      // Set camera boundaries to match the tilemap dimensions 
      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );

      // Set up keyboard input for camera navigation
      this.cursors = this.input.keyboard.createCursorKeys();
      this.WASD = this.input.keyboard.addKeys("Z,S,Q,D");

      // Enable zooming with mouse wheel
      this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
        let newZoom = this.cameras.main.zoom - dy * 0.001;
        this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 1, 2));
      });

      this.dragHighlight = this.add.graphics({ depth: 100 });

      const popupWidth = 700;
      const popupHeight = 300;
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      this.errorBg = this.add.graphics()
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

      this.errorText = this.add.text(
        centerX,
        centerY,
        "",
        {
          fontSize: '40px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: popupWidth - 32 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(200)
      .setScrollFactor(0)
      .setVisible(false);

      // Custom confirmation popup
      this.confirmBg = this.add.graphics()
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

      this.tileAssetMap = {};
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
      // Plaats visueel op kaart
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

      // console.log("Hello" + currencyId)
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

      (this.sys.game.assetData || []).forEach(a => {
        const wx = a.xLocation * this.map.tileWidth;
        const wy = a.yLocation * this.map.tileHeight;
        this.add.image(wx, wy, a.type)
          .setOrigin(0)
          .setDisplaySize(
            a.xSize * this.map.tileWidth,
            a.ySize * this.map.tileHeight
          );
        for (let dx=0; dx<a.xSize; dx++)
          for (let dy=0; dy<a.ySize; dy++)
            this.tileAssetMap[`${a.xLocation+dx},${a.yLocation+dy}`] = true;
      });
    }

    _placeAsset(type, tx, ty, size) {
      this.add.image(
        tx * this.map.tileWidth,
        ty * this.map.tileHeight,
        type
      )
      .setOrigin(0)
      .setDisplaySize(
        size.width * this.map.tileWidth,
        size.height * this.map.tileHeight
      )
      .setInteractive();

      for (let dx=0; dx<size.width; dx++){
        for (let dy=0; dy<size.height; dy++){
          this.tileAssetMap[`${tx+dx},${ty+dy}`] = true;
        }
      }

      this.dragHighlight.clear();
      this.draggedAssetType = null;
    }

    update(time, delta) {
      const speed = 300;
      const cam = this.cameras.main;
      if (this.cursors.left.isDown  || this.WASD.Q.isDown) cam.scrollX -= speed * delta/1000;
      if (this.cursors.right.isDown || this.WASD.D.isDown) cam.scrollX += speed * delta/1000;
      if (this.cursors.up.isDown    || this.WASD.Z.isDown) cam.scrollY -= speed * delta/1000;
      if (this.cursors.down.isDown  || this.WASD.S.isDown) cam.scrollY += speed * delta/1000;
      cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, this.map.widthInPixels - cam.width/cam.zoom);
      cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, this.map.heightInPixels - cam.height/cam.zoom);
    }
  };
}