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
    return await gameStatisticsRepository.create({ groupId, currency });
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
   * @returns {Promise<GameStatistics|null>} The found GameStatistics instance or null if not found.
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
   * @returns {Promise<Currency>} The updated Currency instance.
   */
  async updateCurrency(currencyId, payload) {
    return gameStatisticsRepository.updateCurrency(currencyId, payload);
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

    // Check if any achievement for placing an asset has been achieved. If so add them to the GameStatistics object
    const assetAchievements = [
      "Energie-ingenieur",
      "Energie-architect",
      "Groene vingers",
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
    // Remove the asset from the GameStatistics object
    const removedAsset = await gameStatisticsRepository.removeAsset(assetId);

    // Check if any achievement for destroying an asset has been achieved. If so add them to the GameStatistics object
    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      removedAsset.gameStatisticsId,
      ["Milieuheld"],
      removedAsset
    );

    // Return both the removed Asset and any newly earned Achievements
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
   * @param {Object} cpData - The checkpoint data to record.
   * @param {Currency} cpData.currency - The currency instance for the checkpoint.
   * @param {Array<Building>} cpData.buildings - An array of building instances.
   * @param {Array<Asset>} cpData.assets - An array of asset instances.
   * @returns {Promise<Checkpoint>} The created checkpoint instance.
   * @throws {Error} If a building name is missing in the provided data.
   */
  async recordCheckpoint(statsId) {
    const gameStatistics = await gameStatisticsRepository.findById(statsId);
    const currency = gameStatistics.currency;
    const gameBuildings =
      await gameStatisticsRepository.findAllGameBuildingsByGameStatisticsId(
        statsId
      );
    const assets =
      await gameStatisticsRepository.findAllAssetsByGameStatisticsId(statsId);

    return await gameStatisticsRepository.recordCheckpoint(
      statsId,
      currency,
      gameBuildings,
      assets
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
   * @param {Object} params - The parameters object.
   * @param {string} params.checkpointId - The ID of the checkpoint to refactor statistics for.
   * @returns {Promise<any>} The result of the refactored game statistics operation.
   */
  async refactorGameStatistics({ checkpointId }) {
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
    // Get the GameBuilding by its ID
    const gameBuilding = await gameStatisticsRepository.findGameBuildingById(
      gameBuildingId
    );
    if (!gameBuilding) {
      throw new Error(`GameBuilding with id ${gameBuildingId} not found`);
    }

    // Get the BuildingLevel for the next level of the selected building
    const currentBuildingLevel =
      await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(
        gameBuilding.building.id,
        nextLevel - 1
      );
    if (!currentBuildingLevel) {
      throw new Error(
        `BuildingLevel ${nextLevel - 1} for building ${
          gameBuilding.building.id
        } not found`
      );
    }

    // Get the BuildingLevel for the next level of the selected building
    const NextBuildingLevel =
      await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(
        gameBuilding.building.id,
        nextLevel
      );
    if (!NextBuildingLevel) {
      throw new Error(
        `BuildingLevel ${nextLevel} for building ${gameBuilding.building.id} not found`
      );
    }

    // Call the upgrade method in the repository to update the GameBuilding's BuildingLevel
    const updatedGameBuilding =
      await gameStatisticsRepository.upgradeGameBuildingLevel(
        gameBuildingId,
        NextBuildingLevel.id
      );

    // Update the currency after upgrading the building
    // All currencies remain the same except for coins, which are reduced by the upgrade cost of the current building level
    const gameStatistics = await gameStatisticsRepository.findById(
      gameBuilding.gameStatisticsId,
      {
        includeCurrency: true,
        includeGameBuildings: false,
        includeAssets: false,
      }
    );
    await gameStatisticsRepository.updateCurrency(gameStatistics.currency.id, {
      greenEnergy: gameStatistics.currency.greenEnergy,
      greyEnergy: gameStatistics.currency.greyEnergy,
      coins: gameStatistics.currency.coins - currentBuildingLevel.upgradeCost,
      score: gameStatistics.currency.score,
    });

    // Check if any achievement for upgrading a building has been achieved. If so add them to the GameStatistics object
    const buildingAchievements = [
      "Bouwassistent",
      "Bouwmeester",
      "Bouwkampioen",
    ];
    const newlyEarnedAchievements = await this._trackEarnedAchievements(
      gameStatistics.id,
      buildingAchievements
    );

    // Return both the updated GameBuilding and any newly earned Achievements
    return {
      gameBuilding: updatedGameBuilding,
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
   * @returns {Promise<GameBuildings>} The updated GameBuilding object with the toggled 'runsOnGreen' status.
   */
  async toggleGameBuildingRunsOnGreen(gameBuildingId) {
    return await gameStatisticsRepository.toggleGameBuildingRunsOnGreen(
      gameBuildingId
    );

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
        earnedAchievements.push(achievement);
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
      case "Eerste stap":
      // Check if at least one building uses green energy
      // To be implemented

      case "Efficiëntie-expert":
      // Check if all buildings use green energy
      // To be implemented

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

      // case "EU gemiddelde":
      //   // Check if more than 25% of total energy comes from green sources
      //   const totalEnergy = gameStatistics.currency.greenEnergy + gameStatistics.currency.greyEnergy;
      //   if (totalEnergy === 0) return false;
      //   const greenPercentage = (gameStatistics.currency.greenEnergy / totalEnergy) * 100;
      //   return greenPercentage > 25;

      default:
        console.log(`Unknown achievement title: ${title}`);
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

    // Get and update the currency after adding the achievement
    const gameStatistics = await gameStatisticsRepository.findById(
      gameStatisticsId,
      {
        includeCurrency: true,
        includeGameBuildings: false,
        includeAssets: false,
      }
    );

    await gameStatisticsRepository.updateCurrency(gameStatistics.currency.id, {
      greenEnergy: gameStatistics.currency.greenEnergy,
      greyEnergy: gameStatistics.currency.greyEnergy,
      coins: gameStatistics.currency.coins,
      score: gameStatistics.currency.score + 1,
    });

    // Return the achievement object that was already looked up
    return achievement;
  }
}

module.exports = new GameStatisticsService();
