const Level = require('./level');

class Building {
  constructor({
    id = undefined,
    name,
  }, validate = true) {
    this.id = id;
    this.name = name
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
