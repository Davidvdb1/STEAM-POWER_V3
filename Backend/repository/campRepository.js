const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CampRepository {
    async create(campData) {
        return await prisma.camp.create({ data: campData });
    }

    async findById(id) {
        return await prisma.camp.findUnique({ where: { id } });
    }

    async findAll() {
        return await prisma.camp.findMany();
    }
}

module.exports = new CampRepository();
