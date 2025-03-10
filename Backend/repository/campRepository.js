const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Camp = require('../model/camp');

class CampRepository {
    async create(camp, includeWorkshops = false) {
        camp.validate();
        const prismaCamp = await prisma.camp.create({
            data: {
                ...camp,
                workshops: {
                    connect: camp.workshops
                }
            },
            include: { workshops: includeWorkshops ? true : { select: { id: true } } }
        });
        return Camp.from(prismaCamp);
    }

    async findById(id, includeWorkshops = false) {
        const prismaCamp = await prisma.camp.findUnique({
            where: { id },
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
    
}

module.exports = new CampRepository();
