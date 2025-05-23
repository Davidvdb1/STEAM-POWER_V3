const BuildingLevel = require("./buildingLevel");
const Building = require("./building");
// Don't import GameStatistics directly to avoid circular dependency
// const GameStatistics = require("./gameStatistics");

class GameBuildings {
  constructor(
    { id = undefined, gameStatistics, building, buildingLevel },
    validate = true
  ) {
    this.id = id;
    this.gameStatistics = gameStatistics;
    this.building = building;
    this.buildingLevel = buildingLevel;
    
    if (validate) this.validate();
  }

  validate() {
    // Check type without using instanceof for GameStatistics to avoid circular dependency
    if (this.gameStatistics && typeof this.gameStatistics !== 'object') {
      throw new Error('Invalid gameStatistics (must be an object)');
    }
    if (this.building && !(this.building instanceof Building)) {
      throw new Error('Invalid building (must be Building)');
    }
    if (this.buildingLevel && !(this.buildingLevel instanceof BuildingLevel)) {
      throw new Error('Invalid buildingLevel (must be BuildingLevel)');
    }
  }

  static from(prismaGameBuilding) {
    // Skip validation during initial creation
    const gameBuilding = new GameBuildings({
      id: prismaGameBuilding.id,
      gameStatistics: null, // Don't convert GameStatistics to avoid circular dependency
      building: null,
      buildingLevel: null
    }, false);

    // Set properties after creation
    if (prismaGameBuilding.building) {
      gameBuilding.building = Building.from(prismaGameBuilding.building);
    }
    
    if (prismaGameBuilding.buildingLevel) {
      gameBuilding.buildingLevel = BuildingLevel.from(prismaGameBuilding.buildingLevel);
    }
    
    return gameBuilding;
  }

  toJSON() {
    return {
      id: this.id,
      building: this.building,
      buildingLevel: this.buildingLevel
      // Intentionally omitting gameStatistics reference
    };
  }
}

module.exports = GameBuildings;
