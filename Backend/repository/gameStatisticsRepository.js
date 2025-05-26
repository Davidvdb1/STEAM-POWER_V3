const { PrismaClient } = require("@prisma/client");
const GameStatistics = require("../model/gameStatistics");
const Building = require("../model/building");
const BuildingLevel = require("../model/buildingLevel");
const GameBuildings = require("../model/gameBuildings");
const Asset = require("../model/asset");
const Currency = require("../model/currency");
const Checkpoint = require("../model/checkpoint");

class GameStatisticsRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // GameStatistics ---------------------------------------------------------------------------------------------------------------------------------------------------

  async create({ groupId, currency }) {
    currency.validate();
    const prismaGS = await this.prisma.gameStatistics.create({
      data: {
        group: { connect: { id: groupId } },
        currency: {
          create: {
            greenEnergy: currency.greenEnergy,
            greyEnergy: currency.greyEnergy,
            coins: currency.coins,
          },
        },
      },
      include: { currency: true },
    });
    return GameStatistics.from(prismaGS);
  }

  // Om de backend manueel te testen

  async getAllGameStatistics() {
    const gameStatistics = await this.prisma.gameStatistics.findMany({
      include: {
        currency: true,
        buildings: true,
        assets: true,
        checkpoints: {
          include: {
            currency: true,
            buildings: true,
            assets: true,
          },
        },
      },
    });
    return gameStatistics.map((gs) => GameStatistics.from(gs));
  }

  async findById(
    id,
    {
      includeCurrency = true,
      includeGameBuildings = true,
      includeAssets = true,
      includeCheckpoints = true,
      includeGroup = false,
    } = {}
  ) {
    const prismaGS = await this.prisma.gameStatistics.findUnique({
      where: { id },
      include: {
        currency: includeCurrency,
        gameBuildings: includeGameBuildings ? {
          include: {
            building: true,
            buildingLevel: true
          }
        } : false,
        assets: includeAssets,
        checkpoints: includeCheckpoints
          ? {
              include: {
                currency: true,
                buildings: true,
                assets: true,
              },
            }
          : false,
        group: includeGroup,
      },
    });
    return prismaGS ? GameStatistics.from(prismaGS) : null;
  }

  async findByGroupId(groupId, opts = {}) {
    const prismaGS = await this.prisma.gameStatistics.findFirst({
      where: { groupId },
      include: {
        currency: opts.includeCurrency ?? true,
        gameBuildings: (opts.includeGameBuildings ?? true) ? {
          include: {
            building: true,
            buildingLevel: true
          }
        } : false,
        assets: opts.includeAssets ?? true,
        checkpoints: opts.includeCheckpoints
          ? {
              include: {
                currency: true,
                buildings: true,
                assets: true,
              },
            }
          : false,
        group: opts.includeGroup ?? false,
      },
    });

    if (!prismaGS) return null;
    return GameStatistics.from(prismaGS);
  }

  // Currency ---------------------------------------------------------------------------------------------------------------------------------------------------

  async findCurrencyById(id) {
    const prismaCurrency = await this.prisma.currency.findUnique({
      where: { id },
      include: { gameStatistics: true },
    });
    return prismaCurrency ? Currency.from(prismaCurrency) : null;
  }

  async updateCurrency(currencyId, { greenEnergy, greyEnergy, coins }) {
    if (
      typeof greenEnergy !== "number" ||
      typeof greyEnergy !== "number" ||
      typeof coins !== "number"
    ) {
      throw new Error("Invalid currency values");
    }

    const updated = await this.prisma.currency.update({
      where: { id: currencyId },
      data: { greenEnergy, greyEnergy, coins },
    });

    return Currency.from(updated);
  }

  async incrementCurrency(
    currencyId,
    { greenEnergy = 0, greyEnergy = 0, coins = 0 }
  ) {
    const updated = await this.prisma.currency.update({
      where: { id: currencyId },
      data: {
        greenEnergy: { increment: greenEnergy },
        greyEnergy: { increment: greyEnergy },
        coins: { increment: coins },
      },
    });

    return Currency.from(updated);
  }


  // GameBuilding ---------------------------------------------------------------------------------------------------------------------------------------------------
  async findGameBuildingById(gameBuildingId) {
    const gameBuilding = await this.prisma.gameBuildings.findUnique({
      where: { id: gameBuildingId },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true
      }
    });
    
    return gameBuilding ? GameBuildings.from(gameBuilding) : null;
  }

  async findAllGameBuildingsByGroupId(groupId) {
    const gameStatisticsWithGroupId = this.findByGroupId(groupId);
    const gameBuildings = await this.prisma.gameBuildings.findMany({
      where: { gameStatisticsId: gameStatisticsWithGroupId.id },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true
      }
    });
    return gameBuildings.map(gb => GameBuildings.from(gb));
  }

  async upgradeBuildingLevel(gameBuildingId, buildingLevelId) {
    // Update the building level connection
    const updated = await this.prisma.gameBuildings.update({
      where: { id: gameBuildingId },
      data: {
        buildingLevel: { connect: { id: buildingLevelId } }
      },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true
      }
    });
    return GameBuildings.from(updated);
  }
      
  async upgradeBuilding(buildingId, { level }) {
    const updated = await this.prisma.building.update({
      where: { id: buildingId },
      data: {
        level: {
          update: { level },
        },
      },
      include: { level: true },
    });
    
    return GameBuildings.from(updated);
  }

  async addAsset(statsId, asset) {
    asset.validate();
    const created = await this.prisma.asset.create({
      data: {
        buildCost: asset.buildCost,
        destroyCost: asset.destroyCost,
        energy: asset.energy,
        xLocation: asset.xLocation,
        yLocation: asset.yLocation,
        xSize: asset.xSize,
        ySize: asset.ySize,
        type: asset.type,
        gameStatistics: { connect: { id: statsId } },
      },
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
        currency: {
          create: {
            greenEnergy: cp.currency.greenEnergy,
            greyEnergy: cp.currency.greyEnergy,
            coins: cp.currency.coins,
          },
        },
        buildings: {
          create: cp.buildings.map((b) => ({
            name: b.name,
          })),
        },
        assets: {
          create: cp.assets.map((a) => ({
            buildCost: a.buildCost,
            destroyCost: a.destroyCost,
            energy: a.energy,
            xLocation: a.xLocation,
            yLocation: a.yLocation,
            xSize: a.xSize,
            ySize: a.ySize,
            type: a.type,
          })),
        },
      },
      include: {
        currency: true,
        buildings: true,
        assets: true,
      },
    });

    return Checkpoint.from(prismaCP);
  }

  async removeCheckpoint(checkpointId) {
    await this.prisma.checkpoint.delete({ where: { id: checkpointId } });
  }

  async delete(id) {
    await this.prisma.gameBuildings.deleteMany({
      where: { gameStatisticsId: id },
    });
    await this.prisma.gameStatistics.delete({ where: { id } });
  }


  // BuildingLevel operations ---------------------------------------------------------------------------------------------------------------------------------------------------
  async findBuildingLevelByBuildingIdAndLevel(buildingId, level) {
    const buildingLevel = await this.prisma.buildingLevel.findFirst({
      where: { buildingId: buildingId, level: level },
      include: { building: true }
    });
    
    return buildingLevel ? BuildingLevel.from(buildingLevel) : null;
  }
}

module.exports = new GameStatisticsRepository();
