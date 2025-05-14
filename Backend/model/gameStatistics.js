const Currency = require("./currency");
const Building = require("./building");
const Checkpoint = require("./checkpoint");
const Asset = require("./asset");

class GameStatistics {
<<<<<<< HEAD
  constructor(
    { id = undefined, currencies, building, groupID, checkpoint, assets },
    validate = true
  ) {
=======
  constructor({
    id = undefined,
    currency,
    buildings,
    groupID,
    checkpoints,
    assets,
  }, validate = true) {
>>>>>>> 3fd4af8e4e395454dcb70cb65ad5b625a6bcee71
    this.id = id;
    this.currency = currency;
    this.buildings = buildings;
    this.groupID = groupID;
    this.checkpoints = checkpoints;
    this.assets = assets;
    if (validate) this.validate();
  }

  validate() {
<<<<<<< HEAD
    if (!(this.currencies instanceof Currency)) {
      throw new Error("Invalid currencies (must be a Currency instance)");
    }
    if (
      !Array.isArray(this.building) ||
      !this.building.every((b) => b instanceof Building)
    ) {
      throw new Error(
        "Invalid building (must be an array of Building instances)"
      );
=======
    if (!(this.currency instanceof Currency)) {
      throw new Error('Invalid currencies (must be a Currency instance)');
    }
    if (!Array.isArray(this.buildings) || !this.buildings.every(b => b instanceof Building)) {
      throw new Error('Invalid building (must be an array of Building instances)');
>>>>>>> 3fd4af8e4e395454dcb70cb65ad5b625a6bcee71
    }
    if (typeof this.groupID !== "string") {
      throw new Error("Invalid groupID (must be a string)");
    }
<<<<<<< HEAD
    if (
      !Array.isArray(this.checkpoint) ||
      !this.checkpoint.every((c) => c instanceof Checkpoint)
    ) {
      throw new Error(
        "Invalid checkpoint (must be an array of Checkpoint instances)"
      );
=======
    if (!Array.isArray(this.checkpoints) || !this.checkpoints.every(c => c instanceof Checkpoint)) {
      throw new Error('Invalid checkpoint (must be an array of Checkpoint instances)');
>>>>>>> 3fd4af8e4e395454dcb70cb65ad5b625a6bcee71
    }
    if (
      !Array.isArray(this.assets) ||
      !this.assets.every((a) => a instanceof Asset)
    ) {
      throw new Error("Invalid assets (must be an array of Asset instances)");
    }
  }

  static from(prismaGameStats) {
    return new GameStatistics({
      id: prismaGameStats.id,
      currency: Currency.from(prismaGameStats.currency),
      buildings: prismaGameStats.buildings.map(Building.from),
      groupID: prismaGameStats.groupID,
      checkpoints: prismaGameStats.checkpoints.map(Checkpoint.from),
      assets: prismaGameStats.assets.map(Asset.from),
    });
  }
}

module.exports = GameStatistics;
