/**
 * Represents a Building entity.
 *
 * @constructor
 * @param {Object} params - The parameters for the building.
 * @param {string} [params.id] - The unique identifier of the building.
 * @param {string} params.name - The name of the building.
 * @param {boolean} [validate=true] - Whether to validate the building on creation.
 *
 * @throws {Error} If validation fails.
 */
class Building {
  constructor({ id = undefined, name }, validate = true) {
    this.id = id;
    this.name = name;

    if (validate) this.validate();
  }

  /**
   * Validates the building’s properties.
   *
   * @throws {Error} If `name` is not a string.
   * @returns {void}
   */
  validate() {
    if (typeof this.name !== "string") {
      throw new Error("Invalid name");
    }
  }

  /**
   * Creates a Building instance from a Prisma building object.
   *
   * @static
   * @param {Object} prismaBuilding - The Prisma building object.
   * @param {string} prismaBuilding.id - The unique identifier from Prisma.
   * @param {string} prismaBuilding.name - The name from Prisma.
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
