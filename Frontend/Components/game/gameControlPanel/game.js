class CityScene extends Phaser.Scene {
  preload() {
    this.load.image('citymap',     'images/citymap.png');
    this.load.image('hospitalGrey','images/hospitalGrey.png');
    this.load.image('powerplant',  'images/powerplant.png');
  }

  create() {
    const mapImg = this.textures.get('citymap').getSourceImage();
    const mapW = mapImg.width;
    const mapH = mapImg.height;

    this.scale.resize(mapW, mapH);

    this.add.image(0, 0, 'citymap').setOrigin(0);

    const hx = 106, hy = 189, hw = 240, hh = 240;
    this.add.image(hx + hw/2, hy + hh/2, 'hospitalGrey')
      .setDisplaySize(hw, hh)
      .setOrigin(0.5);

    const px = 953, py = 396, pw = 240, ph = 240;
    this.add.image(px + pw/2, py + ph/2, 'powerplant')
      .setDisplaySize(pw, ph)
      .setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 456,
  scene: CityScene,
  backgroundColor: '#222',
  scale: {
    mode: Phaser.Scale.NONE,            
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
