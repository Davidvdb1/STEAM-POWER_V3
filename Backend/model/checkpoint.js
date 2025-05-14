const Currency = require('./currency');
const Building = require('./building');
const Asset = require('./asset');

class Checkpoint {
  constructor({
    id = undefined,
    currencies,
    building,
    assets,
  }, validate = true) {
    this.id = id;
    this.currencies = currencies;
    this.building = building;
    this.assets = assets;
    if (validate) this.validate();
  }

  validate() {
    if (!(this.currencies instanceof Currency)) {
      throw new Error('Invalid currencies (must be a Currency instance)');
    }
    if (!(this.building instanceof Building)) {
      throw new Error('Invalid building (must be a Building instance)');
    }
    if (!Array.isArray(this.assets) || !this.assets.every(a => a instanceof Asset)) {
      throw new Error('Invalid assets (must be an array of Asset instances)');
    }
  }

  static from(prismaCheckpoint) {
    return new Checkpoint({
      id: prismaCheckpoint.id,
      currencies: Currency.from(prismaCheckpoint.currencies),
      building: Building.from(prismaCheckpoint.building),
      assets: prismaCheckpoint.assets.map(Asset.from),
    });
  }
}

module.exports = Checkpoint;
