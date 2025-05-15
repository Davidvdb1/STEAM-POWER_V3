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

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scene: LogoScene,
  backgroundColor: '#222',
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
