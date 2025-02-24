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

    async update(camp, includeWorkshops = false) {
        camp.validate();
        const prismaCamp = await prisma.camp.update({
            where: { id: camp.id },
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
        return Camp.from(prismaCamp);
    }

    async findAll(includeWorkshops = false) {
        const prismaCamps = await prisma.camp.findMany({ 
            include: { workshops: includeWorkshops ? true : { select: { id: true } } }
        });
        return prismaCamps.map(Camp.from);
    }
}

module.exports = new CampRepository();
