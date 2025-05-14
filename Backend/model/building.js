const Level = require('./level');

class Building {
  constructor({
    id = undefined,
    xLocation,
    yLocation,
    xSize,
    ySize,
    level,
  }, validate = true) {
    this.id = id;
    this.xLocation = xLocation;
    this.yLocation = yLocation;
    this.xSize = xSize;
    this.ySize = ySize;
    this.level = level;
    if (validate) this.validate();
  }

  validate() {
    if (typeof this.xLocation !== 'number') {
      throw new Error('Invalid xLocation');
    }
    if (typeof this.yLocation !== 'number') {
      throw new Error('Invalid yLocation');
    }
    if (typeof this.xSize !== 'number') {
      throw new Error('Invalid xSize');
    }
    if (typeof this.ySize !== 'number') {
      throw new Error('Invalid ySize');
    }
    if (!(this.level instanceof Level)) {
      throw new Error('Invalid level (must be a Level instance)');
    }
  }

  static from(prismaBuilding) {
    return new Building({
      id: prismaBuilding.id,
      xLocation: prismaBuilding.xLocation,
      yLocation: prismaBuilding.yLocation,
      xSize: prismaBuilding.xSize,
      ySize: prismaBuilding.ySize,
      level: Level.from(prismaBuilding.level),
    });
  }
}

module.exports = Building;
