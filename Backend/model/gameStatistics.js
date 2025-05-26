const Currency = require('./currency');
const GameBuildings = require('./gameBuildings');
const Asset = require('./asset');
const Checkpoint = require('./checkpoint');

class GameStatistics {
  constructor(
    {
      id = undefined,
      currency,            
      gameBuildings = [],    
      groupId,             
      checkpoints = [],    
      assets = [], 
    },
    validate = true
  ) {
    this.id = id;
    this.currency = currency;
    this.gameBuildings = gameBuildings;
    this.groupId = groupId;
    this.checkpoints = checkpoints;
    this.assets = assets;

    if (validate) this.validate();
  }

  validate() {
    if (this.currency && !(this.currency instanceof Currency)) {
      throw new Error('Invalid currency (must be Currency)');
    }
    
    if (!Array.isArray(this.gameBuildings)) {
      throw new Error('Invalid gameBuildings (must be an array)');
    }
    
    for (const gb of this.gameBuildings) {
      if (!(gb instanceof GameBuildings)) {
        throw new Error('Invalid gameBuilding (must be GameBuildings)');
      }
    }
    
    if (typeof this.groupId !== 'string') {
      throw new Error('Invalid groupId (must be string)');
    }
    
    if (!Array.isArray(this.checkpoints)) {
      throw new Error('Invalid checkpoints (must be an array)');
    }
    
    if (!Array.isArray(this.assets)) {
      throw new Error('Invalid assets (must be an array)');
    }
  }

  // Add this method to break circular references when serializing
  toJSON() {
    return {
      id: this.id,
      currency: this.currency,
      gameBuildings: this.gameBuildings.map(gb => ({
        id: gb.id,
        building: gb.building,
        buildingLevel: gb.buildingLevel
        // Intentionally omitting gameStatistics reference
      })),
      groupId: this.groupId,
      checkpoints: this.checkpoints,
      assets: this.assets
    };
  }

  static from(prismaGS) {
    // Create without validation first
    const gs = new GameStatistics({
      id: prismaGS.id,
      currency: prismaGS.currency ? Currency.from(prismaGS.currency) : null,
      gameBuildings: [], // Start with empty array
      groupId: prismaGS.groupId,
      checkpoints: [],  // Start with empty array
      assets: [],       // Start with empty array
    }, false); // Skip validation
    
    // Populate arrays separately
    if (prismaGS.gameBuildings) {
      gs.gameBuildings = prismaGS.gameBuildings.map(gb => {
        const gameBuildingObj = GameBuildings.from(gb);
        // Set the game statistics reference after creation
        gameBuildingObj.gameStatistics = gs;
        return gameBuildingObj;
      });
    }
    
    if (prismaGS.checkpoints) {
      gs.checkpoints = prismaGS.checkpoints.map(c => Checkpoint.from(c));
    }
    
    if (prismaGS.assets) {
      gs.assets = prismaGS.assets.map(a => Asset.from(a));
    }
    
    return gs;
  }
}

module.exports = GameStatistics;
