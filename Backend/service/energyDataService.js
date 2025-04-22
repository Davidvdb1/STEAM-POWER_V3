const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');
const utility = require('../util/utility');
const groupRepository = require('../repository/groupRepository');

class EnergyDataService {
    async create(data) {
        try {
            data.time = new Date(data.time);
            const energyData = new EnergyData(data);
            const Energy = data.value /1024 * 3 * 0.5 * 2;
            await energyDataRepository.create(energyData);
            await groupRepository.addEnergyToGroup(data.groupId, Energy);
            return;
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
