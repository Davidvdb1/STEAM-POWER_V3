const Currency = require('./currency');
const Building = require('./building');
const Asset = require('./asset');

class Checkpoint {
  constructor({
    id = undefined,
    currency,
    buildings,
    assets,
  }, validate = true) {
    this.id = id;
    this.currency = currency;
    this.buildings = buildings;
    this.assets = assets;
    if (validate) this.validate();
  }

  validate() {
    if (!(this.currency instanceof Currency)) {
      throw new Error('Invalid currencies (must be a Currency instance)');
    }
    if (!(this.buildings instanceof Building)) {
      throw new Error('Invalid building (must be a Building instance)');
    }
    if (!Array.isArray(this.assets) || !this.assets.every(a => a instanceof Asset)) {
      throw new Error('Invalid assets (must be an array of Asset instances)');
    }
  }

  static from(prismaCheckpoint) {
    return new Checkpoint({
      id: prismaCheckpoint.id,
      currency: Currency.from(prismaCheckpoint.currencies),
      buildings: Building.from(prismaCheckpoint.building),
      assets: prismaCheckpoint.assets.map(Asset.from),
    });
  }
}

module.exports = Checkpoint;
