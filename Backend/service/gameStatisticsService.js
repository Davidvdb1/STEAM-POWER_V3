const gameStatisticsRepository = require("../repository/gameStatisticsRepository");
const GameStatistics = require("../model/gameStatistics");
const Currency = require("../model/currency");
const Building = require("../model/building");
const Asset = require("../model/asset");
const Nature = require('../model/nature');
const Checkpoint = require("../model/checkpoint");
const Level = require("../model/level");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class GameStatisticsService {
  async create({ groupId, greenEnergy, greyEnergy, coins }) {
    const currency = new Currency({
      greenEnergy: greenEnergy ?? undefined,
      greyEnergy: greyEnergy ?? undefined,
      coins: coins ?? undefined,
    });
    const gs = await gameStatisticsRepository.create({ groupId, currency });
    return gs;
  }

  async refactorGameStatistics({checkpointId}) {
    const checkpoint = await gameStatisticsRepository.findCheckpointById(checkpointId);

    const gs = await gameStatisticsRepository.refactorGameStatistics({checkpoint})
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
    return await gameStatisticsRepository.addAsset(statsId, assetInstance);
  }

  async removeAsset(assetId) {
    return await gameStatisticsRepository.removeAsset(assetId);
  }

  async recordCheckpoint(statsId) {
    const gameStatistics = await gameStatisticsRepository.findById(statsId);
    const currency = gameStatistics.currency;
    const gameBuildings = await gameStatisticsRepository.findAllGameBuildingsByGameStatisticsId(statsId);
    const assets = await gameStatisticsRepository.findAllAssetsByGameStatisticsId(statsId);

    return await gameStatisticsRepository.recordCheckpoint(statsId, currency, gameBuildings, assets);
  }

  async removeCheckpoint(checkpointId) {
    return await gameStatisticsRepository.removeCheckpoint(checkpointId);
  }

  async delete(id) {
    return await gameStatisticsRepository.delete(id);
  }

  async upgradeBuilding(GameBuildingId, { level }) {
    console.log('→ [upgradeBuilding] GameBuildingId=', GameBuildingId, 'new level=', level);
    const gameBuilding = await gameStatisticsRepository.findGameBuildingById(GameBuildingId);
    console.log('→ [upgradeBuilding] current GameBuilding:', gameBuilding);
    if (!gameBuilding) {
      throw new Error(`GameBuilding with id ${GameBuildingId} not found`);
    }

    const NextBuildingLevel = await gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel(gameBuilding.building.id, level);
    if (!NextBuildingLevel) {
      throw new Error(`BuildingLevel ${level} for building ${gameBuilding.building.id} not found`);
    }

    const updatedGameBuilding = await gameStatisticsRepository.upgradeBuildingLevel(GameBuildingId, NextBuildingLevel.id);
    console.log('→ [upgradeBuilding] updated GameBuilding:', updatedGameBuilding);
    return updatedGameBuilding;
  }
}

module.exports = new GameStatisticsService();
