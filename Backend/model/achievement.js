/**
 * Represents an achievement with a title, description, reward, and score.
 *
 * @constructor
 * @param {Object} params - The achievement parameters.
 * @param {string} [params.id] - The unique identifier of the achievement.
 * @param {string} params.title - The title of the achievement.
 * @param {string} params.description - A description of the achievement.
 * @param {number} params.reward - The reward value (must be ≥ 0).
 * @param {boolean} [validate=true] - Whether to validate the input parameters.
 *
 * @throws {Error} If validation fails for any property.
 */
class Achievement {
  constructor(
    { id = undefined, title, description, reward },
    validate = true
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.reward = reward;
    if (validate) this.validate();
  }

  /**
   * Validates the achievement properties.
   *
   * @throws {Error} If `title` or `description` is not a string,
   *                 if `reward` < 0, or if `score` is not a number.
   * @returns {void}
   */
  validate() {
    if (typeof this.title !== "string") {
      throw new Error("Invalid title");
    }
    if (typeof this.description !== "string") {
      throw new Error("Invalid description");
    }
    if (typeof this.reward !== "number" || this.reward < 0) {
      throw new Error("Invalid reward");
    }
  }

  /**
   * Creates an Achievement instance from a Prisma achievement object.
   *
   * @static
   * @param {Object} prismaAchievement - A Prisma achievement record.
   * @param {string} prismaAchievement.id - The unique identifier.
   * @param {string} prismaAchievement.title - The title.
   * @param {string} prismaAchievement.description - The description.
   * @param {number} prismaAchievement.reward - The reward value.
   * @returns {Achievement} A new `Achievement` instance.
   */
  static from(prismaAchievement) {
    return new Achievement({
      id: prismaAchievement.id,
      title: prismaAchievement.title,
      description: prismaAchievement.description,
      reward: prismaAchievement.reward,
    });
  }
}

module.exports = Achievement;
