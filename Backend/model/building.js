const Level = require('./level');

class Building {
  constructor({
    id = undefined,
    name,
    runsOnGreen = false
  }, validate = true) {
    this.id = id;
    this.name = name
    this.runsOnGreen = runsOnGreen
    if (validate) this.validate();
  }

  validate() {
    if (typeof this.name !== 'string') {
      throw new Error('Invalid name');
    }
  }

  static from(prismaBuilding) {
    return new Building({
      id: prismaBuilding.id,
      name: prismaBuilding.name
    });
  }
}

module.exports = Building;
