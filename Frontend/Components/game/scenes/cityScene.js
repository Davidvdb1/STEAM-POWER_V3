// components/game/scenes/cityscene.js

export function createCityScene() {
  return class CityScene extends Phaser.Scene {
    constructor() {
      super('CityScene');
    }

    preload() {
      this.load.image('citymap', 'Assets/images/citymap.png');
    }

    create() {
      const { width, height } = this.sys.game.config;

      this.add
        .image(width/2, height/2, 'citymap')
        .setDisplaySize(width, height)
        .setOrigin(0.5);

      const tileSize = 32;

      const zones = this.game.buildingData || [];

      zones.forEach(b => {
        const px = b.xLocation * tileSize;
        const py = b.yLocation * tileSize;
        const pw = b.xSize     * tileSize;
        const ph = b.ySize     * tileSize;

        this.add
          .rectangle(px, py, pw, ph, 0x0000ff, 0.3)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            console.log(`Clicked building ${b.id}`);
            // TODO: open that building's UI
          });
      });
    }
  };
}
