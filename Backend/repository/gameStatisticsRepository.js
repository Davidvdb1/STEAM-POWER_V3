const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const GameStatistics = require('../model/gameStatistics');

class GameStatisticsRepository {
    async create(gameStatistics, includeCurrency = false, includeBuildings = false, includeCheckpoints = false, includeAssets = false, includeGroupId = false) {
        currency.validate();
        const prismaGameStatistics = await prisma.gameStatistics.create({
            data: {
                ...gameStatistics,
                currency: {
                    connect: gameStatistics.currency
                },
                buildings: {
                    connect: gameStatistics.buildings
                },
                checkpoints: {
                    connect: gameStatistics.checkpoints
                },
                assets: {
                    connect: gameStatistics.assets
                },
                groupId: {
                    connect: gameStatistics.groupId
                }
            },
            include: { currency: includeCurrency ? true : { select: { id: true }},  buildings: includeBuildings ? true : { select: { id: true }}, checkpoints: includeCheckpoints ? true : { select: { id: true }}, assets: includeAssets ? true : { select: { id: true }}, groupId: includeGroupId ? true : { select: { id: true }}}
        });
        return GameStatistics.from(prismaGameStatistics);
    }

    async findById(id, includeWorkshops = false) {
        const prismaCamp = await prisma.camp.findUnique({
            where: { id },
            include: { 
                workshops: includeWorkshops 
                    ? { orderBy: { position: 'asc' } } 
                    : { select: { id: true } }
            }
        });
        return prismaCamp ? Camp.from(prismaCamp) : null;
    }
    

    async findByTitle(title, includeWorkshops = false) {
        const prismaCamp = await prisma.camp.findUnique({
            where: { title },
            include: { workshops: includeWorkshops ? true : { select: { id: true } } }
        });
        return prismaCamp ? Camp.from(prismaCamp) : null;
    }

    async findAll(includeWorkshops = false) {
        const prismaCamps = await prisma.camp.findMany({ 
            include: { workshops: includeWorkshops ? true : { select: { id: true } } }
        });
        return prismaCamps.map(Camp.from);
    }

    async update(id, updatedCamp) {
        const existingCamp = await this.findById(id);
        if (!existingCamp) {
            throw new Error("Kamp niet gevonden");
        }

        updatedCamp.validate?.();

        const prismaCamp = await prisma.camp.update({
            where: { id },
            data: {
                ...updatedCamp,
                workshops: updatedCamp.workshops ? {
                    set: updatedCamp.workshops.map(w => ({ id: w.id }))
                } : undefined
            },
            include: { workshops: { select: { id: true } } }
        });

        return Camp.from(prismaCamp);
    }

    async delete(id) {
        const existingCamp = await this.findById(id);
        if (!existingCamp) {
            return null;
        }
        
        await prisma.camp.delete({
            where: { id }
        });

        return true;
    }

    async addWorkshop(campId, workshopId) {
        const existingCamp = await this.findById(campId, true);
        if (!existingCamp) {
            throw new Error("Kamp niet gevonden");
        }

        const existingWorkshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
        if (!existingWorkshop) {
            throw new Error("Workshop niet gevonden");
        }

        await prisma.camp.update({
            where: { id: campId },
            data: {
                workshops: {
                    connect: { id: workshopId }
                }
            }
        });

        return true;
    }
}

module.exports = new GameStatisticsRepository();
