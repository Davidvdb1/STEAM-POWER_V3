const BuildingLevel = require("./buildingLevel");
const GameStatistics = require("./gameStatistics");

class gameBuildings {
  constructor(
    { id = undefined, gameStatistics, buildingLevels },
    validate = true
  ) {
    this.id = id;
    this.gameStatisctics = gameStatistics;
    this.buildingLevels = buildingLevels;
    if (validate) this.validate();
  }

  static from(prismaBuilding) {
    return new Building({
      id: prismaBuilding.id,
      gameStatistics: GameStatistics.from(prismaBuilding.gameStatistics),
      buildingLevels: buildingLevels.map((buildingLevel) => BuildingLevel.from(buildingLevel)),
    });
  }
}

module.exports = GameBuildings;
