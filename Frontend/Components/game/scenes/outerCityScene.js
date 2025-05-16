export function createOuterCityScene() {
  return class OuterCityScene extends Phaser.Scene {
    constructor() {
      super('OuterCityScene');
    }

    preload() {
      this.load.image('outerCity', 'Assets/images/outerCityTest.jpg');
    }

    create() {
      const { width, height } = this.sys.game.config;

      this.add
        .image(width/2, height/2, 'outerCity')
        .setDisplaySize(width, height)
        .setOrigin(0.5);

      const assets = this.sys.game.assetData || [];

      const tileSize = 32;

      assets.forEach(a => {
        const px = a.xLocation * tileSize;
        const py = a.yLocation * tileSize;
        const pw = a.xSize     * tileSize;
        const ph = a.ySize     * tileSize;

        this.add
          .rectangle(px, py, pw, ph, 0x0000ff, 0.3)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            console.log(`Clicked asset ${a.id}`);
            // TODO: open asset UI
          });
      });
    }
  };
}
