const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Workshop = require('../model/workshop');

class WorkshopRepository {
    async create(workshop) {
        const prismaWorkshop = await prisma.workshop.create({ data: workshop });
        return Workshop.from(prismaWorkshop);
    }

    async update(id, updatedWorkshop) {
        const existingWorkshop = await this.findById(id);
        if (!existingWorkshop) {
            throw new Error("Workshop niet gevonden");
        }

        const prismaWorkshop = await prisma.workshop.update({
            where: { id },
            data: {
                ...updatedWorkshop,
            },
        });

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
