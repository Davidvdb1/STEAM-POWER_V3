const energyDataRepository = require('../repository/energyDataRepository');
const EnergyData = require('../model/energyData');
const utility = require('../util/utility');
const groupRepository = require('../repository/groupRepository');
const gameStatisticsRepository = require('../repository/gameStatisticsRepository');

class EnergyDataService {
    async create(data) {
        try {
            data.time = new Date(data.time);
            const energyData = new EnergyData(data);
            const Energy = data.value /1024 * 3 * 0.5 * 2 /3600; // /1024 * 3 voorde voltagewaarde, * 0.5 Ampère voor het vermogen, * 2/3600  voor de energie te verkrijgen in Wh.
            const gameStats = await gameStatisticsRepository.findByGroupId(data.groupId);
            const currency = gameStats.currency;
            const group = await groupRepository.findById(data.groupId);
            const multiplier = group.energyMultiplier;
            const greenEnergy = Energy * multiplier / 1000; // 1000 omdat de currency in kWh is
            await groupRepository.addEnergyToGroup(data.groupId, Energy);
            await gameStatisticsRepository.incrementCurrency(currency.id, { greenEnergy }); 
            await gameStatisticsRepository.incrementGreenEnergyWithMultiplier(data.groupId, greenEnergy, data.type); // om factor van groene energiebronnen erin te brengen
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
