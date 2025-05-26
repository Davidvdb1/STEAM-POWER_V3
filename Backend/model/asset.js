class Asset {
  static allowedTypes = ['Windmolen', 'Waterrad', 'Zonnepaneel', 'Kerncentrale'];

  constructor({ id = undefined, buildCost, destroyCost, energy, xLocation, yLocation, xSize, ySize, type }, validate = true) {
    this.id = id;
    this.buildCost = buildCost;
    this.destroyCost = destroyCost;
    this.energy = energy;
    this.xLocation = xLocation;
    this.yLocation = yLocation;
    this.xSize = xSize;
    this.ySize = ySize;
    this.type = type;
    if (validate) this.validate();
  }

  _validateFields() {
    if (typeof this.buildCost !== 'number') throw new Error('Invalid buildCost');
    if (typeof this.destroyCost !== 'number') throw new Error('Invalid destroyCost');
    if (typeof this.energy !== 'number') throw new Error('Invalid energy');
    if (typeof this.xLocation !== 'number') throw new Error('Invalid xLocation');
    if (typeof this.yLocation !== 'number') throw new Error('Invalid yLocation');
    if (typeof this.xSize !== 'number') throw new Error('Invalid xSize');
    if (typeof this.ySize !== 'number') throw new Error('Invalid ySize');
    if (typeof this.type !== 'string') throw new Error('Invalid type');
  }

  validate() {
    this._validateFields();
    if (!Asset.allowedTypes.includes(this.type)) {
      throw new Error(`Invalid type: ${this.type}. Must be one of: ${Asset.allowedTypes.join(', ')}`);
    }
  }

  static from(prismaAsset) {
    const Nature = require('./nature');
    if (Nature.allowedTypes.includes(prismaAsset.type)) {
      return Nature.from(prismaAsset);
    }
    return new Asset({
      id: prismaAsset.id,
      buildCost: prismaAsset.buildCost,
      destroyCost: prismaAsset.destroyCost,
      energy: prismaAsset.energy,
      xLocation: prismaAsset.xLocation,
      yLocation: prismaAsset.yLocation,
      xSize: prismaAsset.xSize,
      ySize: prismaAsset.ySize,
      type: prismaAsset.type
    });
  }
}

module.exports = Asset;