const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const User = require('../model/user');
const utility = require('../util/utility');

class UserRepository {
    async create(user) {
        try {
            user.validate();
            const prismaUser = await prisma.user.create({ data: user });
            return User.from(prismaUser);
        } catch (error) {
            if (error.code === 'P2002') { // Prisma unique constraint error
                throw new utility.ValidationError('Gebruiker met deze email of gebruikersnaam bestaat al');
            }
            throw new utility.DatabaseError(`Database error: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { email } });
            return prismaUser ? User.from(prismaUser) : null;
        } catch (error) {
            throw new utility.DatabaseError(`Error finding user by email: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { id } });
            return prismaUser ? User.from(prismaUser) : null;
        } catch (error) {
            throw new utility.DatabaseError(`Error finding user by ID: ${error.message}`);
        }
    }

    async findByUsername(username) {
        try {
            const prismaUser = await prisma.user.findUnique({ where: { username } });
            return prismaUser ? User.from(prismaUser) : null;
        } catch (error) {
            throw new utility.DatabaseError(`Error finding user by username: ${error.message}`);
        }
    }

    async findAll() {
        try {
            const prismaUsers = await prisma.user.findMany();
            return prismaUsers.map(user => User.from(user));
        } catch (error) {
            throw new utility.DatabaseError(`Error finding all users: ${error.message}`);
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
            if (error.code === 'P2025') {
                throw new utility.NotFoundError('Gebruiker niet gevonden');
            }
            if (error.code === 'P2002') {
                throw new utility.ValidationError('Email of gebruikersnaam is al in gebruik');
            }
            throw new utility.DatabaseError(`Error updating user: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new utility.NotFoundError('Gebruiker niet gevonden');
            }
            throw new utility.DatabaseError(`Error deleting user: ${error.message}`);
        }
    }
}

module.exports = new UserRepository();
