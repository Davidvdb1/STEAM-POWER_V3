const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class KampRepository {
    async create(kampData) {
        return await prisma.kamp.create({ data: kampData });
    }

    async findById(id) {
        return await prisma.kamp.findUnique({ where: { id } });
    }

    async findAll() {
        return await prisma.kamp.findMany();
    }
}

module.exports = new KampRepository();
