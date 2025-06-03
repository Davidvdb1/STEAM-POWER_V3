const Currency = require("./currency");
const GameBuildings = require("./gameBuildings");
const Asset = require("./asset");
const Checkpoint = require("./checkpoint");
const Achievement = require("./achievement");

/**
 * Represents overall game statistics, including currency, buildings, checkpoints, assets, and achievements.
 *
 * @constructor
 * @param {Object} params - The parameters for the GameStatistics instance.
 * @param {string} [params.id] - The unique identifier of the game statistics record.
 * @param {Currency|null} params.currency - The currency state.
 * @param {GameBuildings[]} [params.gameBuildings=[]] - The list of game buildings.
 * @param {string} params.groupId - The group identifier.
 * @param {Checkpoint[]} [params.checkpoints=[]] - The list of checkpoints.
 * @param {Asset[]} [params.assets=[]] - The list of assets.
 * @param {Achievement[]} [params.achievements=[]] - The list of achievements.
 * @param {boolean} [validate=true] - Whether to validate the instance on creation.
 *
 * @throws {Error} If any of the properties are invalid.
 */
class GameStatistics {
  constructor(
    {
      id = undefined,
      currency,
      gameBuildings = [],
      groupId,
      checkpoints = [],
      assets = [],
      achievements = [],
    },
    validate = true
  ) {
    this.id = id;
    this.currency = currency;
    this.gameBuildings = gameBuildings;
    this.groupId = groupId;
    this.checkpoints = checkpoints;
    this.assets = assets;
    this.achievements = achievements;

    if (validate) this.validate();
  }

  /**
   * Validates the GameStatistics properties.
   *
   * @throws {Error} If `currency` is not a Currency instance when present,
   *                 if any element of `gameBuildings` is not a GameBuildings,
   *                 if `groupId` is not a string,
   *                 or if any element of `checkpoints`, `assets`, or `achievements` is not of the correct type.
   * @returns {void}
   */
  validate() {
    if (this.currency && !(this.currency instanceof Currency)) {
      throw new Error("Invalid currency (must be Currency)");
    }

    if (!Array.isArray(this.gameBuildings)) {
      throw new Error("Invalid gameBuildings (must be an array)");
    }
    for (const gb of this.gameBuildings) {
      if (!(gb instanceof GameBuildings)) {
        throw new Error("Invalid gameBuilding (must be GameBuildings)");
      }
    }

    if (typeof this.groupId !== "string") {
      throw new Error("Invalid groupId (must be string)");
    }

    if (!Array.isArray(this.checkpoints)) {
      throw new Error("Invalid checkpoints (must be an array)");
    }

    if (!Array.isArray(this.assets)) {
      throw new Error("Invalid assets (must be an array)");
    }

    if (!Array.isArray(this.achievements)) {
      throw new Error("Invalid achievements (must be an array)");
    }
    for (const achievement of this.achievements) {
      if (!(achievement instanceof Achievement)) {
        throw new Error("Invalid achievement (must be Achievement)");
      }
    }
  }

  /**
   * Custom JSON serialization to break circular references when stringifying.
   *
   * @returns {Object} A plain object suitable for JSON serialization.
   */
  toJSON() {
    return {
      id: this.id,
      currency: this.currency,
      gameBuildings: this.gameBuildings.map((gb) => ({
        id: gb.id,
        building: gb.building,
        buildingLevel: gb.buildingLevel,
        runsOnGreen: gb.runsOnGreen,
      })),
      groupId: this.groupId,
      checkpoints: this.checkpoints,
      assets: this.assets,
      achievements: this.achievements,
    };
  }

  /**
   * Creates a GameStatistics instance from a Prisma record.
   *
   * @static
   * @param {Object} prismaGS - The Prisma GameStatistics record.
   * @param {string} prismaGS.id - The unique identifier from Prisma.
   * @param {Object|null} prismaGS.currency - The related Prisma currency record.
   * @param {Object[]} [prismaGS.gameBuildings] - Array of related Prisma gameBuildings records.
   * @param {string} prismaGS.groupId - The group identifier from Prisma.
   * @param {Object[]} [prismaGS.checkpoints] - Array of related Prisma checkpoint records.
   * @param {Object[]} [prismaGS.assets] - Array of related Prisma asset records.
   * @param {Object[]} [prismaGS.achievements] - Array of related Prisma achievement records.
   * @returns {GameStatistics} The created GameStatistics instance.
   */
  static from(prismaGS) {
    const gs = new GameStatistics(
      {
        id: prismaGS.id,
        currency: prismaGS.currency ? Currency.from(prismaGS.currency) : null,
        gameBuildings: [],
        groupId: prismaGS.groupId,
        checkpoints: [],
        assets: [],
        achievements: [],
      },
      false
    );

    if (prismaGS.gameBuildings) {
      gs.gameBuildings = prismaGS.gameBuildings.map((gb) => {
        const gameBuildingObj = GameBuildings.from(gb);
        gameBuildingObj.gameStatisticsId = gs.id;
        return gameBuildingObj;
      });
    }

    if (prismaGS.checkpoints) {
      gs.checkpoints = prismaGS.checkpoints.map((c) => Checkpoint.from(c));
    }

    if (prismaGS.assets) {
      gs.assets = prismaGS.assets.map((a) => Asset.from(a));
    }

    if (prismaGS.achievements) {
      gs.achievements = prismaGS.achievements.map((a) => Achievement.from(a));
    }

    return gs;
  }
}

module.exports = GameStatistics;
