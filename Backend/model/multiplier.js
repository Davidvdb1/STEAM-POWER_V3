/**
 * @constructor
 * @param {Object} params - The parameters for the multiplier.
 * @param {number|string} [params.id] - The unique identifier of the multiplier.
 * @param {number} [params.solar=Multiplier.defaultSolar] - The solar multiplier value.
 * @param {number} [params.wind=Multiplier.defaultWind] - The wind multiplier value.
 * @param {number} [params.water=Multiplier.defaultWater] - The water multiplier value.
 * @param {boolean} [validate=true] - Whether to validate the multiplier values upon construction.
 * 
 * @throws {Error} If any multiplier property is not a number or is negative.
 */
class Multiplier {
    static defaultSolar = 1.0;
    static defaultWind = 1.0;
    static defaultWater = 1.0;

    constructor({
        id = undefined,
        solar = Multiplier.defaultSolar,
        wind = Multiplier.defaultWind,
        water = Multiplier.defaultWater
    }, validate = true) {
        this.id = id;
        this.solar = solar;
        this.wind = wind;
        this.water = water;

        if (validate) {
            this.validate();
        }
    }

    /**
     * Validates the multiplier properties (solar, wind, water) of the instance.
     * Ensures each property is a non-negative number.
     * 
     * @throws {Error} If any multiplier property is not a number or is negative.
     */
    validate() {
        if (typeof this.solar !== "number" || this.solar < 0) {
            throw new Error("Invalid solar multiplier");
        }
        if (typeof this.wind !== "number" || this.wind < 0) {
            throw new Error("Invalid wind multiplier");
        }
        if (typeof this.water !== "number" || this.water < 0) {
            throw new Error("Invalid water multiplier");
        }
    }

    /**
     * Creates a new Multiplier instance from a Prisma multiplier object.
     *
     * @param {Object} prismaMultiplier - The Prisma multiplier object.
     * @param {number|string} prismaMultiplier.id - The unique identifier of the multiplier.
     * @param {number} prismaMultiplier.solar - The solar multiplier value.
     * @param {number} prismaMultiplier.wind - The wind multiplier value.
     * @param {number} prismaMultiplier.water - The water multiplier value.
     * @returns {Multiplier} A new Multiplier instance initialized with the provided values.
     */
    static from(prismaMultiplier) {
        return new Multiplier({
            id: prismaMultiplier.id,
            solar: prismaMultiplier.solar,
            wind: prismaMultiplier.wind,
            water: prismaMultiplier.water
        }, false);
    }
}