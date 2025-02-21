const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Camp = require('../model/camp');

class CampRepository {
    async create(camp) {
        const prismaCamp = await prisma.camp.create({ data: {
            name: camp.name,
            startDate: camp.startDate,
            endDate: camp.endDate,
            address: camp.address,
            startTime: camp.startTime,
            endTime: camp.endTime,
            minAge: camp.minAge,
            maxAge: camp.maxAge,
            picture: camp.picture,
            archived: camp.archived
        } });
        return Camp.from(prismaCamp);
    }

    async findById(id) {
        const prismaCamp = await prisma.camp.findUnique({ where: { id } });
        return Camp.from(prismaCamp);
    }

    async findAll() {
        const prismaCamps = await prisma.camp.findMany();
        return prismaCamps.map(Camp.from);
    }
}

module.exports = new CampRepository();
