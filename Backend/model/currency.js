class Currency {
  static DEFAULT_GREEN_ENERGY = 0;
  static DEFAULT_GREY_ENERGY  = 0;
  static STARTING_COINS       = 1000;
  static STARTING_SCORE       = 100;

  constructor(
    {
      id = undefined,
      greenEnergy = Currency.DEFAULT_GREEN_ENERGY,
      greyEnergy  = Currency.DEFAULT_GREY_ENERGY,
      coins       = Currency.STARTING_COINS,
      score       = Currency.STARTING_SCORE,
    },
    validate = true
  ) {
    this.id          = id;
    this.greenEnergy = greenEnergy;
    this.greyEnergy  = greyEnergy;
    this.coins       = coins;
    this.score       = score;

    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (typeof this.greenEnergy !== 'number') {
      throw new Error('Invalid greenEnergy');
    }
    if (typeof this.greyEnergy !== 'number') {
      throw new Error('Invalid greyEnergy');
    }
    if (typeof this.coins !== 'number') {
      throw new Error('Invalid coins');
    }
    if (typeof this.score !== 'number') {
      throw new Error('Invalid score');
    }
  }

  static from(prismaCurrency) {
    return new Currency({
      id:          prismaCurrency.id,
      greenEnergy: prismaCurrency.greenEnergy,
      greyEnergy:  prismaCurrency.greyEnergy,
      coins:       prismaCurrency.coins,
      score:       prismaCurrency.score,
    });
  }
}

module.exports = Currency;
