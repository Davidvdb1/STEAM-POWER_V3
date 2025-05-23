const Asset = require('./asset');

class Nature extends Asset {
  static allowedTypes = ['Buxus', 'Hulst', 'Eik', 'Beuk'];

  constructor({ id = undefined, buildCost, destroyCost, xLocation, yLocation, xSize, ySize, type }, validate = true) {
    super({ id, buildCost, destroyCost, energy: 0, xLocation, yLocation, xSize, ySize, type }, validate);
  }

  validate() {
    this._validateFields();
    if (!Nature.allowedTypes.includes(this.type)) {
      throw new Error(`Invalid nature type: ${this.type}`);
    }
  }

  static from(prismaNature) {
    return new Nature({
      id: prismaNature.id,
      buildCost: prismaNature.buildCost,
      destroyCost: prismaNature.destroyCost,
      xLocation: prismaNature.xLocation,
      yLocation: prismaNature.yLocation,
      xSize: prismaNature.xSize,
      ySize: prismaNature.ySize,
      type: prismaNature.type
    });
  }
}

module.exports = Nature;