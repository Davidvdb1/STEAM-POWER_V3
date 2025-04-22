const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');
const utility = require('../util/utility');

class EnergyDataService {
    async create(data) {
        try {
            data.time = new Date(data.time);

            console.log("EnergyDataService.create", data);

            const energyData = new EnergyData(data);
            return await energyDataRepository.create(energyData);
        } catch (error) {
            if (error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error creating energy data: ${error.message}`);
        }
    }

    async getAllByGroup(groupId) {
        try {
            if (!groupId) {
                throw new utility.ValidationError("Group ID is required");
            }
            return await energyDataRepository.getAllByGroup(groupId);
        } catch (error) {
            if (error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error fetching energy data: ${error.message}`);
        }
    }
}

module.exports = new EnergyDataService();
