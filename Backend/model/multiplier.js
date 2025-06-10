/**
 * Constructs a new Multiplier instance.
 * 
 * @param {Object} params - The parameters for the multiplier.
 * @param {number|undefined} [params.id=undefined] - The unique identifier for the multiplier.
 * @param {number} [params.solar=Multiplier.defaultSolar] - The solar multiplier value.
 * @param {number} [params.wind=Multiplier.defaultWind] - The wind multiplier value.
 * @param {number} [params.water=Multiplier.defaultWater] - The water multiplier value.
 * @param {number} [params.solarDamage=Multiplier.defaultDamage] - The solar damage multiplier.
 * @param {number} [params.windDamage=Multiplier.defaultDamage] - The wind damage multiplier.
 * @param {number} [params.waterDamage=Multiplier.defaultDamage] - The water damage multiplier.
 * @param {string} [params.message=Multiplier.defaultMessage] - The message associated with the multiplier.
 * @param {boolean} [validate=true] - Whether to validate the multiplier after construction.
 */
class Multiplier {
    static defaultSolar = 1.0;
    static defaultWind = 1.0;
    static defaultWater = 1.0;
    static defaultDamage = false; 
    static defaultMessage = "";

    constructor({
        id = undefined,
        solar = Multiplier.defaultSolar,
        wind = Multiplier.defaultWind,
        water = Multiplier.defaultWater,
        solarDamage = Multiplier.defaultDamage,
        windDamage = Multiplier.defaultDamage,
        waterDamage = Multiplier.defaultDamage,
        message =  Multiplier.defaultMessage

    }, validate = true) {
        this.id = id;
        this.solar = solar;
        this.wind = wind;
        this.water = water;
        this.solarDamage = solarDamage;
        this.windDamage = windDamage;
        this.waterDamage = waterDamage;
        this.message = message;

        if (validate) {
            this.validate();
        }
    }


    /**
     * Validates the properties of the multiplier object.
     * 
     * @throws {Error} If any of the following conditions are met:
     * - `solar`, `wind`, or `water` is not a number or is less than 0.
     * - `solarDamage`, `windDamage`, or `waterDamage` is not a boolean.
     * - `message` is not a string.
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
        if (typeof this.solarDamage !== "boolean") {
            throw new Error("Invalid solar damage multiplier");
        }
        if (typeof this.windDamage !== "boolean") {
            throw new Error("Invalid wind damage multiplier");
        }
        if (typeof this.waterDamage !== "boolean") {
            throw new Error("Invalid water damage multiplier");
        }
        if (typeof this.message !== "string") {
            throw new Error("Invalid message");
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
     * @param {number} prismaMultiplier.solarDamage - The solar damage value.
     * @param {number} prismaMultiplier.windDamage - The wind damage value.
     * @param {number} prismaMultiplier.waterDamage - The water damage value.
     * @param {string} [prismaMultiplier.message] - An optional message associated with the multiplier.
     * @returns {Multiplier} A new Multiplier instance populated with the provided data.
     */
    static from(prismaMultiplier) {
        return new Multiplier({
        id: prismaMultiplier.id,
        solar: prismaMultiplier.solar,
        wind: prismaMultiplier.wind,
        water: prismaMultiplier.water,
        solarDamage: prismaMultiplier.solarDamage,
        windDamage: prismaMultiplier.windDamage,
        waterDamage: prismaMultiplier.waterDamage,
        message: prismaMultiplier.message
        });
    }
}

module.exports = Multiplier;
