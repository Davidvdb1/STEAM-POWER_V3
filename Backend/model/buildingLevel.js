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
    if (this.building && !(this.building instanceof Building)) {
      throw new Error("Invalid building (must be Building)");
    }
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
    // Skip validation during initial creation to avoid circular dependency issues
    const buildingLevel = new BuildingLevel(
      {
        id: prismaBuildingLevel.id,
        // Skip creating Building instance for now
        building: null,
        level: prismaBuildingLevel.level,
        energyCost: prismaBuildingLevel.energyCost,
        upgradeCost: prismaBuildingLevel.upgradeCost,
        scoreDeduction: prismaBuildingLevel.scoreDeduction,
      },
      false // Skip validation
    ); // Add building separately after creation
    if (prismaBuildingLevel.building) {
      buildingLevel.building = Building.from(prismaBuildingLevel.building);
    }

    return buildingLevel;
  }
}

module.exports = BuildingLevel;
