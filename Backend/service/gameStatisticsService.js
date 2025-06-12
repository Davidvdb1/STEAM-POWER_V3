/**
 * @module service/gameStatisticsService
 * @description
 *   All GameStatistics-related logic is handled here.
 *   This includes creating, retrieving, updating, and deleting game statistics,
 *   as well as managing currency, assets, checkpoints, game buildings, and achievements.
 * @requires module:repository/gameStatisticsRepository
 */

require("@prisma/client");
const gameStatisticsRepository = require("../repository/gameStatisticsRepository");
const GameStatistics = require("../model/gameStatistics");
const Currency = require("../model/currency");
const Building = require("../model/building");
const Asset = require("../model/asset");
const Nature = require("../model/nature");
const Checkpoint = require("../model/checkpoint");
const GameBuildings = require("../model/gameBuildings");
const Achievement = require("../model/achievement");

const scoreCost = {
  buildingOnGreen: 1,
  Nature: {
    Beuk: 4,
    Eik: 3,
    Buxus: 2,
    Hulst: 1,
  },
  ActiveGreenSource: {
    Windmolen: 1,
    Zonnepaneel: 1,
    Waterrad: 1,
  },
  buildingOnGrey: -1,
  ActiveGreySource: -2,
  energyBuildingLevel: {
    1: -4,
    2: -3,
    3: -2,
    4: -1,
    5: 0,
  },
};

const beginAssetCoordinates = [
  {
    xLocation: 65,
    yLocation: 42,
  },
  {
    xLocation: 82,
    yLocation: 32,
  },
  {
    xLocation: 128,
    yLocation: 42,
  },
  {
    xLocation: 46,
    yLocation: 24,
  },
  {
    xLocation: 123,
    yLocation: 59,
  },
  {
    xLocation: 61,
    yLocation: 59,
  },
  {
    xLocation: 91,
    yLocation: 59,
  },
];

const defaultKernCentrale = {
  type: "Kerncentrale",
  energy: 250,
  buildCost: 20,
  destroyCost: 20,
  xSize: 12,
  ySize: 10,
};

class GameStatisticsService {
  //########################################################################
  //                            GAME STATISTICS
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_GameStatistics
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for creating, retrieving, and querying GameStatistics entries.
   */

  /**
   * Creates a new game statistics object for a specific group with the provided currency data.
   *
   * @async
   * @function create
   * @memberOf module:service/gameStatisticsService.Service_GameStatistics
   * @param {Object} params - The parameters for creating game statistics.
   * @param {string} params.groupId - The id of the group to associate with the game statistics.
   * @param {number} [params.greenEnergy] - The amount of green energy (optional).
   * @param {number} [params.greyEnergy] - The amount of grey energy (optional).
   * @param {number} [params.coins] - The number of coins (optional).
   * @param {number} [params.score] - The score value (optional).
   * @returns {Promise<GameStatistics>} The created game statistics object.
   */
  async create({ groupId, greenEnergy, greyEnergy, coins, score }) {
    const currency = new Currency({
      greenEnergy: greenEnergy ?? Currency.DEFAULT_GREEN_ENERGY,
      greyEnergy: greyEnergy ?? Currency.DEFAULT_GREY_ENERGY,
      coins: coins ?? Currency.STARTING_COINS,
      score: score ?? Currency.STARTING_SCORE,
    });
    const gamestats = await gameStatisticsRepository.create({
      groupId,
      currency,
    });

    for (let i = 0; i < beginAssetCoordinates.length && i < 7; i++) {
      const assetData = {
        ...defaultKernCentrale,
        xLocation: beginAssetCoordinates[i].xLocation,
        yLocation: beginAssetCoordinates[i].yLocation,
        gameStatisticsId: gamestats.id,
      };

      const assetInstance = new Asset(assetData);

      await gameStatisticsRepository.addAsset(gamestats.id, assetInstance);
    }

    const totalKerncentrales = 7;
    const totalScoreChange = scoreCost.ActiveGreySource * totalKerncentrales;
    const totalGreyEnergy = defaultKernCentrale.energy * totalKerncentrales;

    await gameStatisticsRepository.updateCurrency(gamestats.currency.id, {
      greenEnergy: gamestats.currency.greenEnergy,
      greyEnergy: gamestats.currency.greyEnergy + totalGreyEnergy,
      coins: gamestats.currency.coins,
      score: gamestats.currency.score + totalScoreChange,
    });

    return await gameStatisticsRepository.findById(gamestats.id, {
      includeCurrency: true,
      includeGameBuildings: true,
      includeAssets: true,
      includeCheckpoints: false,
      includeGroup: false,
    });
  }

  async deleteGameStatistics(id) {
    return await gameStatisticsRepository.deleteById(id);
  }

  // USED FOR MANUAL TESTING
  /**
   * Retrieves all game statistics objects from the repository.
   *
   * @async
   * @function getAllGameStatistics
   * @memberOf module:service/gameStatisticsService.Service_GameStatistics
   * @returns {Promise<GameStatistics[]>} A promise that resolves to an array of GameStatistics objects.
   */
  async getAllGameStatistics() {
    return await gameStatisticsRepository.getAllGameStatistics();
  }

  /**
   * Retrieves a GameStatistics object by its id with optional related data.
   *
   * @async
   * @function getById
   * @memberOf module:service/gameStatisticsService.Service_GameStatistics
   * @param {string} id - The id of the GameStatistics record.
   * @param {boolean} [includeCurrency=true] - Whether to include currency data.
   * @param {boolean} [includeGameBuildings=true] - Whether to include game buildings data.
   * @param {boolean} [includeAssets=true] - Whether to include assets data.
   * @param {boolean} [includeCheckpoints=true] - Whether to include checkpoints data.
   * @param {boolean} [includeGroup=false] - Whether to include group data.
   * @returns {Promise<GameStatistics|null>} The found GameStatistics instance or null if not found.
   */
  async getById(
    id,
    includeCurrency = true,
    includeGameBuildings = true,
    includeAssets = true,
    includeCheckpoints = true,
    includeGroup = false
  ) {
    return await gameStatisticsRepository.findById(id, {
      includeCurrency,
      includeGameBuildings,
      includeAssets,
      includeCheckpoints,
      includeGroup,
    });
  }

  /**
   * Retrieves a game statistics record by group id with optional related data.
   *
   * @async
   * @function getByGroupId
   * @memberOf module:service/gameStatisticsService.Service_GameStatistics
   * @param {string} groupId - The id of the group to search for.
   * @param {boolean} [includeCurrency=true] - Whether to include currency information in the result.
   * @param {boolean} [includeGameBuildings=true] - Whether to include game buildings in the result.
   * @param {boolean} [includeAssets=true] - Whether to include assets in the result.
   * @param {boolean} [includeCheckpoints=true] - Whether to include checkpoints in the result.
   * @param {boolean} [includeGroup=false] - Whether to include group details in the result.
   * @returns {Promise<GameStatistics>} The Gamestatistics object.
   */
  async getByGroupId(
    groupId,
    includeCurrency = true,
    includeGameBuildings = true,
    includeAssets = true,
    includeCheckpoints = true,
    includeGroup = false
  ) {
    return await gameStatisticsRepository.findByGroupId(groupId, {
      includeCurrency,
      includeGameBuildings,
      includeAssets,
      includeCheckpoints,
      includeGroup,
    });
  }

  //########################################################################
  //                                CURRENCY
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_Currency
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for managing currency in game statistics.
   *  This includes retrieving, updating, and incrementing currency values.
   */

  /**
   * Retrieves a Currency object by its id.
   *
   * @async
   * @function getCurrencyById
   * @memberOf module:service/gameStatisticsService.Service_Currency
   * @param {string} currencyId - The id of the currency to retrieve.
   * @returns {Promise<Currency|null>} A promise that resolves to a Currency instance if found, or null if not found.
   */
  async getCurrencyById(currencyId) {
    return await gameStatisticsRepository.findCurrencyById(currencyId);
  }

  /**
   * Updates the currency values for a given currency id with the given payload.
   *
   * @async
   * @function updateCurrency
   * @memberOf module:service/gameStatisticsService.Service_Currency
   * @param {string} currencyId - The id of the currency to update.
   * @param {Object} payload - The new currency values.
   * @param {number} payload.greenEnergy - The updated amount of green energy.
   * @param {number} payload.greyEnergy - The updated amount of grey energy.
   * @param {number} payload.coins - The updated amount of coins.
   * @param {number} payload.score - The updated score value.
   * @returns {Promise<Currency>} The updated Currency object.
   */
  async updateCurrency(currencyId, payload) {
    return await gameStatisticsRepository.updateCurrency(currencyId, payload);
  }

  /**
   * Increments the specified currency fields for a given currency id.
   *
   * @async
   * @function incrementCurrency
   * @memberOf module:service/gameStatisticsService.Service_Currency
   * @param {string} currencyId - The id of the currency to update.
   * @param {Object} payload - The amounts to increment for each currency field.
   * @param {number} [payload.greenEnergy=0] - The amount to increment greenEnergy by.
   * @param {number} [payload.greyEnergy=0] - The amount to increment greyEnergy by.
   * @param {number} [payload.coins=0] - The amount to increment coins by.
   * @param {number} [payload.score=0] - The amount to increment score by.
   * @returns {Promise<Currency>} The updated Currency instance.
   */
  async incrementCurrency(currencyId, payload) {
    return gameStatisticsRepository.incrementCurrency(currencyId, payload);
  }

  //########################################################################
  //                                 ASSETS
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_Assets
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for managing assets in game statistics.
   *   This includes adding, removing, and retrieving assets associated with game statistics.
   */

  /**
   * Adds an asset to the game statistics for the given statsId.
   * Determines the asset type (Nature or Asset), creates an instance, and adds it via the repository.
   * After adding, checks if any asset-related achievements have been achieved and adds them to the game statistics if so.
   *
   * @async
   * @function addAsset
   * @memberOf module:service/gameStatisticsService.Service_Assets
   * @param {string} statsId - The id of the game statistics object to associate the asset with.
   * @param {Object} aData - The data for the asset to be added.
   * @param {number} aData.buildCost - The cost to build the asset.
   * @param {number} aData.destroyCost - The cost to destroy the asset.
   * @param {number} aData.energy - The energy produced by the asset.
   * @param {number} aData.xLocation - The x-coordinate location of the asset.
   * @param {number} aData.yLocation - The y-coordinate location of the asset.
   * @param {number} aData.xSize - The width of the asset.
   * @param {number} aData.ySize - The height of the asset.
   * @param {string} aData.type - The type of the asset.
   * @param {string} aData.gameStatisticsId - The id for the game statistics to which the asset belongs.
   * @returns {Promise<{asset: Asset, newlyEarnedAchievements: Achievement[]}>} The added Asset object and any newly earned achievements.
   */
  async addAsset(statsId, aData) {
    const { type } = aData;
    let assetInstance;
    if (Nature.allowedTypes.includes(type)) {
      assetInstance = new Nature(aData);
    } else {
      assetInstance = new Asset(aData);
    }
    const addedAsset = await gameStatisticsRepository.addAsset(
      statsId,
      assetInstance
    );

    // Update the currency after adding the asset
    const gameStatistics = await gameStatisticsRepository.findById(statsId, {
      includeCurrency: true,
      includeGameBuildings: false,
      includeAssets: false,
      includeCheckpoints: false,
      includeGroup: false,
    });

    let scoreChange = 0;

    if (Nature.allowedTypes.includes(addedAsset.type)) {
      scoreChange = scoreCost.Nature[addedAsset.type] || 0;
    } else if (scoreCost.ActiveGreenSource[addedAsset.type]) {
      scoreChange = scoreCost.ActiveGreenSource[addedAsset.type];
    } else if (addedAsset.type === "Kerncentrale") {
      scoreChange = scoreCost.ActiveGreySource;
    }

    await gameStatisticsRepository.updateCurrency(gameStatistics.currency.id, {
      greenEnergy:
        addedAsset.type !== "Kerncentrale"
          ? gameStatistics.currency.greenEnergy + addedAsset.energy
          : gameStatistics.currency.greenEnergy,
      greyEnergy:
        addedAsset.type === "Kerncentrale"
          ? gameStatistics.currency.greyEnergy + addedAsset.energy
          : gameStatistics.currency.greyEnergy,
      coins:
        gameStatistics.currency.coins - addedAsset.buildCost < 0
          ? gameStatistics.currency.coins - addedAsset.buildCost * 1.1
          : gameStatistics.currency.coins - addedAsset.buildCost,
      score: gameStatistics.currency.score + scoreChange,
    });

    // Check if any achievement for placing an asset has been achieved. If so add them to the GameStatistics object
    const assetAchievements = [
      "Energie-ingenieur",
      "Energie-architect",
      "Groene vingers",
      "Frisse adem", 
      "Schone lucht"
    ];
    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      statsId,
      assetAchievements
    );

    // Return both the added Asset and any newly earned Achievements
    return {
      asset: addedAsset,
      newlyEarnedAchievements: newlyEarnedAchievements,
    };
  }

  /**
   * Removes an asset by its id and checks if the "Milieuheld" achievement has been achieved as a result.
   * If the achievement is achieved, it is added to the game statistics.
   *
   * @async
   * @function removeAsset
   * @memberOf module:service/gameStatisticsService.Service_Assets
   * @param {string} assetId - The id of the asset to remove.
   * @returns {Promise<{asset: Asset, newlyEarnedAchievements: Achievement[]}>} The removed Asset object and any newly earned achievements.
   */

  async removeAsset(assetId) {
    const removedAsset = await gameStatisticsRepository.removeAsset(assetId);

    const gameStatistics = await gameStatisticsRepository.findById(
      removedAsset.gameStatisticsId,
      {
        includeCurrency: true,
        includeGameBuildings: false,
        includeAssets: false,
        includeCheckpoints: false,
        includeGroup: false,
      }
    );

    let scoreChange = 0;

    if (Nature.allowedTypes.includes(removedAsset.type)) {
      scoreChange = -(scoreCost.Nature[removedAsset.type] || 0);
    } else if (scoreCost.ActiveGreenSource[removedAsset.type]) {
      scoreChange = -scoreCost.ActiveGreenSource[removedAsset.type];
    } else if (removedAsset.type === "Kerncentrale") {
      scoreChange = -scoreCost.ActiveGreySource;
    }

    await gameStatisticsRepository.updateCurrency(gameStatistics.currency.id, {
      greenEnergy:
        removedAsset.type !== "Kerncentrale"
          ? gameStatistics.currency.greenEnergy - removedAsset.energy
          : gameStatistics.currency.greenEnergy,
      greyEnergy:
        removedAsset.type === "Kerncentrale"
          ? gameStatistics.currency.greyEnergy - removedAsset.energy
          : gameStatistics.currency.greyEnergy,
      coins:
        gameStatistics.currency.coins - removedAsset.destroyCost < 0
          ? gameStatistics.currency.coins
          : gameStatistics.currency.coins,
      score: gameStatistics.currency.score + scoreChange,
    });

    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      removedAsset.gameStatisticsId,
      ["Milieuheld", "Geen grijs", "Frisse adem", "Schone lucht"],
      removedAsset
    );

    return {
      asset: removedAsset,
      newlyEarnedAchievements: newlyEarnedAchievements,
    };
  }

  /**
   * Retrieves all assets associated with a specific game statistics ID.
   *
   * @async
   * @function findAllAssetsByGameStatisticsId
   * @memberOf module:service/gameStatisticsService.Service_Assets
   * @param {string} gameStatisticsId - The unique identifier of the game statistics.
   * @returns {Promise<Array>} A promise that resolves to an array of assets related to the given game statistics ID.
   */
  async findAllAssetsByGameStatisticsId(gameStatisticsId) {
    return await gameStatisticsRepository.findAllAssetsByGameStatisticsId(
      gameStatisticsId
    );
  }

  //########################################################################
  //                              CHECKPOINTS
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_Checkpoints
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for managing checkpoints in game statistics.
   *   This includes creating, retrieving, and removing checkpoints associated with game statistics.
   */

  /**
   * Creates a checkpoint for a given game statistics id.
   *
   * @async
   * @function recordCheckpoint
   * @memberof module:service/gameStatisticsService.Service_Checkpoints
   * @param {string} statsId - The id of the game statistics to associate with the checkpoint.
   * @returns {Promise<Checkpoint>} The created checkpoint instance.
   */
  async recordCheckpoint(statsId) {
    const gameStatistics = await gameStatisticsRepository.findById(statsId);
    const achievements =
      await gameStatisticsRepository.getGameStatisticsAchievements(statsId);

    return await gameStatisticsRepository.recordCheckpoint(
      gameStatistics.id,
      gameStatistics.currency,
      gameStatistics.gameBuildings,
      gameStatistics.assets,
      achievements
    );
  }

  /**
   * Retrieves all checkpoints associated with a specific game statistics ID.
   *
   * @async
   * @function findAllCheckpointsByGameStatisticsId
   * @memberof module:service/gameStatisticsService.Service_Checkpoints
   * @param {string|number} gameStatisticsId - The unique identifier of the game statistics.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of checkpoint objects.
   */
  async findAllCheckpointsByGameStatisticsId(gameStatisticsId) {
    return await gameStatisticsRepository.findAllCheckpointsByGameStatisticsId(
      gameStatisticsId
    );
  }

  /**
   * Removes a checkpoint from the game statistics repository by its id.
   *
   * @async
   * @function removeCheckpoint
   * @memberof module:service/gameStatisticsService.Service_Checkpoints
   * @param {string} checkpointId - The id of the checkpoint to remove.
   * @returns {Promise<Checkpoint>} The removed checkpoint object.
   */
  async removeCheckpoint(checkpointId) {
    return await gameStatisticsRepository.removeCheckpoint(checkpointId);
  }

  /**
   * Refactors game statistics for a given checkpoint.
   *
   * @async
   * @function refactorGameStatistics
   * @memberof module:service/gameStatisticsService.Service_Checkpoints
   * @param {string} checkpointId - The ID of the checkpoint to refactor statistics for.
   * @returns {Promise<GameStatistics>} The restored GameStatistics object.
   */
  async refactorGameStatistics(checkpointId) {
    const checkpoint = await gameStatisticsRepository.findCheckpointById(
      checkpointId
    );
    return await gameStatisticsRepository.refactorGameStatistics({
      checkpoint,
    });
  }

  //########################################################################
  //                             GAME BUILDINGS
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_GameBuildings
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for managing game buildings in game statistics.
   *   This includes retrieving, upgrading, and managing game buildings associated with game statistics.
   */

  /**
   * Retrieves all game buildings associated with a specific group id.
   *
   * @async
   * @function getAllGameBuildingsByGroupId
   * @memberof module:service/gameStatisticsService.Service_GameBuildings
   * @param {string} groupId - The id of the group to fetch game buildings for.
   * @returns {Promise<GameBuildings[]>} A promise that resolves to an array of GameBuildings instances.
   */
  async getAllGameBuildingsByGroupId(groupId) {
    return await gameStatisticsRepository.findAllGameBuildingsByGroupId(
      groupId
    );
  }

  /**
   * Upgrades the level of a GameBuilding by its id.
   * Retrieves the GameBuilding and updates the GameBuilding's BuildingLevel object.
   * Updates the Currency after the upgrade based on the current BuildingLevel's upgrade cost.
   * Checks for and awards any relevant achievements after the upgrade.
   *
   * @async
   * @function upgradeGameBuilding
   * @memberof module:service/gameStatisticsService.Service_GameBuildings
   * @param {string} gameBuildingId - The id of the GameBuilding to upgrade.
   * @param {number} nextLevel - The new level to upgrade the building to.
   * @returns {Promise<{gameBuilding: GameBuildings, newlyEarnedAchievements: Achievement[]}>} The updated GameBuilding object and any newly earned achievements.
   * @throws {Error} If the GameBuilding or the next BuildingLevel is not found.
   */
  async upgradeGameBuilding(gameBuildingId, { nextLevel }) {
    // 1) Fetch the GameBuilding record
    const gameBuilding = await gameStatisticsRepository.findGameBuildingById(
      gameBuildingId
    );
    if (!gameBuilding) {
      throw new Error(`GameBuilding with id ${gameBuildingId} not found`);
    }

    // 2) Determine current level and ensure nextLevel is valid
    const currentLevelObj =
      await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(
        gameBuilding.building.id,
        gameBuilding.buildingLevel.level
      );
    if (!currentLevelObj) {
      throw new Error(
        `Current BuildingLevel for buildingId=${gameBuilding.building.id} not found`
      );
    }
    const currentLevel = currentLevelObj.level;
    if (currentLevel + 1 !== nextLevel) {
      throw new Error(
        `Invalid nextLevel: currentLevel=${currentLevel}, requested nextLevel=${nextLevel}`
      );
    }

    // 3) Look up the baseCost from the current BuildingLevel object
    const baseCost = currentLevelObj.upgradeCost;

    // 4) Fetch the player's GameStatistics (including currency)
    const gameStats = await gameStatisticsRepository.findById(
      gameBuilding.gameStatisticsId,
      {
        includeCurrency: true,
        includeGameBuildings: false,
        includeAssets: false,
      }
    );
    if (!gameStats) {
      throw new Error(
        `GameStatistics with id ${gameBuilding.gameStatisticsId} not found`
      );
    }
    const playerCoins = gameStats.currency.coins;

    // 5) Compute finalCost: if playerCoins < baseCost, apply 10% penalty
    const finalCost =
      playerCoins < baseCost ? Math.ceil(baseCost * 1.1) : baseCost;

    // 6) Optional overdraft check (adjust ALLOWED_OVERDRAFT as needed)
    const ALLOWED_OVERDRAFT = 100;
    if (playerCoins - finalCost < -ALLOWED_OVERDRAFT) {
      throw new Error(
        `Niet genoeg coins om te upgraden (benodigd: ${finalCost}, beschikbaar: ${playerCoins})`
      );
    }

    // 7) Subtract exactly finalCost from player's coins
    const newCoinTotal = playerCoins - finalCost;
    await gameStatisticsRepository.updateCurrency(gameStats.currency.id, {
      greenEnergy: gameStats.currency.greenEnergy,
      greyEnergy: gameStats.currency.greyEnergy,
      coins: newCoinTotal,
      score: gameStats.currency.score,
    });

    // 8) Fetch the BuildingLevel entry for nextLevel
    const nextLevelObj =
      await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(
        gameBuilding.building.id,
        nextLevel
      );
    if (!nextLevelObj) {
      throw new Error(
        `BuildingLevel ${nextLevel} for buildingId=${gameBuilding.building.id} not found`
      );
    }

    // 9) Update the GameBuilding’s level pointer in the DB
    const updatedGameBuildingRecord =
      await gameStatisticsRepository.upgradeGameBuildingLevel(
        gameBuildingId,
        nextLevelObj.id
      );
    
    // Check if any achievement for upgrading a building has been achieved. If so add them to the GameStatistics object
    const buildingAchievements = [
      "Bouwassistent",
      "Bouwmeester",
      "Bouwkampioen",
      "Frisse adem", 
      "Schone lucht",
      "EU gemiddelde"
    ];

    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      gameStats.id,
      buildingAchievements
    );

    // Return both the updated GameBuilding and any newly earned Achievements
    return {
      gameBuilding: updatedGameBuildingRecord,
      newlyEarnedAchievements: newlyEarnedAchievements,
    };
  }

  /**

   * Toggles the 'runsOnGreen' status of a game building by its id.
   *
   * @async
   * @function toggleGameBuildingRunsOnGreen
   * @memberof module:service/gameStatisticsService.Service_GameBuildings
   * @param {string} gameBuildingId - The id of the GameBuilding to toggle.
   * @returns {Promise<{gameBuilding: GameBuildings, newlyEarnedAchievements: Achievement[]}>} The updated GameBuilding object and any newly earned achievements.
   */
  async toggleGameBuildingRunsOnGreen(gameBuildingId) {
    const gameBuilding = await gameStatisticsRepository.findGameBuildingById(
      gameBuildingId
    );
    const gameStatistics = await gameStatisticsRepository.findById(
      gameBuilding.gameStatisticsId
    );
    if (gameBuilding.runsOnGreen) {
      await gameStatisticsRepository.updateCurrency(
        gameStatistics.currency.id,
        {
          greenEnergy: gameStatistics.currency.greenEnergy,
          greyEnergy: gameStatistics.currency.greyEnergy,
          coins: gameStatistics.currency.coins,
          score: gameStatistics.currency.score - 1,
        }
      );
    } else {
      await gameStatisticsRepository.updateCurrency(
        gameStatistics.currency.id,
        {
          greenEnergy: gameStatistics.currency.greenEnergy,
          greyEnergy: gameStatistics.currency.greyEnergy,
          coins: gameStatistics.currency.coins,
          score: gameStatistics.currency.score + 1,
        }
      );
    }

    const updatedGameBuilding = await gameStatisticsRepository.toggleGameBuildingRunsOnGreen(
      gameBuildingId
    );

    const achievements = ["Eerste stap", "Efficiëntie-expert", "Frisse adem", "Schone lucht", "EU gemiddelde"]
    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      gameBuilding.gameStatisticsId,
      achievements
    );

    return {
      gameBuilding: updatedGameBuilding,
      newlyEarnedAchievements: newlyEarnedAchievements,
    };
  }

  /**
   * Fetches all game‐buildings under a given gameStatisticsId where runsOnGreen is true,
   * subtracts 1 from the score for each of those buildings, then flips all of them to false.
   *
   * @async
   * @function toggleAllGameBuildingsRunsOnGreenFalse
   * @memberof module:service/gameStatisticsService.Service_GameBuildings
   * @param {string} gameStatisticsId
   * @returns {Promise<GameBuildings[]>} The list of updated GameBuilding objects
   */
  async toggleAllGameBuildingsRunsOnGreenFalse(gameStatisticsId) {
    const gameStatistics = await gameStatisticsRepository.findById(
      gameStatisticsId
    );
    if (!gameStatistics) {
      throw new Error(`No GameStatistics found for id=${gameStatisticsId}`);
    }

    const buildingsOnGreen = await gameStatisticsRepository.findGameBuildings({
      gameStatisticsId: gameStatisticsId,
      runsOnGreen: true,
    });

    if (buildingsOnGreen.length > 0) {
      const currentCurrency = gameStatistics.currency;
      const decrementAmount = buildingsOnGreen.length;

      await gameStatisticsRepository.updateCurrency(currentCurrency.id, {
        greenEnergy: currentCurrency.greenEnergy,
        greyEnergy: currentCurrency.greyEnergy,
        coins: currentCurrency.coins,
        score: currentCurrency.score - decrementAmount,
      });
    }

    const updatedBuildings =
      await gameStatisticsRepository.toggleAllGameBuildingsRunsOnGreenFalse(
        gameStatisticsId
      );

    return updatedBuildings;
  }

  /**
   * Creates the initial game buildings for a given game statistics id.
   * This method initializes the game buildings based on the predefined building types and their levels.
   * @async
   * @function createGameBuildings
   * @memberof module:service/gameStatisticsService.Service_GameBuildings
   * @param {string} gameStatisticsId - The id of the game statistics to create buildings for.
   * @returns {Promise<GameBuildings[]>} A promise that resolves to an array of created GameBuildings instances.

   * */

  async createGameBuildings(gameStatisticsId) {
    return await gameStatisticsRepository.createGameBuildings(gameStatisticsId);
  }

  //########################################################################
  //                              ACHIEVEMENTS
  //########################################################################

  /**
   * @namespace module:service/gameStatisticsService.Service_Achievements
   * @memberof module:service/gameStatisticsService
   * @description
   *   All service methods for managing achievements in game statistics.
   *   This includes adding achievements to game statistics and checking if achievements have been achieved.
   */

  /**
   * Retrieves the achievements associated with a specific game statistics record.
   *
   * @async
   * @function addAchievementToGameStatistics
   * @memberof module:service/gameStatisticsService.Service_Achievements
   * @param {string} gameStatisticsId - The id of the game statistics record.
   * @returns {Promise<Achievement[]>} A promise that resolves to an array of achievements for the given game statistics.
   */
  async getGameStatisticsAchievements(gameStatisticsId) {
    return await gameStatisticsRepository.getGameStatisticsAchievements(
      gameStatisticsId
    );
  }

  /**
   * Tracks and adds newly earned achievements to a GameStatistics object.
   *
   * Iterates over the provided achievement titles, checks if each achievement has been achieved,
   * and if so, adds it to the GameStatistics. Returns a list of achievements that were earned.
   *
   * @async
   * @function _trackEarnedAchievements
   * @memberof module:service/gameStatisticsService.Service_Achievements
   * @param {string} gameStatisticsId - The identifier of the GameStatistics object.
   * @param {string[]} achievementTitles - An array of achievement titles to check and add.
   * @param {Asset} [removedAsset=null] - An optional Asset object used to check if a destroyed asset was a grey energy source.
   * @returns {Promise<Achievement[]>} A promise that resolves to an array of earned achievement objects.
   */
  async _trackEarnedAchievements(
    gameStatisticsId,
    achievementTitles,
    removedAsset = null
  ) {
    const earnedAchievements = [];

    for (const title of achievementTitles) {
      if (
        await this.hasAchievementBeenAchieved(
          gameStatisticsId,
          title,
          removedAsset
        )
      ) {
        // Add the achievement to the GameStatistics object
        const achievement = await this.addAchievementToGameStatistics(
          gameStatisticsId,
          title
        );

        // Add the achievement to the list of earned achievements if it exists
        if (achievement) {
          earnedAchievements.push(achievement);
        }      
      }
    }

    return earnedAchievements;
  }

  /**
   * Checks if a specific achievement has been achieved based on the provided game statistics and achievement title.
   *
   * @async
   * @function hasAchievementBeenAchieved
   * @memberof module:service/gameStatisticsService.Service_Achievements
   * @param {string} gameStatisticsId - The id of the GameStatistics object containing information about a group's game state.
   * @param {string} title - The title of the achievement to check.
   * @returns {Promise<boolean>} - Returns a promise that resolves to true if the achievement has been achieved, otherwise false.
   */
  async hasAchievementBeenAchieved(
    gameStatisticsId,
    title,
    removedAsset = null
  ) {
    const gameStatistics = await this.getById(
      gameStatisticsId,
      true,
      true,
      true,
      false,
      false
    );

    // Cases and logic depend on the existing achievements and their requirements
    switch (title) {
      case "Bouwassistent":
        // Check if any building has been upgraded to level 2
        return gameStatistics.gameBuildings.some(
          (gameBuilding) => gameBuilding.buildingLevel.level >= 2
        );

      case "Bouwmeester":
        // Check if any building has been upgraded to level 5 (maximum)
        return gameStatistics.gameBuildings.some(
          (gameBuilding) => gameBuilding.buildingLevel.level === 5
        );

      case "Bouwkampioen":
        // Check if all buildings have been upgraded to level 5 (maximum)
        return gameStatistics.gameBuildings.every(
          (gameBuilding) => gameBuilding.buildingLevel.level === 5
        );

      case "Energie-ingenieur":
        // Check if at least one renewable energy source has been built
        const renewableTypes = ["Windmolen", "Zonnepaneel", "Waterrad"];
        return gameStatistics.assets.some((asset) =>
          renewableTypes.includes(asset.type)
        );

      case "Energie-architect":
        // Check if at least 10 renewable energy sources have been built
        return (
          gameStatistics.assets.filter((asset) =>
            ["Windmolen", "Zonnepaneel", "Waterrad"].includes(asset.type)
          ).length >= 10
        );

      case "Groene vingers":
        // Check if a nature asset has been built
        return gameStatistics.assets.some((asset) =>
          Nature.allowedTypes.includes(asset.type)
        );

      case "Milieuheld":
        // Check if a gray energy source has been destroyed
        return removedAsset ? removedAsset.type === "Kerncentrale" : false;

      case "Eerste stap":
        // Check if at least one building runs on green energy
        return gameStatistics.gameBuildings.some(
          (gameBuilding) => gameBuilding.runsOnGreen
        );

      case "Efficiëntie-expert":
        // Check if all buildings run on green energy
        return gameStatistics.gameBuildings.every(
          (gameBuilding) => gameBuilding.runsOnGreen
        );

      case "Geen grijs":
        // Check if no gray energy sources have been built
        return !gameStatistics.assets.some(
          (asset) => asset.type === "Kerncentrale"
        );

      case "Frisse adem":
        // Check if the air quality (score) is 50 or higher
        return gameStatistics.currency.score >= 50;

      case "Schone lucht":
        // Check if the air quality (score) is 100 (or higher)
        return gameStatistics.currency.score >= 100;

      case "EU gemiddelde":
        // Check if 25% or more of the total energy used comes from green sources
        let totalGreenEnergyUsed = 0;
        let totalEnergyUsed = 0;

        for (const gameBuilding of gameStatistics.gameBuildings) {
          totalEnergyUsed += gameBuilding.buildingLevel?.energyCost;
          if (gameBuilding.runsOnGreen) {
            totalGreenEnergyUsed += gameBuilding.buildingLevel?.energyCost;
          }
        }

        return totalEnergyUsed > 0 && (totalGreenEnergyUsed / totalEnergyUsed) >= 0.25;

      default:
        console.error(`Unknown achievement title: ${title}`);
        return false;
    }
  }

  /**
   * Adds an achievement to the game statistics for a given gameStatisticsId
   * and adds 1 to the score of the game statistics.
   *
   * @async
   * @function addAchievementToGameStatistics
   * @memberof module:service/gameStatisticsService.Service_Achievements
   * @param {string} gameStatisticsId - The id of the game statistics record.
   * @param {string} title - The title of the achievement to add.
   * @returns {Promise<Achievement>} The added Achievement object.
   */
  async addAchievementToGameStatistics(gameStatisticsId, title) {
    // First, check if the achievement exists by its title
    const achievement = await gameStatisticsRepository.findAchievementByTitle(
      title
    );
    if (!achievement) {
      throw new Error(`Achievement with title "${title}" not found`);
    }

    // Check if the achievement already exists. If it does, do nothing and return
    const currentAchievements =
      await gameStatisticsRepository.getGameStatisticsAchievements(
        gameStatisticsId
      );
    const achievementAlreadyExists = currentAchievements.some(
      (a) => a.id === achievement.id
    );
    if (achievementAlreadyExists) return;

    // Add the achievement to the game statistics
    await gameStatisticsRepository.addAchievementToGameStatistics(
      gameStatisticsId,
      achievement
    );

    // Return the achievement object that was already looked up
    return achievement;
  }

  /**
   * Retrieves a list of all achievements and their completion status for a specific group..
   *
   * @async
   * @function getAchievementsOverviewByGroupId
   * @memberof module:service/gameStatisticsService.Service_Achievements
   * @param {string} groupId - The unique identifier of the group.
   * @returns {Promise<Array<{id: number, title: string, description: string, reward: number, isReached: boolean}>>}
   *   A promise that resolves to an array of achievement objects, each containing its id, title, description, reward, and a boolean indicating if it has been reached by the group.
   * @throws {Error} If game statistics for the specified group are not found.
   */
  async getAchievementsOverviewByGroupId(groupId) {
    const gameStatistics = await gameStatisticsRepository.findByGroupId(
      groupId,
      {
        includeCurrency: false,
        includeGameBuildings: false,
        includeAssets: false,
        includeCheckpoints: false,
        includeGroup: false,
      }
    );

    if (!gameStatistics) {
      throw new Error(`Game statistics for group ${groupId} not found`);
    }

    const [achievements, reachedAchievements] = await Promise.all([
      gameStatisticsRepository.findAllAchievements(),
      gameStatisticsRepository.getGameStatisticsAchievements(gameStatistics.id),
    ]);

    const reachedAchievementIds = new Set(
      reachedAchievements.map((achievement) => achievement.id)
    );

    return achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      reward: achievement.reward,
      isReached: reachedAchievementIds.has(achievement.id),
    }));
  }

  //########################################################################
  //                              RANDOM EVENTS
  //########################################################################

  async updateMultipliersAndMessage(multipliers) {
    await gameStatisticsRepository.updateMultipliersAndMessage(multipliers);
  }

  async updateDamageAndMessage(multipliers) {
    await gameStatisticsRepository.updateDamageAndMessage(multipliers);
  }

  async repairAsset(multiplierId, type) {
    await gameStatisticsRepository.repairAsset(multiplierId, type);
  }
}



module.exports = new GameStatisticsService();
