const Currency = require("./currency");
const Building = require("./building");
const Asset = require("./asset");
const GameBuildings = require("./gameBuildings");
const GameStatistics = require("./gameStatistics");

/**
 * Represents a Checkpoint, grouping currency, buildings, assets, and a reference to game statistics.
 *
 * @constructor
 * @param {Object} params - The parameters for the checkpoint.
 * @param {string} [params.id] - The unique identifier of the checkpoint.
 * @param {Currency} params.currency - The currency state at this checkpoint.
 * @param {GameBuildings[]} [params.gameBuildings=[]] - The list of game buildings.
 * @param {Asset[]} [params.assets=[]] - The list of assets.
 * @param {string} [params.gameStatisticsId] - The associated game statistics ID.
 *
 * @throws {Error} If any of the properties are invalid.
 */
class Checkpoint {
  constructor(
    {
      id = undefined,
      currency,
      gameBuildings = [],
      assets = [],
      gameStatisticsId = undefined,
    },
    validate = true
  ) {
    this.id = id;
    this.currency = currency;
    this.gameBuildings = gameBuildings;
    this.assets = assets;
    this.gameStatisticsId = gameStatisticsId;

    if (validate) this.validate();
  }

  /**
   * Validates the checkpoint properties.
   *
   * @throws {Error} If `currency` is not a Currency instance,
   *                 or if `gameBuildings` is not an array of GameBuildings,
   *                 or if `assets` is not an array of Asset.
   * @returns {void}
   */
  validate() {
    if (!(this.currency instanceof Currency)) {
      throw new Error("Invalid currency (must be Currency)");
    }
    if (
      !Array.isArray(this.gameBuildings) ||
      !this.gameBuildings.every((b) => b instanceof GameBuildings)
    ) {
      throw new Error("Invalid gameBuildings (must be GameBuildings[])");
    }
    if (
      !Array.isArray(this.assets) ||
      !this.assets.every((a) => a instanceof Asset)
    ) {
      throw new Error("Invalid assets (must be Asset[])");
    }
  }

  /**
   * Creates a Checkpoint instance from a Prisma checkpoint object.
   *
   * @static
   * @param {Object} prismaCp - The Prisma checkpoint record.
   * @param {string} prismaCp.id - The unique identifier from Prisma.
   * @param {Object} prismaCp.currency - The Prisma currency record.
   * @param {Object[]} [prismaCp.gameBuildings] - Array of Prisma game buildings records.
   * @param {Object[]} [prismaCp.assets] - Array of Prisma asset records.
   * @param {string} [prismaCp.gameStatisticsId] - The game statistics ID from Prisma.
   * @returns {Checkpoint} The created Checkpoint instance.
   */
  static from(prismaCp) {
    return new Checkpoint({
      id: prismaCp.id,
      currency: Currency.from(prismaCp.currency),
      gameBuildings: (prismaCp.gameBuildings || []).map(GameBuildings.from),
      assets: (prismaCp.assets || []).map(Asset.from),
      gameStatisticsId: prismaCp.gameStatisticsId,
    });
  }
}

module.exports = Checkpoint;
