const Currency = require('./currency');
const Building = require('./building');
const Asset    = require('./asset');

class Checkpoint {
  constructor(
    { id = undefined, currency, buildings = [], assets = [] },
    validate = true
  ) {
    this.id        = id;
    this.currency  = currency;
    this.buildings = buildings;
    this.assets    = assets;

    if (validate) this.validate();
  }

  validate() {
    if (!(this.currency instanceof Currency)) {
      throw new Error('Invalid currency (must be Currency)');
    }
    if (
      !Array.isArray(this.buildings) ||
      !this.buildings.every(b => b instanceof Building)
    ) {
      throw new Error('Invalid buildings (must be Building[])');
    }
    if (
      !Array.isArray(this.assets) ||
      !this.assets.every(a => a instanceof Asset)
    ) {
      throw new Error('Invalid assets (must be Asset[])');
    }
  }

  static from(prismaCp) {
    return new Checkpoint({
      id:        prismaCp.id,
      currency:  Currency.from(prismaCp.currency),
      buildings: prismaCp.buildings.map(Building.from),
      assets:    prismaCp.assets.map(Asset.from),
    });
  }
}

module.exports = Checkpoint;
