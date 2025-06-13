/**
 * Represents a Group with members, microbit identifier, and energy/battery settings.
 *
 * @constructor
 * @param {Object} params - The parameters for the Group.
 * @param {string} [params.id] - The unique identifier of the group.
 * @param {string} params.name - The name of the group.
 * @param {string} [params.members=""] - A comma-separated list of member names.
 * @param {string} [params.microbitId=""] - The 5-character micro:bit identifier.
 * @param {string} [params.code] - An optional code for the group.
 * @param {number} [params.bonusScore=0] - The bonus score awarded to the group.
 * @param {number} [params.energy=0] - The current energy level.
 * @param {number} [params.energyMultiplier=1] - The energy multiplier factor.
 * @param {number} [params.batteryCapacity=500] - The maximum battery capacity.
 * @param {number} params.batteryLevel - The current battery level (will be capped at `batteryCapacity`).
 * @param {boolean} [validate=true] - Whether to perform validation.
 *
 * @throws {Error} If `name` is missing or not a string, or if `microbitId` is present but invalid.
 */
class Group {
  constructor(
    {
      id = undefined,
      name,
      members = "",
      microbitId = "",
      code = undefined,
      bonusScore = 0,
      energy = 0,
      energyMultiplier = 1,
      batteryCapacity = 500,
      batteryLevel,
    },
    validate = true
  ) {
    this.id = id;
    this.name = name;
    this.members = members;
    this.microbitId = microbitId;
    this.code = code;
    this.bonusScore = bonusScore;
    this.energy = energy;
    this.energyMultiplier = energyMultiplier;
    this.batteryCapacity = batteryCapacity;
    this.batteryLevel =
      batteryLevel > batteryCapacity ? batteryCapacity : batteryLevel;

    if (validate) {
      this.validate();
    }
  }

  /**
   * Validates the Group properties.
   *
   * @throws {Error} If `name` is not a non-empty string, or if `microbitId` is present but does not follow the consonant-vowel pattern.
   * @returns {void}
   */
  validate() {
    if (!this.name || typeof this.name !== "string") {
      throw new Error("Ongeldige naam");
    }

    if (this.microbitId) {
      if (this.microbitId.length !== 5) {
        throw new Error("Ongeldige microbitId");
      }
      const consonants = ["t", "p", "g", "v", "z"];
      const vowels = ["a", "e", "i", "o", "u"];
      for (let i = 0; i < 5; i++) {
        const char = this.microbitId[i].toLowerCase();
        if (i % 2 ? !vowels.includes(char) : !consonants.includes(char)) {
          throw new Error("Ongeldige microbitId");
        }
      }
    }
  }

  /**
   * Creates a Group instance from a Prisma group object.
   *
   * @static
   * @param {Object} prismaGroup - The Prisma Group record.
   * @param {string} prismaGroup.id - The unique identifier from Prisma.
   * @param {string} prismaGroup.name - The group’s name.
   * @param {string} [prismaGroup.members] - Comma-separated member list.
   * @param {string} [prismaGroup.microbitId] - The micro:bit identifier.
   * @param {string} [prismaGroup.code] - The group’s code.
   * @param {number} [prismaGroup.bonusScore] - The bonus score.
   * @param {number} [prismaGroup.energy] - The current energy.
   * @param {number} [prismaGroup.energyMultiplier] - The energy multiplier.
   * @param {number} [prismaGroup.batteryCapacity] - The battery capacity.
   * @param {number} prismaGroup.batteryLevel - The battery level.
   * @returns {Group} The created Group instance.
   * @throws {Error} If validation fails on creation.
   */
  static from(prismaGroup) {
    return new Group(prismaGroup);
  }
}

module.exports = Group;
