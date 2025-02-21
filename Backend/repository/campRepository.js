const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Camp = require('../model/camp');

class CampRepository {
    async create({ name, startDate, endDate, address, startTime, endTime, minAge, maxAge, picture, archived}) {
        const prismaCamp = await prisma.camp.create({ data: { name, startDate, endDate, address, startTime, endTime, minAge, maxAge, picture, archived} });
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
