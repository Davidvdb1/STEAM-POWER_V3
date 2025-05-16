// components/game/scenes/outercityscene.js

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
      this.add.image(width / 2, height / 2, 'outerCity')
        .setDisplaySize(width, height)
        .setOrigin(0.5);
    }
  };
}
