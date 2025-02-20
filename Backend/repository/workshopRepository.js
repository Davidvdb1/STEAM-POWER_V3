const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WorkshopRepository {
    async create(workshopData) {
        return await prisma.workshop.create({ data: workshopData });
    }

    async findById(id) {
        return await prisma.workshop.findUnique({ where: { id } });
    }

    async findAll() {
        return await prisma.workshop.findMany();
    }
}

module.exports = new WorkshopRepository();
