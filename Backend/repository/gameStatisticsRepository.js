/**
 * @module repository/gameStatisticsRepository
 * @description
 *   This module provides a repository for managing game statistics, including currency, assets, checkpoints, and achievements.
 *   It uses Prisma as the ORM to interact with the database.
 *
 */

const { PrismaClient } = require("@prisma/client");
const GameStatistics = require("../model/gameStatistics");
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

  //########################################################################
  //                            GAME STATISTICS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_GameStatistics
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to game statistics, including creation, retrieval, and updates.
   */

  /**
   * Creates a new game statistics object for a specific group with the provided currency data.
   *
   * @async
   * @function create
   * @memberof module:repository/gameStatisticsRepository.Repository_GameStatistics
   * @param {Object} params - The parameters for creating game statistics.
   * @param {string} params.groupId - The id of the group to associate with the game statistics.
   * @param {Object} params.currency - The currency object containing game statistics.
   * @param {number} params.currency.greenEnergy - The amount of green energy.
   * @param {number} params.currency.greyEnergy - The amount of grey energy.
   * @param {number} params.currency.coins - The number of coins.
   * @param {number} params.currency.score - The score value.
   * @returns {Promise<GameStatistics>} The created GameStatistics instance.
   */
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

  /**
   * Retrieves all game statistics objects from the database, including related currency, assets, and checkpoints.
   *
   * @async
   * @function getAllGameStatistics
   * @memberof module:repository/gameStatisticsRepository.Repository_GameStatistics
   * @returns {Promise<GameStatistics[]>} A promise that resolves to an array of GameStatistics instances.
   */
  // USED FOR MANUAL TESTING
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

  /**
   * Finds a GameStatistics object by its id with optional related data.
   *
   * @async
   * @function findById
   * @memberof module:repository/gameStatisticsRepository.Repository_GameStatistics
   * @param {string} id - The id of the GameStatistics record.
   * @param {Object} [options] - Options to include related entities.
   * @param {boolean} [options.includeCurrency=true] - Whether to include the currency relation.
   * @param {boolean} [options.includeGameBuildings=true] - Whether to include the gameBuildings relation with building and buildingLevel.
   * @param {boolean} [options.includeAssets=true] - Whether to include the assets relation.
   * @param {boolean} [options.includeCheckpoints=true] - Whether to include the checkpoints relation with currency, buildings, and assets.
   * @param {boolean} [options.includeGroup=false] - Whether to include the group relation.
   * @returns {Promise<GameStatistics|null>} The found GameStatistics instance or null if not found.
   */
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

  /**
   * Retrieves a game statistics record by group id with optional related data.
   *
   * @async
   * @function findByGroupId
   * @memberof module:repository/gameStatisticsRepository.Repository_GameStatistics
   * @param {string} groupId - The id of the group to search for.
   * @param {Object} [opts={}] - Optional settings to include related entities.
   * @param {boolean} [opts.includeCurrency=true] - Whether to include the currency relation.
   * @param {boolean} [opts.includeGameBuildings=true] - Whether to include game buildings with their building and building level relations.
   * @param {boolean} [opts.includeAssets=true] - Whether to include the assets relation.
   * @param {boolean} [opts.includeCheckpoints=false] - Whether to include checkpoints with their currency, buildings, and assets relations.
   * @param {boolean} [opts.includeGroup=false] - Whether to include the group relation.
   * @returns {Promise<GameStatistics|null>} The found GameStatistics instance or null if not found.
   */
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
    return prismaGS ? GameStatistics.from(prismaGS) : null;
  }

  //########################################################################
  //                                CURRENCY
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_Currency
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to currency management, including creation, retrieval, and updates.
   */

  /**
   * Retrieves a currency by its id, including its associated game statistics object.
   *
   * @async
   * @function findCurrencyById
   * @memberof module:repository/gameStatisticsRepository.Repository_Currency
   * @param {string} id - The id of the currency to retrieve.
   * @returns {Promise<Currency|null>} A promise that resolves to a Currency instance if found, or null if not found.
   */
  async findCurrencyById(id) {
    const prismaCurrency = await this.prisma.currency.findUnique({
      where: { id },
      include: { gameStatistics: true },
    });
    return prismaCurrency ? Currency.from(prismaCurrency) : null;
  }

  /**
   * Updates the currency values for a given currency id.
   *
   * @async
   * @function updateCurrency
   * @memberof module:repository/gameStatisticsRepository.Repository_Currency
   * @param {string} currencyId - The id of the currency to update.
   * @param {Object} values - The new currency values.
   * @param {number} values.greenEnergy - The updated amount of green energy.
   * @param {number} values.greyEnergy - The updated amount of grey energy.
   * @param {number} values.coins - The updated amount of coins.
   * @param {number} values.score - The updated score value.
   * @returns {Promise<Currency>} The updated Currency instance.
   * @throws {Error} If any of the currency values are not numbers.
   */
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

  /**
   * Increments the specified currency fields for a given currency id.
   *
   * @async
   * @function incrementCurrency
   * @memberof module:repository/gameStatisticsRepository.Repository_Currency
   * @param {string} currencyId - The id of the currency to update.
   * @param {Object} increments - The amounts to increment for each currency field.
   * @param {number} [increments.greenEnergy=0] - The amount to increment greenEnergy by.
   * @param {number} [increments.greyEnergy=0] - The amount to increment greyEnergy by.
   * @param {number} [increments.coins=0] - The amount to increment coins by.
   * @param {number} [increments.score=0] - The amount to increment score by.
   * @returns {Promise<Currency>} The updated Currency instance.
   */
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

  /**
   * Retrieves the currency associated with a specific game statistics ID.
   *
   * @async
   * @function findCurrencyByGameStatisticsId
   * @memberof module:repository/gameStatisticsRepository.Repository_Currency
   * @param {string} gameStatisticsId - The unique identifier of the game statistics.
   * @returns {Promise<Currency|null>} A promise that resolves to a Currency instance if found, or null if not found.
   */
  async findCurrencyByGameStatisticsId(gameStatisticsId) {
    const currency = await this.prisma.currency.findFirst({
      where: { gameStatisticsId },
      include: { gameStatistics: true },
    });
    return currency ? Currency.from(currency) : null;
  }

  //########################################################################
  //                                 ASSETS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_Assets
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to asset management, including creation, retrieval, and deletion.
   */

  /**
   * Adds a new asset to the database and associates it with the specified game statistics object.
   *
   * @async
   * @function addAsset
   * @memberof module:repository/gameStatisticsRepository.Repository_Assets
   * @param {string} statsId - The id of the game statistics object to associate the asset with.
   * @param {Asset} asset - The asset instance to be added.
   * @returns {Promise<Asset>} The created Asset instance.
   * @throws {ValidationError} If the asset validation fails.
   */
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

  /**
   * Removes an asset from the database by its id.
   *
   * @async
   * @function removeAsset
   * @memberof module:repository/gameStatisticsRepository.Repository_Assets
   * @param {string} assetId - The id of the asset to remove.
   * @returns {Promise<Asset>} The removed asset object.
   */
  async removeAsset(assetId) {
    return await this.prisma.asset.delete({ where: { id: assetId } });
  }

  /**
   * Retrieves all assets associated with a specific game statistics ID.
   *
   * @async
   * @function findAllAssetsByGameStatisticsId
   * @memberof module:repository/gameStatisticsRepository.Repository_Assets
   * @param {string} gameStatisticsId - The ID of the game statistics to find assets for.
   * @returns {Promise<Asset[]>} A promise that resolves to an array of Asset instances.
   */
  async findAllAssetsByGameStatisticsId(gameStatisticsId) {
    const assets = await this.prisma.asset.findMany({
      where: { gameStatisticsId },
      include: { gameStatistics: true },
    });

    return assets.map((a) => Asset.from(a));
  }

  //########################################################################
  //                              CHECKPOINTS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to checkpoint management, including creation, retrieval, and updates.
   */

  /**
   * Creates a checkpoint for a given game statistics id.
   *
   * @async
   * @function recordCheckpoint
   * @memberof module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @param {string} statsId - The id of the game statistics to associate with the checkpoint.
   * @param {Object} cp - The checkpoint data to record.
   * @returns {Promise<Checkpoint>} The created checkpoint instance.
   */
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
            score: currency.score,
          },
        },
        gameBuildings: {
          create: gameBuildings.map((gb) => ({
            building: { connect: { id: gb.building.id } },
            buildingLevel: { connect: { id: gb.buildingLevel.id } },
            // gameStatistics: { connect: { id: statsId } }, // required by schema
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

  /**
   * Retrieves a checkpoint by its unique identifier, including related currency, game buildings (with building and building level), and assets.
   * Throws an error if the checkpoint is not found.
   *
   * @async
   * @function findCheckpointById
   * @memberof module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @param {string} checkpointId - The unique identifier of the checkpoint to retrieve.
   * @returns {Promise<Checkpoint>} The checkpoint instance with all included relations.
   * @throws {Error} If the checkpoint is not found.
   */
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

  /**
   * Retrieves all checkpoints associated with a specific game statistics ID.
   *
   * @async
   * @function findAllCheckpointsByGameStatisticsId
   * @memberof module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @param {string} gameStatisticsId - The ID of the game statistics to find checkpoints for.
   * @returns {Promise<Checkpoint[]>} A promise that resolves to an array of Checkpoint instances.
   */
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

  /**
   * Refactors the game statistics for a given checkpoint.
   *
   * This method performs the following steps:
   * 1. Validates the provided checkpoint.
   * 2. Deletes all existing gameBuildings and assets associated with the specified gameStatistics.
   * 3. Updates the currency values.
   * 4. Upserts (updates or creates) gameBuildings based on the checkpoint data.
   * 5. Creates new assets as specified in the checkpoint.
   * 6. Returns the updated GameStatistics instance.
   *
   * @async
   * @function refactorGameStatistics
   * @memberof module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @param {Object} params - The parameters object.
   * @param {Object} params.checkpoint - The checkpoint object containing updated game statistics data.
   * @param {Function} params.checkpoint.validate - Function to validate the checkpoint data.
   * @param {string} params.checkpoint.gameStatisticsId - The ID of the game statistics to update.
   * @param {Object} params.checkpoint.currency - The updated currency values.
   * @param {number} params.checkpoint.currency.greenEnergy - The updated green energy value.
   * @param {number} params.checkpoint.currency.greyEnergy - The updated grey energy value.
   * @param {number} params.checkpoint.currency.coins - The updated coins value.
   * @param {Array<Object>} params.checkpoint.gameBuildings - Array of game building objects to upsert.
   * @param {Array<Object>} params.checkpoint.assets - Array of asset objects to create.
   * @returns {Promise<GameStatistics>} The updated GameStatistics instance.
   */
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
          upsert: checkpoint.gameBuildings.map((gb) => ({
            where: { id: gb.id }, // Je moet gb.id hebben
            update: {
              id: gb.id,
              building: { connect: { id: gb.building.id } },
              buildingLevel: { connect: { id: gb.buildingLevel.id } },
            },
            create: {
              building: { connect: { id: gb.building.id } },
              buildingLevel: { connect: { id: gb.buildingLevel.id } },
            },
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

  /**
   * Removes a checkpoint from the database by its id.
   *
   * @async
   * @function removeCheckpoint
   * @memberof module:repository/gameStatisticsRepository.Repository_Checkpoints
   * @param {string} checkpointId - The id of the checkpoint to remove.
   * @returns {Promise<Checkpoint>} The removed checkpoint object.
   */
  async removeCheckpoint(checkpointId) {
    return await this.prisma.checkpoint.delete({ where: { id: checkpointId } });
  }

  //########################################################################
  //                            BUILDING LEVELS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_BuildingLevels
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to building levels, including retrieval by building id and level.
   */

  /**
   * Retrieves a BuildingLevel instance by its building id and level.
   *
   * @async
   * @function findBuildingLevelByBuildingIdAndLevel
   * @memberof module:repository/gameStatisticsRepository.Repository_BuildingLevels
   * @param {string} buildingId - The id of the building associated with the BuildingLevel.
   * @param {number} level - The level of the BuildingLevel.
   * @returns {Promise<BuildingLevel|null>} A promise that resolves to the BuildingLevel instance if found, or null otherwise.
   */
  async findBuildingLevelByBuildingIdAndLevel(buildingId, level) {
    const buildingLevel = await this.prisma.buildingLevel.findUnique({
      where: { buildingId_level: { buildingId: buildingId, level: level } },
      include: { building: true },
    });
    return buildingLevel ? BuildingLevel.from(buildingLevel) : null;
  }

  //########################################################################
  //                             GAME BUILDINGS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to game buildings, including creation, retrieval, and upgrades.
   */

  /**
   * Retrieves a game building by its id, including its associated game statistics, building, and building level objetcs.
   *
   * @async
   * @function findGameBuildingById
   * @memberof module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @param {string} gameBuildingId - The id of the game building to retrieve.
   * @returns {Promise<GameBuildings|null>} A promise that resolves to a GameBuildings instance if found, or null otherwise.
   */
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

  /**
   * Retrieves all game buildings associated with a specific group id.
   *
   * @async
   * @function findAllGameBuildingsByGroupId
   * @memberof module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @param {string} groupId - The id of the group to fetch game buildings for.
   * @returns {Promise<GameBuildings[]>} A promise that resolves to an array of GameBuildings instances.
   */
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

  /**
   * Retrieves all game building records associated with a specific game statistics ID.
   *
   * @async
   * @function findAllGameBuildingsByGameStatisticsId
   * @memberof module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @param {string} gameStatisticsId - The unique identifier of the game statistics record.
   * @returns {Promise<Array<GameBuildings>>} A promise that resolves to an array of GameBuildings instances.
   */
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

  /**
   * Upgrades the level of a game building by updating its associated building level.
   *
   * @async
   * @function upgradeGameBuildingLevel
   * @memberof module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @param {number} gameBuildingId - The id of the game building to upgrade.
   * @param {number} buildingLevelId - The id of the new building level to associate.
   * @returns {Promise<GameBuildings>} The updated GameBuildings instance after the level upgrade.
   */
  async upgradeGameBuildingLevel(gameBuildingId, buildingLevelId) {
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

  /**
   * Flips the `runsOnGreen` flag for the specified GameBuildings record.
   *
   * @async
   * @function toggleGameBuildingRunsOnGreen
   * @memberof module:repository/gameStatisticsRepository.Repository_GameBuildings
   * @param {string} gameBuildingId
   * @returns {Promise<GameBuildings>}
   */
  async toggleGameBuildingRunsOnGreen(gameBuildingId) {
    const existing = await this.prisma.gameBuildings.findUnique({
      where: { id: gameBuildingId },
      select: { runsOnGreen: true },
    });
    if (!existing) {
      throw new Error("GameBuilding not found");
    }

    const updated = await this.prisma.gameBuildings.update({
      where: { id: gameBuildingId },
      data: { runsOnGreen: !existing.runsOnGreen },
      include: {
        gameStatistics: true,
        building: true,
        buildingLevel: true,
      },
    });
    return GameBuildings.from(updated);
  }

  //########################################################################
  //                              ACHIEVEMENTS
  //########################################################################

  /**
   * @namespace module:repository/gameStatisticsRepository.Repository_Achievements
   * @memberof module:repository/gameStatisticsRepository
   * @description
   *   All repository methods related to achievements, including creation, retrieval, and association with game statistics.
   */

  /**
   * Finds an achievement by its title.
   *
   * @async
   * @function findAchievementByTitle
   * @memberof module:repository/gameStatisticsRepository.Repository_Achievements
   * @param {string} title - The title of the achievement to find.
   * @returns {Promise<Achievement|null>} The achievement object if found, otherwise null.
   */
  async findAchievementByTitle(title) {
    return await this.prisma.achievement.findUnique({ where: { title } });
  }

  /**
   * Adds an achievement to the specified GameStatistics entry by its id and achievement title and updates the coins.
   *
   * @async
   * @function addAchievementToGameStatistics
   * @memberof module:repository/gameStatisticsRepository.Repository_Achievements
   * @param {string} gameStatisticsId - The id of the GameStatistics entry.
   * @param {Achievement} achievement - The achievement to add.
   * @returns {Promise<GameStatistics>} The updated GameStatistics entry with the updated currency and achievements included.
   * @throws {Error} If the achievement does not exist or is already associated with the GameStatistics entry.
   */
  async addAchievementToGameStatistics(gameStatisticsId, achievement) {
    // Update the GameStatistics entry to add the achievement and increment the coins
    return await this.prisma.gameStatistics.update({
      where: { id: gameStatisticsId },
      data: {
        currency: {
          update: {
            coins: { increment: achievement.reward },
            score: { increment: achievement.score },
          },
        },
        achievements: {
          connect: { id: achievement.id },
        },
      },
      include: {
        currency: true,
        achievements: true,
      },
    });
  }

  /**
   * Retrieves the achievements associated with a specific GameStatistics entry.
   *
   * @async
   * @function getGameStatisticsAchievements
   * @memberof module:repository/gameStatisticsRepository.Repository_Achievements
   * @param {string} gameStatisticsId - The id of the GameStatistics entry.
   * @returns {Promise<Achievement[]>} A promise that resolves to an array of Achievement instances.
   * @throws {Error} If no GameStatistics entry is found with the provided id.
   */
  async getGameStatisticsAchievements(gameStatisticsId) {
    const gameStatistics = await this.prisma.gameStatistics.findUnique({
      where: { id: gameStatisticsId },
      include: {
        achievements: true,
      },
    });
    return gameStatistics
      ? gameStatistics.achievements.map(Achievement.from)
      : null;
  }
}

module.exports = new GameStatisticsRepository();
