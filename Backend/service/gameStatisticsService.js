const gameStatisticsRepository = require('../repository/gameStatisticsRepository');
const GameStatistics           = require('../model/gameStatistics');
const Currency                 = require('../model/currency');
const Building                 = require('../model/building');
const Asset                    = require('../model/asset');
const Checkpoint               = require('../model/checkpoint');

class GameStatisticsService {
  async create({ groupId, greenEnergy, greyEnergy, coins }) {
    const currency = new Currency({
      greenEnergy: greenEnergy ?? undefined,
      greyEnergy:  greyEnergy  ?? undefined,
      coins:       coins       ?? undefined,
    });
    const gs = await gameStatisticsRepository.create({ groupId, currency });
    return gs;
  }

  async getById(id, includeCurrency = true, includeBuildings = true, includeAssets = true, includeCheckpoints = true, includeGroup = false) {
    return await gameStatisticsRepository.findById(id, {
      includeCurrency,
      includeBuildings,
      includeAssets,
      includeCheckpoints,
      includeGroup,
    });
  }

  async getByGroupId(groupId, includeCurrency = true, includeBuildings = true, includeAssets = true, includeCheckpoints = true, includeGroup = false) {
    return await gameStatisticsRepository.findByGroupId(groupId, {
      includeCurrency,
      includeBuildings,
      includeAssets,
      includeCheckpoints,
      includeGroup,
    });
  }

  async getCurrencyById(currencyId) {
    return await gameStatisticsRepository.findCurrencyById(currencyId);
  }

  async updateCurrency(currencyId, payload) {
    return gameStatisticsRepository.updateCurrency(currencyId, payload);
  }

  async addBuilding(statsId, bData) {
    const building = new Building(bData);
    return await gameStatisticsRepository.addBuilding(statsId, building);
  }

  async updateBuilding(buildingId, updates) {
    return await gameStatisticsRepository.updateBuilding(buildingId, updates);
  }

  async removeBuilding(buildingId) {
    return await gameStatisticsRepository.removeBuilding(buildingId);
  }

  async addAsset(statsId, aData) {
    const asset = new Asset(aData);
    return await gameStatisticsRepository.addAsset(statsId, asset);
  }

  async removeAsset(assetId) {
    return await gameStatisticsRepository.removeAsset(assetId);
  }

  async recordCheckpoint(statsId, cpData) {
    const currency   = new Currency(cpData.currency);
    const buildings  = cpData.buildings.map(b => new Building(b));
    const assets     = cpData.assets.map(a => new Asset(a));
    const checkpoint = new Checkpoint({ currency, buildings, assets });
    return await gameStatisticsRepository.recordCheckpoint(statsId, checkpoint);
  }

  async removeCheckpoint(checkpointId) {
    return await gameStatisticsRepository.removeCheckpoint(checkpointId);
  }

  async delete(id) {
    return await gameStatisticsRepository.delete(id);
  }

  async upgradeBuilding(buildingId, { level }) {
    console.log('→ [upgradeBuilding] buildingId=', buildingId, 'new level=', level);
    const building = await gameStatisticsRepository.findBuildingById(buildingId);
    console.log('→ [upgradeBuilding] current building:', building);

    if (!building) {
      throw new Error('Building not found');
    }

    const updatedBuilding = await gameStatisticsRepository.upgradeBuilding(buildingId, { level });
    console.log('→ [upgradeBuilding] updated building:', updatedBuilding);
    return updatedBuilding;
  }

}


module.exports = new GameStatisticsService();
