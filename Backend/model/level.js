class Level {
  constructor({ id = undefined, level, upgradeCost, energyCost }, validate = true) {
    this.id = id;
    this.level = level;
    this.upgradeCost = upgradeCost;
    this.energyCost = energyCost;
    if (validate) this.validate();
  }

  validate() {
    if (typeof this.level !== 'number') {
      throw new Error('Invalid level');
    }
    if (typeof this.upgradeCost !== 'number') {
      throw new Error('Invalid upgradeCost');
    }
    if (typeof this.energyCost !== 'number') {
      throw new Error('Invalid energyCost');
    }
  }

  static from(prismaLevel) {
    return new Level({
      id: prismaLevel.id,
      level: prismaLevel.level,
      upgradeCost: prismaLevel.upgradeCost,
      energyCost: prismaLevel.energyCost,
    });
  }
}

module.exports = Level;
