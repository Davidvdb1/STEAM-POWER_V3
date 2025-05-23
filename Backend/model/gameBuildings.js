const BuildingLevel = require("./buildingLevel");
const GameStatistics = require("./gameStatistics");

class GameBuildings {
  constructor(
    { id = undefined, gameStatistics, buildingLevels },
    validate = true
  ) {
    this.id = id;
    this.gameStatistics = gameStatistics;
    this.buildingLevels = buildingLevels;
    if (validate) this.validate();
  }

  static from(prismaGameBuilding) {
    return new GameBuilding({
      id: prismaGameBuilding.id,
      gameStatistics: GameStatistics.from(prismaGameBuilding.gameStatistics),
      buildingLevels: prismaGameBuilding.buildingLevels.map((buildingLevel) => BuildingLevel.from(buildingLevel)),
    });
  }
}

module.exports = GameBuildings;
