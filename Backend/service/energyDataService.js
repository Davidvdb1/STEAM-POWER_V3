const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');

class EnergyDataService {
    async create(data) {
        data.time = new Date(data.time);
        const energyData = new EnergyData(data);
        return await energyDataRepository.create(energyData);
    }
    

    async getAllByGroup(groupId, range='halfMinute') {
        return await energyDataRepository.getAllByGroup(groupId, range);
    }
}

module.exports = new EnergyDataService();
