const gameStatisticsRepository = require("../repository/gameStatisticsRepository");
const GameStatistics = require("../model/gameStatistics");
const Currency = require("../model/currency");
const Building = require("../model/building");
const Asset = require("../model/asset");
const Checkpoint = require("../model/checkpoint");
const Level = require("../model/level");

const { PrismaClient } = require('@prisma/client');
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


  // Building methods
  async getBuildingById(buildingId) {
    return await gameStatisticsRepository.findBuildingById(buildingId);
  }

  async getAllBuildings() {
    return await gameStatisticsRepository.getAllBuildings();
  }


  // GameBuildings methods (buildings specific to a game)
  async addBuildingToGame(gameStatisticsId, buildingId, buildingLevelId) {
    return await gameStatisticsRepository.addBuildingToGame(
      gameStatisticsId, buildingId, buildingLevelId
    );
  }

  async getGameBuildingById(gameBuildingId) {
    return await gameStatisticsRepository.findGameBuildingById(gameBuildingId);
  }

  async getAllGameBuildingsByGroupId(groupId) {
    return await gameStatisticsRepository.findAllGameBuildingsByGroupId(groupId);
  }

  async updateGameBuilding(gameBuildingId, updates) {
    return await gameStatisticsRepository.updateGameBuilding(gameBuildingId, updates);
  }

  async upgradeBuildingLevel(gameBuildingId, buildingLevelId) {
    return await gameStatisticsRepository.updateGameBuilding(
      gameBuildingId, { buildingLevelId }
    );
  }

  async removeGameBuilding(gameBuildingId) {
    return await gameStatisticsRepository.removeGameBuilding(gameBuildingId);
  }


  // Asset methods
  async addAsset(statsId, aData) {
    const asset = new Asset(aData);
    return await gameStatisticsRepository.addAsset(statsId, asset);
  }

  async removeAsset(assetId) {
    return await gameStatisticsRepository.removeAsset(assetId);
  }

  async recordCheckpoint(statsId, cpData) {
    const currency = new Currency(cpData.currency);

    const buildings = await Promise.all(
      cpData.buildings.map(async (b) => {
        if (b.level && !(b.level instanceof Level)) {
          // Haal volledige Level data op als nodig
          if (!b.level.level || !b.level.upgradeCost || !b.level.energyCost) {
            const fullLevelData = await prisma.level.findUnique({
              where: { id: b.level.id },
            });
            if (!fullLevelData) {
              throw new Error(`Level with id ${b.level.id} not found`);
            }
            b.level = new Level(fullLevelData);
          } else {
            b.level = new Level(b.level);
          }
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
