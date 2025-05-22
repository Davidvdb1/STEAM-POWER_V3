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

  static from(prismaBuilding) {
    return new Building({
      id: prismaBuilding.id,
      building: Building.from(building),
      level: prismaBuilding.level,
      energyCost: prismaBuilding.energyCost,
      upgradeCost: prismaBuilding.upgradeCost,
      scoreDeduction: prismaBuilding.scoreDeduction,
    });
  }
}

module.exports = BuildingLevel;
