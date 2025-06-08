// components/game/scenes/logoscene.js

export function createLogoScene(startBtn) {
  /**
   * Phaser Scene for displaying the game start screen.
   * @class LogoScene
   * @extends Phaser.Scene
   */
  return class LogoScene extends Phaser.Scene {
    /**
     * Creates a new LogoScene instance.
     * @constructor
     * @memberof LogoScene
     */
    constructor() {
      super("LogoScene");
    }
    /**
     * Preloads the game logo image.
     * @memberof LogoScene
     */
    preload() {
      this.load.image("gameLogo", "Assets/images/gameLogo.png");
    }
    /**
     * Initializes the scene and sets up event listeners.
     * @memberof LogoScene
     */
    create() {
      const { width, height } = this.sys.game.config;
      const img = this.textures.get("gameLogo").getSourceImage();
      const scale = Math.min(width / img.width, height / img.height);

      this.add
        .image(width / 2, height / 2, "gameLogo")
        .setDisplaySize(img.width * scale, img.height * scale)
        .setOrigin(0.5);

      startBtn.classList.remove("hidden");
    }
  };
}
