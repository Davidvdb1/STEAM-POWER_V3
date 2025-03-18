const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');

class EnergyDataService {
    async create(data) {
        console.log("Incoming data before processing:", data); // Debugging
    
        data.time = new Date(data.time); // Zorg ervoor dat het een DateTime is
        console.log("Processed data:", data);
    
        const energyData = new EnergyData(data);
        return await energyDataRepository.create(energyData);
    }
    

    async getAllByGroup(groupId) {
        return await energyDataRepository.getAllByGroup(groupId);
    }
}

module.exports = new EnergyDataService();
