const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserRepository {
    async create(userData) {
        return await prisma.user.create({ data: userData });
    }

    async findByEmail(email) {
        return await prisma.user.findUnique({ where: { email } });
    }

    async findById(id) {
        return await prisma.user.findUnique({ where: { id } });
    }

    async findByUsername(username) {
        return await prisma.user.findUnique({ where: { username } });
    }
}

module.exports = new UserRepository();
