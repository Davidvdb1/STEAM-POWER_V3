const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const User = require('../model/user');

class UserRepository {
    async create({username, email, password, role}) {
        const prismaUser = await prisma.user.create({ data: {username, email, password, role} });
        return User.from(prismaUser);
    }

    async findByEmail(email) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { email } });
            return User.from(prismaUser);
        } catch (error) {
            return null;
        }
    }

    async findById(id) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { id } });
            return User.from(prismaUser);
        } catch (error) {
            return null;
        }
    }

    async findByUsername(username) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { username } });
            return User.from(prismaUser);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new UserRepository();
