const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const group = require('../model/group');

class GroupRepository {
    async create(group) {
        const prismaGroup = await prisma.group.create({ data: { group } });
        return group.from(prismaGroup);
    }

    async findById(id) {
        try {
            const prismaGroup = await prisma.group.findUnique({ where: { id } });
            return group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async findByCode(code) {
        try {
            console.log(code);
            const prismaGroup = await prisma.group.findUnique({ where: { code } });
            console.log(prismaGroup);
            return group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async findByName(name) {
        try {
            const prismaGroup = await prisma.group.findUnique({ where: { name } });
            return group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async getAll() {
        const prismaGroups = await prisma.group.findMany();
        return prismaGroups.map(group.from);
    }
}

module.exports = new GroupRepository();
