/**
 * Represents a BuildingLevel with energy cost, upgrade cost, and score deduction.
 *
 * @constructor
 * @param {Object} params - The parameters for the BuildingLevel.
 * @param {string} [params.id] - The unique identifier of the building level.
 * @param {string} [params.buildingId] - The identifier of the associated building.
 * @param {number} params.level - The level number.
 * @param {number} params.energyCost - The energy cost for this level.
 * @param {number} params.upgradeCost - The cost to upgrade to this level.
 * @param {number} params.scoreDeduction - The score deduction for this level.
 * @param {boolean} [validate=true] - Whether to validate the instance on creation.
 *
 * @throws {Error} If any of the properties are of the wrong type.
 */
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

  /**
   * Validates the BuildingLevel properties.
   *
   * @throws {Error} If `buildingId` is not a string when present,
   *                 or if any numeric property is not a number.
   * @returns {void}
   */
  validate() {
    if (this.buildingId != null && typeof this.buildingId !== "string") {
      throw new Error("Invalid buildingId");
    }
    if (typeof this.level !== "number") {
      throw new Error("Invalid level");
    }
    if (typeof this.energyCost !== "number") {
      throw new Error("Invalid energyCost");
    }
    if (typeof this.upgradeCost !== "number") {
      throw new Error("Invalid upgradeCost");
    }
    if (typeof this.scoreDeduction !== "number") {
      throw new Error("Invalid scoreDeduction");
    }
  }

  /**
   * Creates a BuildingLevel instance from a Prisma building level object.
   *
   * @static
   * @param {Object} prismaBuildingLevel - The Prisma BuildingLevel record.
   * @param {string} prismaBuildingLevel.id - The unique identifier from Prisma.
   * @param {string} [prismaBuildingLevel.buildingId] - The building ID from Prisma.
   * @param {Object} [prismaBuildingLevel.building] - Related building object, if loaded.
   * @param {number} prismaBuildingLevel.level - The level number.
   * @param {number} prismaBuildingLevel.energyCost - The energy cost.
   * @param {number} prismaBuildingLevel.upgradeCost - The upgrade cost.
   * @param {number} prismaBuildingLevel.scoreDeduction - The score deduction.
   * @returns {BuildingLevel} The created BuildingLevel instance.
   */
  static from(prismaBuildingLevel) {
    return new BuildingLevel(
      {
        id: prismaBuildingLevel.id,
        buildingId:
          prismaBuildingLevel.buildingId ||
          (prismaBuildingLevel.building && prismaBuildingLevel.building.id),
        level: prismaBuildingLevel.level,
        energyCost: prismaBuildingLevel.energyCost,
        upgradeCost: prismaBuildingLevel.upgradeCost,
        scoreDeduction: prismaBuildingLevel.scoreDeduction,
      },
      true
    );
  }
}

module.exports = BuildingLevel;
