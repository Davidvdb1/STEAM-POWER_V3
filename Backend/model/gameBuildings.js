const BuildingLevel = require("./buildingLevel");
const Building = require("./building");

class GameBuildings {
  constructor(
    { id = undefined, gameStatisticsId, building, buildingLevel },
    validate = true
  ) {
    this.id = id;
    this.gameStatisticsId = gameStatisticsId;
    this.building = building;
    this.buildingLevel = buildingLevel;
    
    if (validate) this.validate();
  }

  validate() {
    // Check type without using instanceof for GameStatistics to avoid circular dependency
    if (this.gameStatisticsId && typeof this.gameStatisticsId !== 'string') {
      throw new Error('Invalid gameStatistics (must be a string)');
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
      gameStatisticsId: prismaGameBuilding.gameStatisticsId,
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
}

module.exports = GameBuildings;
