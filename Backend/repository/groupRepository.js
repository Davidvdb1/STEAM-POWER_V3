const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Group = require('../model/group');

class GroupRepository {
    async create(group) {
        group.validate();
        const prismaGroup = await prisma.group.create({ data: group });
        return Group.from(prismaGroup);
    }

    async update(group) {
        group.validate();
        const prismaGroup = await prisma.group.update({ where: { id: group.id }, data: group });
        return Group.from(prismaGroup);
    }

    async findById(id) {
        try {
            const prismaGroup = await prisma.group.findUnique({ where: { id } });
            return Group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async findByCode(code) {
        try {
            const prismaGroup = await prisma.group.findUnique({ where: { code } });
            return Group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async findByName(name) {
        try {
            const prismaGroup = await prisma.group.findUnique({ where: { name } });
            return Group.from(prismaGroup);
        } catch (error) {
            return null;
        }
    }

    async findAll() {
        const prismaGroups = await prisma.group.findMany();
        return prismaGroups.map(Group.from);
    }

    async deleteById(id) {
        try {
            await prisma.group.delete({ where: { id } });
            return true;
        } catch (error) {
            throw new Error('Kon groep niet verwijderen');
        }
    }
}

module.exports = new GroupRepository();
