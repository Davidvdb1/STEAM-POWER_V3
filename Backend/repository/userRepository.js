const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const User = require('../model/user');

class UserRepository {
    async create(userData) {
        const prismaUser = await prisma.user.create({ data: userData });
        return User.from(prismaUser);
    }

    async findByEmail(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        return User.from(user);
    }

    async findById(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        return User.from(user);
    }

    async findByUsername(username) {
        const user = await prisma.user.findUnique({ where: { username } });
        return User.from(user);
    }
}

module.exports = new UserRepository();
