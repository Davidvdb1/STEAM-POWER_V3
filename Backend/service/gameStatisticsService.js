const gameStatisticsRepository = require("../repository/gameStatisticsRepository");
const GameStatistics = require("../model/gameStatistics");
const Currency = require("../model/currency");
const Building = require("../model/building");
const Asset = require("../model/asset");
const Nature = require('../model/nature');
const Checkpoint = require("../model/checkpoint");
const GameBuildings = require("../model/gameBuildings");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class GameStatisticsService {
  async create({ groupId, greenEnergy, greyEnergy, coins, score }) {
    const currency = new Currency({
      greenEnergy: greenEnergy ?? undefined,
      greyEnergy: greyEnergy ?? undefined,
      coins: coins ?? undefined,
      score: score ?? undefined,
    });
    const gs = await gameStatisticsRepository.create({ groupId, currency });
    return gs;
  }

  // Om de backend manueel te testen
  async getAllGameStatistics() {
    const gameStatistics =
      await gameStatisticsRepository.getAllGameStatistics();
    return gameStatistics.map((gs) => GameStatistics.from(gs));
  }

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


  // Currency methods
  async getCurrencyById(currencyId) {
    return await gameStatisticsRepository.findCurrencyById(currencyId);
  }

  async updateCurrency(currencyId, payload) {
    return gameStatisticsRepository.updateCurrency(currencyId, payload);
  }

  async incrementCurrency(currencyId, payload) {
    return gameStatisticsRepository.incrementCurrency(currencyId, payload);
  }

  async getAllGameBuildingsByGroupId(groupId) {
    return await gameStatisticsRepository.findAllGameBuildingsByGroupId(groupId);
  }

  // Asset methods
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

  async removeAsset(assetId) {
    const removedAsset = await gameStatisticsRepository.removeAsset(assetId);

    // Check if any achievement for destroying an asset has been achieved
    if (await this.hasAchievementBeenAchieved(removedAsset.gameStatisticsId, "Milieuheld", removedAsset)) {
      // If so, add the achievement to the game statistics
      await this.addAchievementToGameStatistics(removedAsset.gameStatisticsId, "Milieuheld");
    }
    return removedAsset;
  }

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

  async removeCheckpoint(checkpointId) {
    return await gameStatisticsRepository.removeCheckpoint(checkpointId);
  }

  async delete(id) {
    return await gameStatisticsRepository.delete(id);
  }


  // BUILDINGS
  /**
   * Upgrades the level of a GameBuilding by its ID.
   * 
   * Retrieves the GameBuilding and updates the GameBuilding's BuildingLevel object.
   * Checks for and awards any relevant achievements after the upgrade.
   *
   * @async
   * @param {string} gameBuildingId - The unique identifier of the GameBuilding to upgrade.
   * @param {number} level - The new level to upgrade the building to.
   * @returns {Promise<GameBuildings>} The updated GameBuilding object.
   * @throws {Error} If the GameBuilding or the next BuildingLevel is not found.
   */
  async upgradeBuilding(gameBuildingId, { level }) {
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
    const updatedGameBuilding = await gameStatisticsRepository.upgradeBuildingLevel(gameBuildingId, NextBuildingLevel.id);

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


  // ACHIEVEMENTS
  /**
   * Adds an achievement to the game statistics for a given gameStatisticsId.
   *
   * @async
   * @param {string} gameStatisticsId - The unique identifier of the game statistics record.
   * @param {string} title - The title of the achievement to add.
   * @returns {Promise<GameStatistics>} The updated game statistics object.
   */
  async addAchievementToGameStatistics(gameStatisticsId, title) {
    const updatedGameStatistics = await gameStatisticsRepository.addAchievementToGameStatistics(gameStatisticsId, title);
    return updatedGameStatistics;
  }
  

  /**
   * Retrieves the achievements associated with a specific game statistics record.
   *
   * @async
   * @param {string|number} gameStatisticsId - The unique identifier of the game statistics record.
   * @returns {Promise<Array>} A promise that resolves to an array of achievements for the given game statistics.
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
