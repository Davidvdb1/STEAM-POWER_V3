const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Workshop = require('../model/workshop');

class WorkshopRepository {
    async create(workshop) {
        workshop.validate();
        const prismaWorkshop = await prisma.workshop.create({ data: workshop });
        return Workshop.from(prismaWorkshop);
    }

    async update(workshop) {
        workshop.validate();
        const prismaWorkshop = await prisma.workshop.update({ where: { id: workshop.id }, data: workshop });
        return Workshop.from(prismaWorkshop);
    }

    async findById(id) {
        const prismaWorkshop = await prisma.workshop.findUnique({ where: { id } });
        return Workshop.from(prismaWorkshop);
    }

    async findAll() {
        const prismaWorkshops = await prisma.workshop.findMany();
        return prismaWorkshops.map(Workshop.from);
    }
}

module.exports = new WorkshopRepository();
