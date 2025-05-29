require("@prisma/client");
const gameStatisticsRepository = require("../repository/gameStatisticsRepository");
const GameStatistics = require("../model/gameStatistics");
const Currency = require("../model/currency");
const Building = require("../model/building");
const Asset = require("../model/asset");
const Nature = require('../model/nature');
const Checkpoint = require("../model/checkpoint");
const GameBuildings = require("../model/gameBuildings");


class GameStatisticsService {
  //########################################################################
  //                            GAME STATISTICS
  //########################################################################
  /**
   * Creates a new game statistics object for a specific group with the provided currency data.
   *
   * @async
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
      score: score ?? Currency.STARTING_SCORE
    });
    return await gameStatisticsRepository.create({ groupId, currency });
  }


  // USED FOR MANUAL TESTING
  /**
   * Retrieves all game statistics objects from the repository.
   *
   * @async
   * @returns {Promise<GameStatistics[]>} A promise that resolves to an array of GameStatistics objects.
   */
  async getAllGameStatistics() {
    return await gameStatisticsRepository.getAllGameStatistics();
  }


  /**
   * Retrieves a GameStatistics object by its id with optional related data.
   *
   * @async
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
      includeGroup
    });
  }

  
  /**
   * Retrieves a game statistics record by group id with optional related data.
   *
   * @async
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
      includeGroup
    });
  }




  //########################################################################
  //                                CURRENCY
  //########################################################################
  /**
   * Retrieves a Currency object by its id.
   *
   * @async
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
   * Adds an asset to the game statistics for the given statsId.
   * Determines the asset type (Nature or Asset), creates an instance, and adds it via the repository.
   * After adding, checks if any asset-related achievements have been achieved and adds them to the game statistics if so.
   *
   * @async
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
   * @returns {Promise<Asset>} The added asset instance.
   */
  async addAsset(statsId, aData) {
    const { type } = aData;
    let assetInstance;
    if (Nature.allowedTypes.includes(type)) {
      assetInstance = new Nature(aData);
    } else {
      assetInstance = new Asset(aData);
    }
    const addedAsset = await gameStatisticsRepository.addAsset(statsId, assetInstance);

    // Check if any achievement for building an asset has been achieved
    const assetAchievements = ["Energie-ingenieur", "Energie-architect", "Groene vingers"];
    for (const achievement of assetAchievements) {
      if (await this.hasAchievementBeenAchieved(statsId, achievement)) {
        // If so, add the achievement to the game statistics
        await this.addAchievementToGameStatistics(statsId, achievement);
      }
    }
    return addedAsset;
  }


  /**
   * Removes an asset by its id and checks if the "Milieuheld" achievement has been achieved as a result.
   * If the achievement is achieved, it is added to the game statistics.
   *
   * @async
   * @param {string} assetId - The id of the asset to remove.
   * @returns {Promise<Asset>} The removed asset object.
   */
  async removeAsset(assetId) {
    const removedAsset = await gameStatisticsRepository.removeAsset(assetId);

    // Check if any achievement for destroying an asset has been achieved
    if (await this.hasAchievementBeenAchieved(removedAsset.gameStatisticsId, "Milieuheld", removedAsset)) {
      // If so, add the achievement to the game statistics
      await this.addAchievementToGameStatistics(removedAsset.gameStatisticsId, "Milieuheld");
    }
    return removedAsset;
  }




  //########################################################################
  //                              CHECKPOINTS
  //########################################################################
  /**
   * Creates a checkpoint for a given game statistics id.
   *
   * @async
   * @param {string} statsId - The id of the game statistics to associate with the checkpoint.
   * @param {Object} cpData - The checkpoint data to record.
   * @param {Currency} cpData.currency - The currency instance for the checkpoint.
   * @param {Array<Building>} cpData.buildings - An array of building instances.
   * @param {Array<Asset>} cpData.assets - An array of asset instances.
   * @returns {Promise<Checkpoint>} The created checkpoint instance.
   * @throws {Error} If a building name is missing in the provided data.
   */
  async recordCheckpoint(statsId, cpData) {
    const currency = new Currency(cpData.currency);

    const buildings = await Promise.all(
      cpData.buildings.map(async (b) => {
        if (!b.name) {
          throw new Error("Building name is required");
        }
        return new Building(b);
      })
    );

    const assets = cpData.assets.map((a) => new Asset(a));

    const checkpoint = new Checkpoint({ currency, buildings, assets });
    return await gameStatisticsRepository.recordCheckpoint(statsId, checkpoint);
  }

  
  /**
   * Removes a checkpoint from the game statistics repository by its id.
   *
   * @async
   * @param {string} checkpointId - The id of the checkpoint to remove.
   * @returns {Promise<Checkpoint>} The removed checkpoint object.
   */
  async removeCheckpoint(checkpointId) {
    return await gameStatisticsRepository.removeCheckpoint(checkpointId);
  }




  //########################################################################
  //                             GAME BUILDINGS
  //########################################################################
  /**
   * Retrieves all game buildings associated with a specific group id.
   *
   * @async
   * @param {string} groupId - The id of the group to fetch game buildings for.
   * @returns {Promise<GameBuildings[]>} A promise that resolves to an array of GameBuildings instances.
   */
  async getAllGameBuildingsByGroupId(groupId) {
    return await gameStatisticsRepository.findAllGameBuildingsByGroupId(groupId);
  }


  /**
   * Upgrades the level of a GameBuilding by its id.
   * Retrieves the GameBuilding and updates the GameBuilding's BuildingLevel object.
   * Checks for and awards any relevant achievements after the upgrade.
   *
   * @async
   * @param {string} gameBuildingId - The id of the GameBuilding to upgrade.
   * @param {number} level - The new level to upgrade the building to.
   * @returns {Promise<GameBuildings>} The updated GameBuilding object.
   * @throws {Error} If the GameBuilding or the next BuildingLevel is not found.
   */
  async upgradeGameBuilding(gameBuildingId, { level }) {
    // Get the GameBuilding by its ID
    const gameBuilding = await gameStatisticsRepository.findGameBuildingById(gameBuildingId);
    if (!gameBuilding) {
      throw new Error(`GameBuilding with id ${gameBuildingId} not found`);
    }

    // Get the BuildingLevel for the next level of the selected building
    const NextBuildingLevel = await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(gameBuilding.building.id, level);
    if (!NextBuildingLevel) {
      throw new Error(`BuildingLevel ${level} for building ${gameBuilding.building.id} not found`);
    }

    // Call the upgrade method in the repository to update the GameBuilding's BuildingLevel
    const updatedGameBuilding = await gameStatisticsRepository.upgradeGameBuildingLevel(gameBuildingId, NextBuildingLevel.id);

    // Check if any achievement for upgrading a building has been achieved
    const buildingAchievements = ["Bouwassistent", "Bouwmeester", "Bouwkampioen"];
    for (const achievement of buildingAchievements) {
      if (await this.hasAchievementBeenAchieved(gameBuilding.gameStatisticsId, achievement)) {
        // If so, add the achievement to the game statistics
        await this.addAchievementToGameStatistics(gameBuilding.gameStatisticsId, achievement);
      }
    }
    return updatedGameBuilding;
  }




  //########################################################################
  //                              ACHIEVEMENTS
  //########################################################################
  /**
   * Adds an achievement to the game statistics for a given gameStatisticsId.
   *
   * @async
   * @param {string} gameStatisticsId - The id of the game statistics record.
   * @param {string} title - The title of the achievement to add.
   * @returns {Promise<GameStatistics>} The updated game statistics object.
   */
  async addAchievementToGameStatistics(gameStatisticsId, title) {
    const achievement = await gameStatisticsRepository.findAchievementByTitle(title);
    if (!achievement) {
      throw new Error(`Achievement with title "${title}" not found`);
    }
    
    // Get current achievements and check if this achievement already exists by id
    const currentAchievements = await gameStatisticsRepository.getGameStatisticsAchievements(gameStatisticsId);
    const achievementExists = currentAchievements.some(a => a.id === achievement.id);
    if (achievementExists) {
      // If the achievement already exists, do nothing and return
      return;
    }
    
    return await gameStatisticsRepository.addAchievementToGameStatistics(gameStatisticsId, achievement);
  }


  /**
   * Retrieves the achievements associated with a specific game statistics record.
   *
   * @async
   * @param {string} gameStatisticsId - The id of the game statistics record.
   * @returns {Promise<Achievement[]>} A promise that resolves to an array of achievements for the given game statistics.
   */
  async getGameStatisticsAchievements(gameStatisticsId) {
    return await gameStatisticsRepository.getGameStatisticsAchievements(gameStatisticsId);
  }


  /**
   * Checks if a specific achievement has been achieved based on the provided game statistics and achievement title.
   *
   * @async
   * @param {string} gameStatisticsId - The id of the GameStatistics object containing information about a group's game state.
   * @param {string} title - The title of the achievement to check.
   * @returns {Promise<boolean>} - Returns a promise that resolves to true if the achievement has been achieved, otherwise false.
   */
  async hasAchievementBeenAchieved(gameStatisticsId, title, removedAsset = null) {
    const gameStatistics = await this.getById(gameStatisticsId, true, true, true, false, false);

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
        return gameStatistics.gameBuildings.some(gameBuilding => gameBuilding.buildingLevel.level >= 2);

      case "Bouwmeester":
        // Check if any building has been upgraded to level 5 (maximum)
        return gameStatistics.gameBuildings.some(gameBuilding => gameBuilding.buildingLevel.level === 5);

      case "Bouwkampioen":
        // Check if all buildings have been upgraded to level 5 (maximum)
        return gameStatistics.gameBuildings.every(gameBuilding => gameBuilding.buildingLevel.level === 5);

      case "Energie-ingenieur":
        // Check if at least one renewable energy source has been built
        const renewableTypes = ["Windmolen", "Zonnepaneel", "Waterrad"];
        return gameStatistics.assets.some(asset => renewableTypes.includes(asset.type));

      case "Energie-architect":
        // Check if at least 10 renewable energy sources have been built
        return gameStatistics.assets.filter(asset => ["Windmolen", "Zonnepaneel", "Waterrad"].includes(asset.type)).length >=10;

      case "Groene vingers":
        // Check if a nature asset has been built
        return gameStatistics.assets.some(asset => Nature.allowedTypes.includes(asset.type));

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
}


module.exports = new GameStatisticsService();
