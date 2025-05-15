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
        .image(width / 2, height / 2, 'citymap')
        .setDisplaySize(width, height)
        .setOrigin(0.5);
    }
  };
}
