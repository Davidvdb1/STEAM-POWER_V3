/**
 * Represents the player’s currency state, including green energy, grey energy, coins, and score.
 *
 * @constructor
 * @param {Object} params - The parameters for the currency state.
 * @param {string} [params.id] - The unique identifier of the currency record.
 * @param {number} [params.greenEnergy=Currency.DEFAULT_GREEN_ENERGY] - The amount of green energy.
 * @param {number} [params.greyEnergy=Currency.DEFAULT_GREY_ENERGY] - The amount of grey energy.
 * @param {number} [params.coins=Currency.STARTING_COINS] - The number of coins.
 * @param {number} [params.score=Currency.STARTING_SCORE] - The score.
 *
 * @throws {Error} If any of the numeric properties are not numbers.
 */
class Currency {
  static DEFAULT_GREEN_ENERGY = 0;
  static DEFAULT_GREY_ENERGY = 0;
  static STARTING_COINS = 1000;
  static STARTING_SCORE = 0;

  constructor(
    {
      id = undefined,
      greenEnergy = Currency.DEFAULT_GREEN_ENERGY,
      greyEnergy = Currency.DEFAULT_GREY_ENERGY,
      coins = Currency.STARTING_COINS,
      score = Currency.STARTING_SCORE,
    },
    validate = true
  ) {
    this.id = id;
    this.greenEnergy = greenEnergy;
    this.greyEnergy = greyEnergy;
    this.coins = coins;
    this.score = score;

    if (validate) {
      this.validate();
    }
  }

  /**
   * Validates the Currency properties.
   *
   * @throws {Error} If any of `greenEnergy`, `greyEnergy`, `coins`, or `score` is not a number.
   * @returns {void}
   */
  validate() {
    if (typeof this.greenEnergy !== "number") {
      throw new Error("Invalid greenEnergy");
    }
    if (typeof this.greyEnergy !== "number") {
      throw new Error("Invalid greyEnergy");
    }
    if (typeof this.coins !== "number") {
      throw new Error("Invalid coins");
    }
    if (typeof this.score !== "number") {
      throw new Error("Invalid score");
    }
  }

  /**
   * Creates a Currency instance from a Prisma currency object.
   *
   * @static
   * @param {Object} prismaCurrency - The Prisma currency record.
   * @param {string} prismaCurrency.id - The unique identifier from Prisma.
   * @param {number} prismaCurrency.greenEnergy - The green energy value.
   * @param {number} prismaCurrency.greyEnergy - The grey energy value.
   * @param {number} prismaCurrency.coins - The coins value.
   * @param {number} prismaCurrency.score - The score value.
   * @returns {Currency} The created Currency instance.
   */
  static from(prismaCurrency) {
    return new Currency({
      id: prismaCurrency.id,
      greenEnergy: prismaCurrency.greenEnergy,
      greyEnergy: prismaCurrency.greyEnergy,
      coins: prismaCurrency.coins,
      score: prismaCurrency.score,
    });
  }
}

module.exports = Currency;
