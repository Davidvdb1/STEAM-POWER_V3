const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');

class EnergyDataService {
    async create(data) {
        const energyData = new EnergyData(data);
        return await energyDataRepository.create(energyData);
    }

    async getAllByGroup(groupId) {
        return await energyDataRepository.getAllByGroup(groupId);
    }
}

module.exports = new EnergyDataService();
