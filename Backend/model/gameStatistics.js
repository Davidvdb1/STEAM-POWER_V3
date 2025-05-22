const Currency   = require('./currency');
const Building   = require('./building');
const Asset      = require('./asset');
const Checkpoint = require('./checkpoint');

class GameStatistics {
  constructor(
    {
      id          = undefined,
      currency,            
      buildings   = [],    
      groupId,             
      checkpoints = [],    
      assets      = [],    
    },
    validate = true
  ) {
    this.id          = id;
    this.currency    = currency;
    this.buildings   = buildings;
    this.groupId     = groupId;
    this.checkpoints = checkpoints;
    this.assets      = assets;

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
    if (typeof this.groupId !== 'string') {
      throw new Error('Invalid groupId (must be string)');
    }
    if (
      !Array.isArray(this.checkpoints) ||
      !this.checkpoints.every(c => c instanceof Checkpoint)
    ) {
      throw new Error('Invalid checkpoints (must be Checkpoint[])');
    }
    if (
      !Array.isArray(this.assets) ||
      !this.assets.every(a => a instanceof Asset)
    ) {
      throw new Error('Invalid assets (must be Asset[])');
    }
  }

  static from(prismaGS) {
    return new GameStatistics({
      id:          prismaGS.id,
      currency:    Currency.from(prismaGS.currency),
      buildings:   (prismaGS.buildings ?? []).map(Building.from),
      groupId:     prismaGS.groupId,
      checkpoints: (prismaGS.checkpoints ?? []).map(Checkpoint.from),
      assets:      (prismaGS.assets ?? []).map(Asset.from),
    });
  }

}

module.exports = GameStatistics;
