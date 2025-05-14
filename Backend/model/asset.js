class Asset {
  constructor({
    id = undefined,
    buildCost,
    destroyCost,
    energy,
    xLocation,
    yLocation,
    xSize,
    ySize,
  }, validate = true) {
    this.id = id;
    this.buildCost = buildCost;
    this.destroyCost = destroyCost;
    this.energy = energy;
    this.xLocation = xLocation;
    this.yLocation = yLocation;
    this.xSize = xSize;
    this.ySize = ySize;
    if (validate) this.validate();
  }

  validate() {
    if (typeof this.buildCost !== 'number') {
      throw new Error('Invalid buildCost');
    }
    if (typeof this.destroyCost !== 'number') {
      throw new Error('Invalid destroyCost');
    }
    if (typeof this.energy !== 'number') {
      throw new Error('Invalid energy');
    }
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
  }

  static from(prismaAsset) {
    return new Asset({
      id: prismaAsset.id,
      buildCost: prismaAsset.buildCost,
      destroyCost: prismaAsset.destroyCost,
      energy: prismaAsset.energy,
      xLocation: prismaAsset.xLocation,
      yLocation: prismaAsset.yLocation,
      xSize: prismaAsset.xSize,
      ySize: prismaAsset.ySize,
    });
  }
}

module.exports = Asset;
