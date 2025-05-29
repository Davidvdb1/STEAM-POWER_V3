// gameBuildings.js
const Building      = require('./building');
const BuildingLevel = require('./buildingLevel');

class GameBuildings {
  constructor({
    id = undefined,
    gameStatisticsId = null,
    checkpointId     = null,
    building,
    buildingLevel,
  }, validate = true) {
    this.id               = id;
    this.gameStatisticsId = gameStatisticsId;
    this.checkpointId     = checkpointId;
    this.building         = building;
    this.buildingLevel    = buildingLevel;

    if (validate) this.validate();
  }

  validate() {
    if (!(this.building instanceof Building)) {
      throw new Error('Invalid building (must be Building)');
    }
    if (!(this.buildingLevel instanceof BuildingLevel)) {
      throw new Error('Invalid buildingLevel (must be BuildingLevel)');
    }
  }

  static from(prismaGB) {
    return new GameBuildings({
      id:               prismaGB.id,
      gameStatisticsId: prismaGB.gameStatisticsId,
      checkpointId:     prismaGB.checkpointId,
      building:         prismaGB.building       ? Building.from(prismaGB.building)       : null,
      buildingLevel:    prismaGB.buildingLevel  ? BuildingLevel.from(prismaGB.buildingLevel) : null,
    });
  }
}

module.exports = GameBuildings;
