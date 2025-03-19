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

    async getAllByGroup(groupId, range = 'halfMinute') {
        const whereCondition = { groupId };
    
        // Huidige datum en tijd in UTC
        const now = new Date();
    
        // Bereken starttijd op basis van de opgegeven range
        let startTime;
        switch (range) {
            case 'halfMinute':
                startTime = new Date(now.getTime() - 30 * 1000); // Laatste 30 seconden
                break;
            case 'tenMinutes':
                startTime = new Date(now.getTime() - 10 * 60 * 1000); // Laatste 10 minuten
                break;
            case 'oneHour':
                startTime = new Date(now.getTime() - 60 * 60 * 1000); // Laatste 1 uur
                break;
            case 'sixHour':
                startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // Laatste 6 uur
                break;
            case 'oneDay':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Laatste 24 uur
                break;
            default:
                throw new Error(`Ongeldige tijdsrange: ${range}`);
        }
    
        whereCondition.time = {
            gte: startTime.toISOString() 
        };
    
        const prismaEnergyData = await prisma.energyData.findMany({
            where: whereCondition,
            orderBy: { time: 'asc' }
        });
    
        return prismaEnergyData.map(EnergyData.from);
    }
    
    
}

module.exports = new EnergyDataRepository();
