const { PrismaClient } = require('@prisma/client');
const GameStatistics   = require('../model/gameStatistics');
const Building         = require('../model/building');
const Asset            = require('../model/asset');
const Currency         = require('../model/currency');
const Checkpoint       = require('../model/checkpoint');

class GameStatisticsRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create({ groupId, currency }) {
    currency.validate();
    const prismaGS = await this.prisma.gameStatistics.create({
      data: {
        group:    { connect: { id: groupId } },
        currency: { create: {
          greenEnergy: currency.greenEnergy,
          greyEnergy:  currency.greyEnergy,
          coins:       currency.coins,
        }},
      },
      include: { currency: true }
    });
    return GameStatistics.from(prismaGS);
  }

  async findById(
    id,
    {
      includeCurrency    = true,
      includeBuildings   = true,
      includeAssets      = true,
      includeCheckpoints = true,
      includeGroup       = false,
    } = {}
  ) {
    const prismaGS = await this.prisma.gameStatistics.findUnique({
      where: { id },
      include: {
        currency:    includeCurrency,
        buildings:   includeBuildings ? { include: { level: true } } : false,
        assets:      includeAssets,
        checkpoints: includeCheckpoints ? { include: { currency: true, buildings: { include: { level: true } }, assets: true } } : false,
        group:       includeGroup,
      }
    });
    return prismaGS ? GameStatistics.from(prismaGS) : null;
  }

async findByGroupId(groupId, opts = {}) {
  const prismaGS = await this.prisma.gameStatistics.findFirst({
    where: { groupId },
    include: {
      currency:    opts.includeCurrency    ?? true,
      buildings:   opts.includeBuildings   ? { include: { level: true } } : false,
      assets:      opts.includeAssets      ?? true,
      checkpoints: opts.includeCheckpoints ? { 
        include: { 
          currency: true, 
          buildings: { include: { level: true } }, 
          assets: true 
        } 
      } : false,
      group:       opts.includeGroup       ?? false,
    }
  });

  if (!prismaGS) return null;

  console.log('▶️ raw asset types:', prismaGS.assets.map(a => a.type));
  console.log(
    '▶️ checkpoint asset types:',
    prismaGS.checkpoints
      ? prismaGS.checkpoints.flatMap(cp => cp.assets.map(a => a.type))
      : []
  );

  return GameStatistics.from(prismaGS);
}

  async findCurrencyById(id) {
    const prismaCurrency = await this.prisma.currency.findUnique({
      where: { id },
      include: { gameStatistics: true }
    });
    return prismaCurrency ? Currency.from(prismaCurrency) : null;
  }


  async updateCurrency(currencyId, { greenEnergy, greyEnergy, coins }) {
    if (
      typeof greenEnergy !== 'number' ||
      typeof greyEnergy  !== 'number' ||
      typeof coins       !== 'number'
    ) {
      throw new Error('Invalid currency values');
    }

    const updated = await this.prisma.currency.update({
      where: { id: currencyId },      
      data: { greenEnergy, greyEnergy, coins }
    });

    return Currency.from(updated);
  }



  async addBuilding(statsId, building) {
    building.validate();
    const created = await this.prisma.building.create({
      data: {
        xLocation:      building.xLocation,
        yLocation:      building.yLocation,
        xSize:          building.xSize,
        ySize:          building.ySize,
        level:          { connect: { id: building.level.id } },
        gameStatistics: { connect: { id: statsId } }
      },
      include: { level: true }
    });
    return Building.from(created);
  }

  async upgradeBuilding(buildingId, { level }) {
    const updated = await this.prisma.building.update({
      where: { id: buildingId },
      data: {
        level: {
          update: { level }
        }
      },
      include: { level: true }
    });
    return Building.from(updated);
  }


  async removeBuilding(buildingId) {
    await this.prisma.building.delete({ where: { id: buildingId } });
  }

  async addAsset(statsId, asset) {
    asset.validate();
    const created = await this.prisma.asset.create({
      data: {
        buildCost:      asset.buildCost,
        destroyCost:    asset.destroyCost,
        energy:         asset.energy,
        xLocation:      asset.xLocation,
        yLocation:      asset.yLocation,
        xSize:          asset.xSize,
        ySize:          asset.ySize,
        type:            asset.type,
        gameStatistics: { connect: { id: statsId } }
      }
    });
    return Asset.from(created);
  }

  async removeAsset(assetId) {
    await this.prisma.asset.delete({ where: { id: assetId } });
  }

  async recordCheckpoint(statsId, cp) {
    cp.validate();
    const prismaCP = await this.prisma.checkpoint.create({
      data: {
        gameStatistics: { connect: { id: statsId } },
        currency:       { create: {
          greenEnergy: cp.currency.greenEnergy,
          greyEnergy:  cp.currency.greyEnergy,
          coins:       cp.currency.coins,
        }} ,
        buildings:      { create: cp.buildings.map(b => ({
          xLocation: b.xLocation,
          yLocation: b.yLocation,
          xSize:     b.xSize,
          ySize:     b.ySize,
          level:     { connect: { id: b.level.id } },
        }))},
        assets:          { create: cp.assets.map(a => ({
          buildCost:   a.buildCost,
          destroyCost: a.destroyCost,
          energy:      a.energy,
          xLocation:   a.xLocation,
          yLocation:   a.yLocation,
          xSize:       a.xSize,
          ySize:       a.ySize,
          type:        a.type,
        }))}
      },
      include: {
        currency: true,
        buildings: { include: { level: true } },
        assets: true
      }
    });
    return Checkpoint.from(prismaCP);
  }

  async removeCheckpoint(checkpointId) {
    await this.prisma.checkpoint.delete({ where: { id: checkpointId } });
  }

  async delete(id) {
    await this.prisma.gameStatistics.delete({ where: { id } });
  }

  async findBuildingById(buildingId) {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
      include: { level: true }
    });
    return building ? Building.from(building) : null;
  }
}

module.exports = new GameStatisticsRepository();
