const Level = require("./level");
const Building = require("./building");

class BuildingLevel {
  constructor(
    {
      id = undefined,
      building,
      level,
      energyCost,
      upgradeCost,
      scoreDeduction,
    },
    validate = true
  ) {
    this.id = id;
    this.building = building;
    this.level = level;
    this.energyCost = energyCost;
    this.upgradeCost = upgradeCost;
    this.scoreDeduction = scoreDeduction;
    if (validate) this.validate();
  }

  validate() {
    if (typeof this.level !== "number") {
      throw new Error("Invalid level");
    }
    if (typeof this.energyCost !== "number") {
      throw new Error("Invalid energy cost");
    }
    if (typeof this.upgradeCost !== "number") {
      throw new Error("Invalid upgrade cost");
    }
    if (typeof this.scoreDeduction !== "number") {
      throw new Error("Invalid score deduction");
    }
  }

  static from(prismaBuildingLevel) {
    return new BuildingLevel({
      id: prismaBuildingLevel.id,
      building: Building.from(prismaBuildingLevel.building),
      level: prismaBuildingLevel.level,
      energyCost: prismaBuildingLevel.energyCost,
      upgradeCost: prismaBuildingLevel.upgradeCost,
      scoreDeduction: prismaBuildingLevel.scoreDeduction,
    });
  }
}

module.exports = BuildingLevel;
