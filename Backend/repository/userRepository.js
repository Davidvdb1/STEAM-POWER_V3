const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const User = require('../model/user');

class UserRepository {
    async create(user) {
        user.validate();
        const prismaUser = await prisma.user.create({ data: user });
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

    async findAll() {
        try {
            const prismaUsers = await prisma.user.findMany();
            return prismaUsers.map(user => User.from(user));
        } catch (error) {
            return [];
        }
    }

    async update(userData) {
        try {
            const updatedPrismaUser = await prisma.user.update({
                where: { id: userData.id },
                data: userData
            });
            return User.from(updatedPrismaUser);
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }
}

module.exports = new UserRepository();
