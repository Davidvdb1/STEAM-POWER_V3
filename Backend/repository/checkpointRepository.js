import { PrismaClient } from "@prisma/client";
const GameStatistics   = require('../model/gameStatistics');
const Building         = require('../model/building');
const Asset            = require('../model/asset');
const Currency         = require('../model/currency');
const Checkpoint       = require('../model/checkpoint');

class CheckpointRepository {
    constructor() {
        this.prisma = new PrismaClient()
    }

async create({ groupId, checkpoint }) {
  const prismaCheckpoint = await this.prisma.checkpoint.create({
    data: {
      group: { connect: { id: groupId } },
      currency: { connect: { id: checkpoint.currency.id } },
      buildings: {
        connect: checkpoint.buildings.map(b => ({ id: b.id }))
      },
      assets: {
        connect: checkpoint.assets.map(a => ({ id: a.id }))
      }
    },
    include: {currency: true, buildings: true, assets: true}
  });

  return Checkpoint.from(prismaCheckpoint);
}

}

module.exports = new CheckpointRepository();
