//game.js
class LogoScene extends Phaser.Scene {
  preload() {
    this.load.image('gameLogo', 'images/gameLogo.png');
  }

  create() {
    const logoImg = this.textures.get('gameLogo').getSourceImage();
    this.scale.resize(logoImg.width, logoImg.height);

    this.add.image(0, 0, 'gameLogo').setOrigin(0);
  }
}

new Phaser.Game(config);
