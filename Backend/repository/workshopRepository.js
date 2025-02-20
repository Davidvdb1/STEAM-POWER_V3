const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WorkshopRepository {
    async create(workshopData) {
        return await prisma.workshop.create({ data: workshopData });
    }

    async findById(id) {
        return await prisma.workshop.findUnique({ where: { id } });
    }
}

module.exports = new WorkshopRepository();
