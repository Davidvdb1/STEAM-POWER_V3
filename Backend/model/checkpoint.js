const Currency = require('./currency');
const Building = require('./building');
const Asset    = require('./asset');
const GameBuildings = require('./gameBuildings');
const GameStatistics = require('./gameStatistics');

class Checkpoint {
  constructor(
    { id = undefined, currency, gameBuildings = [], assets = [], gameStatisticsId = undefined },
    validate = true
  ) {
    this.id        = id;
    this.currency  = currency;
    this.gameBuildings = gameBuildings;
    this.assets    = assets;
    this.gameStatisticsId = gameStatisticsId;

    if (validate) this.validate();
  }

  validate() {
    if (!(this.currency instanceof Currency)) {
      throw new Error('Invalid currency (must be Currency)');
    }
    if (
      !Array.isArray(this.gameBuildings) ||
      !this.gameBuildings.every(b => b instanceof GameBuildings)
    ) {
      throw new Error('Invalid gameBuildings (must be GameBuildings[])');
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
      gameBuildings: (prismaCp.gameBuildings || []).map(GameBuildings.from),
      assets:    (prismaCp.assets || []).map(Asset.from),
      gameStatisticsId: prismaCp.gameStatisticsId,
    });
  }
}

module.exports = Checkpoint;
