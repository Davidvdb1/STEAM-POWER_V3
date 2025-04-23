const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');
const utility = require('../util/utility');
const groupRepository = require('../repository/groupRepository');

class EnergyDataService {
    async create(data) {
        try {
            data.time = new Date(data.time);

            console.log("EnergyDataService.create", data);

            const energyData = new EnergyData(data);
            const Energy = data.value /1024 * 3 * 0.5 * 2 /3600; // /1024 * 3 voorde voltagewaarde, * 0.5 Ampère voor het vermogen, * 2/3600  voor de energie te verkrijgen in Wh.
            await groupRepository.addEnergyToGroup(data.groupId, Energy);
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
