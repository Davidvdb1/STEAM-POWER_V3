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

  async refactorGameStatistics({ checkpoint }) {
    checkpoint.validate();

    // 1. Delete existing gameBuildings and assets for this gameStatistics
    await this.prisma.gameBuildings.deleteMany({
      where: { gameStatisticsId: checkpoint.gameStatisticsId },
    });
    await this.prisma.asset.deleteMany({
      where: { gameStatisticsId: checkpoint.gameStatisticsId },
    });

    // 2. Update currency and create new gameBuildings and assets
    const prismaGS = await this.prisma.gameStatistics.update({
      where: { id: checkpoint.gameStatisticsId },
      data: {
        currency: {
          update: {
            greenEnergy: checkpoint.currency.greenEnergy,
            greyEnergy: checkpoint.currency.greyEnergy,
            coins: checkpoint.currency.coins,
          },
        },
        gameBuildings: {
          create: checkpoint.gameBuildings.map((gb) => ({
            building: { connect: { id: gb.building.id } },
            buildingLevel: { connect: { id: gb.buildingLevel.id } },
            // REMOVE gameStatistics: { connect: ... }
          })),
        },
        assets: {
          create: checkpoint.assets.map((a) => ({
            buildCost: a.buildCost,
            destroyCost: a.destroyCost,
            energy: a.energy,
            xLocation: a.xLocation,
            yLocation: a.yLocation,
            xSize: a.xSize,
            ySize: a.ySize,
            type: a.type,
            // REMOVE gameStatistics: { connect: ... }
          })),
        },
      },
      include: {
        currency: true,
        gameBuildings: {
          include: {
            building: true,
            buildingLevel: true,
          },
        },
        assets: true,
      },
    });

    return GameStatistics.from(prismaGS);
  }

  // Om de backend manueel te testen

  async getAllGameStatistics() {
    const gameStatistics = await this.prisma.gameStatistics.findMany({
      include: {
        currency: true,
        gameBuildings: {
          include: {
            building: true,
            buildingLevel: true,
          },
        },
        assets: true,
        checkpoints: {
          include: {
            currency: true,
            gameBuildings: {
              include: {
                building: true,
                buildingLevel: true,
              },
            },
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
        gameBuildings: includeGameBuildings
          ? {
              include: {
                building: true,
                buildingLevel: true,
              },
            }
          : false,
        assets: includeAssets,
        checkpoints: includeCheckpoints
          ? {
              include: {
                currency: true,
                gameBuildings: {
                  include: {
                    building: true,
                    buildingLevel: true,
                  },
                },
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
        gameBuildings:
          opts.includeGameBuildings ?? true
            ? {
                include: {
                  building: true,
                  buildingLevel: true,
                },
              }
            : false,
        assets: opts.includeAssets ?? true,
        checkpoints: opts.includeCheckpoints
          ? {
              include: {
                currency: true,
                gameBuildings: {
                  include: {
                    building: true,
                    buildingLevel: true,
                  },
                },
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

  async findCurrencyByGameStatisticsId(gameStatisticsId) {
    const currency = await this.prisma.currency.findFirst({
      where: { gameStatisticsId },
      include: { gameStatistics: true },
    });
    return currency ? Currency.from(currency) : null;
  }

  // GameBuilding ---------------------------------------------------------------------------------------------------------------------------------------------------
  async findGameBuildingById(gameBuildingId) {
    const gameBuilding = await this.prisma.gameBuildings.findUnique({
      where: { id: gameBuildingId },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true,
      },
    });

    return gameBuilding ? GameBuildings.from(gameBuilding) : null;
  }

  async findAllGameBuildingsByGameStatisticsId(gameStatisticsId) {
    const gameBuildings = await this.prisma.gameBuildings.findMany({
      where: { gameStatisticsId },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true,
      },
    });

    return gameBuildings.map((gb) => GameBuildings.from(gb));
  }

  async findAllGameBuildingsByGroupId(groupId) {
    const gameStatisticsWithGroupId = this.findByGroupId(groupId);
    const gameBuildings = await this.prisma.gameBuildings.findMany({
      where: { gameStatisticsId: gameStatisticsWithGroupId.id },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true,
      },
    });
    return gameBuildings.map((gb) => GameBuildings.from(gb));
  }

  async upgradeBuildingLevel(gameBuildingId, buildingLevelId) {
    // Update the building level connection
    const updated = await this.prisma.gameBuildings.update({
      where: { id: gameBuildingId },
      data: {
        buildingLevel: { connect: { id: buildingLevelId } },
      },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true,
      },
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

  async findAllAssetsByGameStatisticsId(gameStatisticsId) {
    const assets = await this.prisma.asset.findMany({
      where: { gameStatisticsId },
      include: { gameStatistics: true },
    });

    return assets.map((a) => Asset.from(a));
  }

  async recordCheckpoint(statsId, currency, gameBuildings, assets) {
    // Validate input
    currency.validate();
    gameBuildings.forEach((gb) => gb.validate());
    assets.forEach((a) => a.validate());

    const prismaCP = await this.prisma.checkpoint.create({
      data: {
        gameStatistics: { connect: { id: statsId } },
        currency: {
          create: {
            greenEnergy: currency.greenEnergy,
            greyEnergy: currency.greyEnergy,
            coins: currency.coins,
          },
        },
        gameBuildings: {
          create: gameBuildings.map((gb) => ({
            building: { connect: { id: gb.building.id } },
            buildingLevel: { connect: { id: gb.buildingLevel.id } },
            gameStatistics: { connect: { id: statsId } }, // required by schema
          })),
        },
        assets: {
          create: assets.map((a) => ({
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
        gameBuildings: {
          include: {
            building: true,
            buildingLevel: true,
          },
        },
        assets: true,
      },
    });

    return Checkpoint.from(prismaCP);
  }

  async findCheckpointById(checkpointId) {
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        currency: true,
        gameBuildings: {
          include: {
            building: true,
            buildingLevel: true,
          },
        },
        assets: true,
      },
    });
    if (!checkpoint) throw new Error("Checkpoint not found");
    return Checkpoint.from(checkpoint);
  }

  async findAllCheckpointsByGameStatisticsId(gameStatisticsId) {
    const checkpoints = await this.prisma.checkpoint.findMany({
      where: { gameStatisticsId },
      include: {
        currency: true,
        gameBuildings: {
          include: {
            building: true,
            buildingLevel: true,
          },
        },
        assets: true,
      },
    });

    return checkpoints.map((cp) => Checkpoint.from(cp));
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
      include: { building: true },
    });

    return buildingLevel ? BuildingLevel.from(buildingLevel) : null;
  }
}

module.exports = new GameStatisticsRepository();
