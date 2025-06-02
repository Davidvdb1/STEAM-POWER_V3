/**
 * Represents a building entity with an identifier, name, and a flag indicating if it runs on green energy.
 *
 * @class
 * @property {string|undefined} id - The unique identifier of the building.
 * @property {string} name - The name of the building.
 * @property {boolean} runsOnGreen - Indicates whether the building runs on green energy.
 *
 * @constructor
 * @param {Object} params - The parameters for the building.
 * @param {string|undefined} [params.id] - The unique identifier of the building.
 * @param {string} params.name - The name of the building.
 * @param {boolean} params.runsOnGreen - Whether the building runs on green energy.
 * @param {boolean} [validate=true] - Whether to validate the building properties upon creation.
 */
class Building {
  constructor({ id = undefined, name, runsOnGreen }, validate = true) {
    this.id = id;
    this.name = name;
    this.runsOnGreen = runsOnGreen;

    if (validate) this.validate();
  }
  /**
   * Validates the properties of the building instance.
   * Throws an error if the 'name' property is not a string
   * or if the 'runsOnGreen' property is not a boolean.
   *
   * @throws {Error} If 'name' is not a string or 'runsOnGreen' is not a boolean.
   * @returns {void}
   */
  validate() {
    if (typeof this.name !== "string") {
      throw new Error("Invalid name");
    }
    if (typeof this.runsOnGreen !== "boolean") {
      throw new Error("Invalid runsOnGreen");
    }
  }

  /**
   * Creates a Building instance from a Prisma building object.
   *
   * @static
   * @param {Object} prismaBuilding - The Prisma building object.
   * @param {string} prismaBuilding.id - The unique identifier from Prisma.
   * @param {string} prismaBuilding.name - The name from Prisma.
   * @param {boolean} [prismaBuilding.runsOnGreen=false] - Whether the building runs on green energy.
   * @returns {Building} The created Building instance.
   */
  static from(prismaBuilding) {
    return new Building({
      id: prismaBuilding.id,
      name: prismaBuilding.name,
    });
  }
}

module.exports = Building;
