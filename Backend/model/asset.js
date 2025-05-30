/**
 * Represents an Asset in the system, such as a Windmolen, Waterrad, Zonnepaneel, or Kerncentrale.
 *
 * @constructor
 * @param {Object} params - The asset parameters.
 * @param {string} [params.id] - The unique identifier of the asset.
 * @param {number} params.buildCost - The cost to build the asset.
 * @param {number} params.destroyCost - The cost to destroy the asset.
 * @param {number} params.energy - The energy produced by the asset.
 * @param {number} params.xLocation - The X coordinate of the asset's location.
 * @param {number} params.yLocation - The Y coordinate of the asset's location.
 * @param {number} params.xSize - The width of the asset.
 * @param {number} params.ySize - The height of the asset.
 * @param {string} params.type - The type of the asset. Must be one of `Asset.allowedTypes`.
 * @param {number|null} [params.gameStatisticsId=null] - The associated game statistics ID, if any.
 * @param {number|null} [params.checkpointId=null] - The associated checkpoint ID, if any.
 * @param {boolean} [validate=true] - Whether to validate the asset fields upon creation.
 *
 * @throws {Error} If any of the required fields are invalid.
 */
class Asset {
  /**
   * The allowed asset types.
   *
   * @type {string[]}
   * @static
   */
  static allowedTypes = [
    "Windmolen",
    "Waterrad",
    "Zonnepaneel",
    "Kerncentrale",
  ];

  constructor(
    {
      id = undefined,
      buildCost,
      destroyCost,
      energy,
      xLocation,
      yLocation,
      xSize,
      ySize,
      type,
      gameStatisticsId = null,
      checkpointId = null,
    },
    validate = true
  ) {
    this.id = id;
    this.buildCost = buildCost;
    this.destroyCost = destroyCost;
    this.energy = energy;
    this.xLocation = xLocation;
    this.yLocation = yLocation;
    this.xSize = xSize;
    this.ySize = ySize;
    this.type = type;
    this.gameStatisticsId = gameStatisticsId;
    this.checkpointId = checkpointId;

    if (validate) this.validate();
  }

  /**
   * Performs low-level field checks; throws on the first invalid field.
   *
   * @private
   * @throws {Error} If any individual field is invalid.
   * @returns {void}
   */
  _validateFields() {
    if (typeof this.buildCost !== "number")
      throw new Error("Invalid buildCost");
    if (typeof this.destroyCost !== "number")
      throw new Error("Invalid destroyCost");
    if (typeof this.energy !== "number") throw new Error("Invalid energy");
    if (typeof this.xLocation !== "number")
      throw new Error("Invalid xLocation");
    if (typeof this.yLocation !== "number")
      throw new Error("Invalid yLocation");
    if (typeof this.xSize !== "number") throw new Error("Invalid xSize");
    if (typeof this.ySize !== "number") throw new Error("Invalid ySize");
    if (typeof this.type !== "string") throw new Error("Invalid type");

    const allowed = this.constructor.allowedTypes;
    if (!allowed.includes(this.type)) {
      throw new Error(
        `Invalid type: ${this.type}. Allowed: ${allowed.join(", ")}`
      );
    }
  }

  /**
   * Validates the asset fields.
   *
   * @throws {Error} If any field is invalid.
   * @returns {void}
   */
  validate() {
    this._validateFields();
  }

  /**
   * Creates an Asset (or Nature) instance from a Prisma asset object.
   *
   * @static
   * @param {Object} prismaAsset - The Prisma asset object.
   * @param {string} prismaAsset.id - The unique identifier.
   * @param {number} prismaAsset.buildCost - The cost to build.
   * @param {number} prismaAsset.destroyCost - The cost to destroy.
   * @param {number} prismaAsset.energy - The energy produced.
   * @param {number} prismaAsset.xLocation - The X coordinate.
   * @param {number} prismaAsset.yLocation - The Y coordinate.
   * @param {number} prismaAsset.xSize - The width.
   * @param {number} prismaAsset.ySize - The height.
   * @param {string} prismaAsset.type - The type of the asset.
   * @param {number|null} prismaAsset.gameStatisticsId - The associated game statistics ID.
   * @param {number|null} prismaAsset.checkpointId - The associated checkpoint ID.
   * @returns {Asset} A new Asset or Nature instance.
   */
  static from(prismaAsset) {
    const Nature = require("./nature");
    if (Nature.allowedTypes.includes(prismaAsset.type)) {
      return Nature.from(prismaAsset);
    }

    return new Asset(
      {
        id: prismaAsset.id,
        buildCost: prismaAsset.buildCost,
        destroyCost: prismaAsset.destroyCost,
        energy: prismaAsset.energy,
        xLocation: prismaAsset.xLocation,
        yLocation: prismaAsset.yLocation,
        xSize: prismaAsset.xSize,
        ySize: prismaAsset.ySize,
        type: prismaAsset.type,
        gameStatisticsId: prismaAsset.gameStatisticsId,
        checkpointId: prismaAsset.checkpointId,
      },
      false
    );
  }
}

module.exports = Asset;
