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
                buildings: { include: { level: true } },
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

async incrementGreenEnergyWithMultiplier(groupId, greenEnergy, type) {
  const gs = await this.findByGroupId(groupId);

  if (!gs || !gs.currency || !gs.assets) {
    throw new Error('GameStatistics, currency of assets niet gevonden');
  }

  const typeMap = {
    WIND: "windmolen",
    SOLAR: "zonnepaneel",
    WATER: "waterrad"
  };

  const assetType = typeMap[type.toUpperCase()];
  if (!assetType) throw new Error(`Onbekend green energy type: ${type}`);

  const matchingAssets = gs.assets.filter(a => a.type.toLowerCase() === assetType);

  const totalGain = matchingAssets.reduce((sum, asset) => {
    return sum + (greenEnergy * asset.energy);
  }, 0);

  const updated = await this.prisma.currency.update({
    where: { id: gs.currency.id },
    data: {
      greenEnergy: { increment: totalGain }
    }
  });

  return Currency.from(updated);
}

  // Building ---------------------------------------------------------------------------------------------------------------------------------------------------


  async addBuildingToGame(gameStatisticsId, buildingId, buildingLevelId) {
    const gameBuilding = await this.prisma.gameBuildings.create({
      data: {
        gameStatistics: { connect: { id: gameStatisticsId } },
        building: { connect: { id: buildingId } },
        buildingLevel: { connect: { id: buildingLevelId } }
      },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true
      }
    });
    
    return GameBuildings.from(gameBuilding);
  }


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


async updateGameBuilding(gameBuildingId, { buildingLevelId }) {
  // Only update the level connection since GameBuildings shouldn't have location/size fields
  const data = {};
  
  if (buildingLevelId) {
    data.buildingLevel = { connect: { id: buildingLevelId } };
  }
  
  const updated = await this.prisma.gameBuildings.update({
    where: { id: gameBuildingId },
    data,
    include: {
      gameStatistics: true,
      building: true,
      buildingLevel: true
    }
  });
  
  return GameBuildings.from(updated);
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

  async removeGameBuilding(gameBuildingId) {
    await this.prisma.gameBuildings.delete({ where: { id: gameBuildingId } });
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
            xLocation: b.xLocation,
            yLocation: b.yLocation,
            xSize: b.xSize,
            ySize: b.ySize,
            level: { connect: { id: b.level.id } }, // connect via id
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
        buildings: { include: { level: true } },
        assets: true,
      },
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


  // Building operations (base building catalog) ---------------------------------------------------------------------------------------------------------------------------------------------------

  async createBuilding(name) {
    const created = await this.prisma.building.create({
      data: { name }
    });
    return Building.from(created);
  }

  async findBuildingById(buildingId) {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId }
    });
    return building ? Building.from(building) : null;
  }

  async getAllBuildings() {
    const buildings = await this.prisma.building.findMany();
    return buildings.map(b => Building.from(b));
  }


  // BuildingLevel operations ---------------------------------------------------------------------------------------------------------------------------------------------------

  async createBuildingLevel(buildingId, level, energyCost, upgradeCost, scoreDeduction) {
    const created = await this.prisma.buildingLevel.create({
      data: {
        building: { connect: { id: buildingId } },
        level,
        energyCost,
        upgradeCost,
        scoreDeduction
      },
      include: { building: true }
    });
    
    return BuildingLevel.from(created);
  }

  async findBuildingLevelById(levelId) {
    const level = await this.prisma.buildingLevel.findUnique({
      where: { id: levelId },
      include: { building: true }
    });
    
    return level ? BuildingLevel.from(level) : null;
  }

  async getBuildingLevelsForBuilding(buildingId) {
    const levels = await this.prisma.buildingLevel.findMany({
      where: { buildingId },
      include: { building: true },
      orderBy: { level: 'asc' }
    });
    
    return levels.map(l => BuildingLevel.from(l));
  }
}

module.exports = new GameStatisticsRepository();
