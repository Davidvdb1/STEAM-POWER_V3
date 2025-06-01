const Asset = require("./asset");

/**
 * Represents a Nature asset, which is a specific type of Asset with predefined allowed types.
 *
 * @extends Asset
 * @constructor
 * @param {Object} params - The parameters for creating a Nature instance.
 * @param {string} [params.id] - The unique identifier for the nature asset.
 * @param {number} params.buildCost - The cost to build the nature asset.
 * @param {number} params.destroyCost - The cost to destroy the nature asset.
 * @param {number} params.xLocation - The x-coordinate location of the asset.
 * @param {number} params.yLocation - The y-coordinate location of the asset.
 * @param {number} params.xSize - The width of the asset.
 * @param {number} params.ySize - The height of the asset.
 * @param {string} params.type - The type of nature asset (must be one of `Nature.allowedTypes`).
 * @param {boolean} [validate=true] - Whether to validate the input parameters.
 *
 * @throws {Error} If the type is not one of the allowed nature types.
 */
class Nature extends Asset {
  constructor(
    {
      id = undefined,
      buildCost,
      destroyCost,
      xLocation,
      yLocation,
      xSize,
      ySize,
      type,
    },
    validate = true
  ) {
    super(
      {
        id,
        buildCost,
        destroyCost,
        energy: 0,
        xLocation,
        yLocation,
        xSize,
        ySize,
        type,
      },
      validate
    );
  }

  /**
   * Validates the fields of the Nature instance and ensures the type is allowed.
   *
   * @instance
   * @memberof Nature#
   * @throws {Error} If `type` is not one of `Nature.allowedTypes`.
   * @returns {void}
   */
  validate() {
    this._validateFields();
    if (!Nature.allowedTypes.includes(this.type)) {
      throw new Error(`Invalid nature type: ${this.type}`);
    }
  }

  /**
   * Creates a Nature instance from a Prisma nature object.
   *
   * @static
   * @memberof Nature
   * @param {Object} prismaNature - The Prisma nature object.
   * @param {string} prismaNature.id - The unique identifier from Prisma.
   * @param {number} prismaNature.buildCost - The build cost from Prisma.
   * @param {number} prismaNature.destroyCost - The destroy cost from Prisma.
   * @param {number} prismaNature.xLocation - The x-coordinate from Prisma.
   * @param {number} prismaNature.yLocation - The y-coordinate from Prisma.
   * @param {number} prismaNature.xSize - The width from Prisma.
   * @param {number} prismaNature.ySize - The height from Prisma.
   * @param {string} prismaNature.type - The type from Prisma (must be one of `Nature.allowedTypes`).
   * @returns {Nature} The created Nature instance.
   */
  static from(prismaNature) {
    return new Nature({
      id: prismaNature.id,
      buildCost: prismaNature.buildCost,
      destroyCost: prismaNature.destroyCost,
      xLocation: prismaNature.xLocation,
      yLocation: prismaNature.yLocation,
      xSize: prismaNature.xSize,
      ySize: prismaNature.ySize,
      type: prismaNature.type,
    });
  }
}

/**
 * The allowed types of Nature assets.
 *
 * @type {string[]}
 * @static
 * @memberof Nature
 */
Nature.allowedTypes = ["Buxus", "Hulst", "Eik", "Beuk"];

module.exports = Nature;
