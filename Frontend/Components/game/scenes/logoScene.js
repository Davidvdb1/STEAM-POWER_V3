// components/game/scenes/logoscene.js

export function createLogoScene(startBtn) {
  return class LogoScene extends Phaser.Scene {
    constructor() {
      super('LogoScene');
    }

    preload() {
      this.load.image('gameLogo', 'Assets/images/gameLogo.png');
    }

    create() {
      const { width, height } = this.sys.game.config;
      const img = this.textures.get('gameLogo').getSourceImage();
      const scale = Math.min(width / img.width, height / img.height);

      this.add
        .image(width / 2, height / 2, 'gameLogo')
        .setDisplaySize(img.width * scale, img.height * scale)
        .setOrigin(0.5);

      startBtn.classList.remove('hidden');
    }
  };
}
