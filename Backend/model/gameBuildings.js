// gameBuildings.js
const Building = require("./building");
const BuildingLevel = require("./buildingLevel");

/**
 * Represents a GameBuildings record, linking a building and its level to a checkpoint or game statistics.
 *
 * @constructor
 * @param {Object} params - The parameters for the GameBuildings instance.
 * @param {string} [params.id] - The unique identifier of the game‐building record.
 * @param {string|null} [params.gameStatisticsId=null] - The associated game statistics ID, if any.
 * @param {string|null} [params.checkpointId=null] - The associated checkpoint ID, if any.
 * @param {Building|null} params.building - The Building instance.
 * @param {BuildingLevel} params.buildingLevel - The BuildingLevel instance.
 * @param {boolean} [params.runsOnGreen=false] - Whether this building is running on green energy.
 * @param {boolean} [validate=true] - Whether to validate the instance on creation.
 *
 * @throws {Error} If any of the properties are invalid.
 */
class GameBuildings {
  constructor(
    {
      id = undefined,
      gameStatisticsId = null,
      checkpointId = null,
      building,
      buildingLevel,
      runsOnGreen = false,
    },
    validate = true
  ) {
    this.id = id;
    this.gameStatisticsId = gameStatisticsId;
    this.checkpointId = checkpointId;
    this.building = building;
    this.buildingLevel = buildingLevel;
    this.runsOnGreen = runsOnGreen;

    if (validate) this.validate();
  }

  /**
   * Validates the GameBuildings properties.
   *
   * @throws {Error} If `gameStatisticsId` is not a string when present,
   *                 if `checkpointId` is not a string when present,
   *                 if `building` is not a Building instance,
   *                 if `buildingLevel` is not a BuildingLevel instance,
   *                 or if `runsOnGreen` is not a boolean.
   * @returns {void}
   */
  validate() {
    if (
      this.gameStatisticsId != null &&
      typeof this.gameStatisticsId !== "string"
    ) {
      throw new Error("Invalid gameStatisticsId (must be a string)");
    }
    if (this.checkpointId != null && typeof this.checkpointId !== "string") {
      throw new Error("Invalid checkpointId (must be a string)");
    }
    if (this.building != null && !(this.building instanceof Building)) {
      throw new Error("Invalid building (must be Building)");
    }
    if (!(this.buildingLevel instanceof BuildingLevel)) {
      throw new Error("Invalid buildingLevel (must be BuildingLevel)");
    }
    if (typeof this.runsOnGreen !== "boolean") {
      throw new Error("Invalid runsOnGreen (must be a boolean)");
    }
  }

  /**
   * Creates a GameBuildings instance from a Prisma gameBuildings object.
   *
   * @static
   * @param {Object} prismaGB - The Prisma GameBuildings record.
   * @param {string} prismaGB.id - The unique identifier from Prisma.
   * @param {string|null} prismaGB.gameStatisticsId - The game statistics ID from Prisma.
   * @param {string|null} prismaGB.checkpointId - The checkpoint ID from Prisma.
   * @param {boolean} prismaGB.runsOnGreen - Whether this building is running on green energy in Prisma.
   * @param {Object} [prismaGB.building] - The related Prisma Building record.
   * @param {Object} [prismaGB.buildingLevel] - The related Prisma BuildingLevel record.
   * @returns {GameBuildings} The created GameBuildings instance.
   */
static from(prismaGameBuilding) {
  return new GameBuildings({
    id: prismaGameBuilding.id,
    gameStatisticsId: prismaGameBuilding.gameStatisticsId,
    checkpointId: prismaGameBuilding.checkpointId,
    building: prismaGameBuilding.building ? Building.from(prismaGameBuilding.building) : null,
    buildingLevel: prismaGameBuilding.buildingLevel ? BuildingLevel.from(prismaGameBuilding.buildingLevel) : null,
    runsOnGreen: prismaGameBuilding.runsOnGreen ?? false,
  });
}
}

module.exports = GameBuildings;
