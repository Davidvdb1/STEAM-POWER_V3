const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const EnergyData = require('../model/energyData');
const utility = require('../util/utility');

class EnergyDataRepository {
    async create(data) {
        try {
            const energyData = new EnergyData(data);
            energyData.validate();
            const prismaEnergyData = await prisma.energyData.create({ data: energyData });
            return EnergyData.from(prismaEnergyData);
        } catch (error) {
            if (error.message.includes('Invalid')) {
                throw new utility.ValidationError(error.message);
            }
            throw new utility.DatabaseError(`Error creating energy data: ${error.message}`);
        }
    }

    async getAllByGroup(groupId) {
        try {
            const whereCondition = { groupId };
        
            const prismaEnergyData = await prisma.energyData.findMany({
                where: whereCondition,
                orderBy: { time: 'asc' }
            });
        
            return prismaEnergyData.map(EnergyData.from);
        } catch (error) {
            throw new utility.DatabaseError(`Error fetching energy data: ${error.message}`);
        }
    }
}

module.exports = new EnergyDataRepository();
