const { PrismaClient } = require("@prisma/client");
const GameStatistics = require("../model/gameStatistics");
const Building = require("../model/building");
const BuildingLevel = require("../model/buildingLevel");
const GameBuildings = require("../model/gameBuildings");
const Asset = require("../model/asset");
const Currency = require("../model/currency");
const Checkpoint = require("../model/checkpoint");
const Achievement = require("../model/achievement");

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
            score: currency.score,
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
        assets: true,
        checkpoints: {
          include: {
            currency: true,
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

  async updateCurrency(currencyId, { greenEnergy, greyEnergy, coins, score }) {
    if (
      typeof greenEnergy !== "number" ||
      typeof greyEnergy !== "number" ||
      typeof coins !== "number" ||
      typeof score !== "number"
    ) {
      throw new Error("Invalid currency values");
    }

    const updated = await this.prisma.currency.update({
      where: { id: currencyId },
      data: { greenEnergy, greyEnergy, coins, score },
    });

    return Currency.from(updated);
  }

  async incrementCurrency(
    currencyId,
    { greenEnergy = 0, greyEnergy = 0, coins = 0, score = 0 }
  ) {
    const updated = await this.prisma.currency.update({
      where: { id: currencyId },
      data: {
        greenEnergy: { increment: greenEnergy },
        greyEnergy: { increment: greyEnergy },
        coins: { increment: coins },
        score: { increment: score },
      },
    });

    return Currency.from(updated);
  }

  async incrementGreenEnergyWithMultiplier(groupId, greenEnergy, type) {
    const gs = await this.findByGroupId(groupId);

    if (!gs || !gs.currency || !gs.assets) {
      throw new Error("GameStatistics, currency of assets niet gevonden");
    }

    const typeMap = {
      WIND: "windmolen",
      SOLAR: "zonnepaneel",
      WATER: "waterrad",
    };

    const assetType = typeMap[type.toUpperCase()];
    if (!assetType) throw new Error(`Onbekend green energy type: ${type}`);

    const matchingAssets = gs.assets.filter(
      (a) => a.type.toLowerCase() === assetType
    );

    const totalGain = matchingAssets.reduce((sum, asset) => {
      return sum + greenEnergy * asset.energy;
    }, 0);

    const updated = await this.prisma.currency.update({
      where: { id: gs.currency.id },
      data: {
        greenEnergy: { increment: totalGain },
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
            score: cp.currency.score,
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

  // Achievements ---------------------------------------------------------------------------------------------------------------------------------------------------
  /**
   * Finds an achievement by its title.
   *
   * @param {string} title - The title of the achievement to find.
   * @returns {Promise<Object|null>} The achievement object if found, otherwise null.
   */
  async findAchievementByTitle(title) {
    return await this.prisma.achievement.findUnique({ where: { title }});
  }
  

  /**
   * Adds an achievement to the specified GameStatistics entry by its ID and achievement title and updates the coins.
   *
   * @param {string} gameStatisticsId - The unique identifier of the GameStatistics entry.
   * @param {string} title - The title of the achievement to add.
   * @returns {Promise<Object>} The updated GameStatistics entry with the updated currency and achievements included.
   * @throws {Error} If the achievement does not exist or is already associated with the GameStatistics entry.
   */
  async addAchievementToGameStatistics(gameStatisticsId, title) {
    // Get the achievement instance by title and ensure it exists
    const achievement = await this.findAchievementByTitle(title);
    if (!achievement) {
      throw new Error(`Achievement with title "${title}" not found`);
    }

    // Get current achievements and check if this achievement already exists by ID
    const currentAchievements = await this.getGameStatisticsAchievements(gameStatisticsId);
    const achievementExists = currentAchievements.some(a => a.id === achievement.id);
    
    // If the achievement already exists, throw an error
    if (achievementExists) {
      throw new Error(`Achievement "${title}" already exists in GameStatistics with id "${gameStatisticsId}"`);
    }

    // Update the GameStatistics entry to add the achievement and increment the coins
    const updatedGameStatistics = await this.prisma.gameStatistics.update({
      where: { id: gameStatisticsId },
      data: {
        currency: {
          update: {
            coins: { increment: achievement.reward },
          }
        },
        achievements: {
          connect: { id: achievement.id }
        }
      },
      include: {
        currency: true,
        achievements: true
      }
    });
    
    return updatedGameStatistics;
  }
  

  /**
   * Retrieves the achievements associated with a specific GameStatistics entry.
   *
   * @param {string} gameStatisticsId - The unique identifier of the GameStatistics entry.
   * @returns {Promise<Array>} A promise that resolves to an array of Achievement instances.
   * @throws {Error} If no GameStatistics entry is found with the provided id.
   */
  async getGameStatisticsAchievements(gameStatisticsId) {
    const gameStatistics = await this.prisma.gameStatistics.findUnique({
      where: { id: gameStatisticsId },
      include: {
        achievements: true
      }
    });
    
    if (!gameStatistics) {
      throw new Error(`GameStatistics with id "${gameStatisticsId}" not found`);
    }
    
    return gameStatistics.achievements.map(Achievement.from);
  }
}

module.exports = new GameStatisticsRepository();
