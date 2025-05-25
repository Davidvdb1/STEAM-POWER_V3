class BuildingLevel {
  constructor(
    {
      id = undefined,
      buildingId,
      level,
      energyCost,
      upgradeCost,
      scoreDeduction,
    },
    validate = true
  ) {
    this.id = id;
    this.buildingId = buildingId;
    this.level = level;
    this.energyCost = energyCost;
    this.upgradeCost = upgradeCost;
    this.scoreDeduction = scoreDeduction;
    if (validate) this.validate();
  }

  validate() {
    if (this.buildingId && typeof this.buildingId !== "string") {
      throw new Error("Invalid buildingId");
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
    return new BuildingLevel(
      {
        id: prismaBuildingLevel.id,
        buildingId:
          prismaBuildingLevel.buildingId ||
          (prismaBuildingLevel.building ? prismaBuildingLevel.building.id : null),
        level: prismaBuildingLevel.level,
        energyCost: prismaBuildingLevel.energyCost,
        upgradeCost: prismaBuildingLevel.upgradeCost,
        scoreDeduction: prismaBuildingLevel.scoreDeduction,
      },
      true
    );
  }

  // Helper method to convert to JSON
  toJSON() {
    return {
      id: this.id,
      buildingId: this.buildingId,
      level: this.level,
      energyCost: this.energyCost,
      upgradeCost: this.upgradeCost,
      scoreDeduction: this.scoreDeduction,
    };
  }
}

module.exports = BuildingLevel;
