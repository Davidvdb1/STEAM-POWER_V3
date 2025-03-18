const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const EnergyData = require('../model/energyData');

class EnergyDataRepository {
    async create(data) {
        const energyData = new EnergyData(data);
        energyData.validate();
        const prismaEnergyData = await prisma.energyData.create({ data: energyData });
        return EnergyData.from(prismaEnergyData);
    }

    async getAllByGroup(groupId) {
        const prismaEnergyData = await prisma.energyData.findMany({
            where: { groupId },
            orderBy: { time: 'asc' }
        });
        return prismaEnergyData.map(EnergyData.from);
    }
}

module.exports = new EnergyDataRepository();
