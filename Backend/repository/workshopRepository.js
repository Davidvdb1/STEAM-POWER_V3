const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Workshop = require('../model/workshop');

class WorkshopRepository {
    async create(workshop) {
        console.log(workshop);
        const lastWorkshop = await prisma.workshop.findFirst({
            where: { campId: workshop.id },
            orderBy: { position: 'desc' }, 
        });
    
        const newPosition = lastWorkshop ? lastWorkshop.position + 1 : 1;
    
        const prismaWorkshop = await prisma.workshop.create({
            data: {
                title: workshop.title,
                html: workshop.html,
                position: newPosition
            },
        });
    
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

    async findByTitle(title) {
        try {
            const prismaWorkshop = await prisma.workshop.findFirst({
                where: { title }
            });
    
            if (!prismaWorkshop) {
                console.log("❌ Geen workshop gevonden met titel:", title);
                return null;
            }
            return Workshop.from(prismaWorkshop);
            
        } catch (error) {
            console.error("❌ Prisma fout bij zoeken van workshop:", error);
            throw new Error("Databasefout bij het zoeken van de workshop");
        }
    }
    

    async findAll() {
        const prismaWorkshops = await prisma.workshop.findMany();
        return prismaWorkshops.map(Workshop.from);
    }

    async findUnlinkedWorkshops(campId) {
        try {
            const workshops = await prisma.workshop.findMany({
                where: {
                    campId: { not: campId.toString() } 
                },
                select: {
                    id: true,
                    title: true,
                    campId: true
                }
            });
            return workshops;
        } catch (error) {
            console.error("❌ Fout bij ophalen van niet-gekoppelde workshops uit database:", error);
            throw new Error("Databasequery mislukt voor niet-gekoppelde workshops");
        }
    }

    async updatePosition(id, newPosition) {
        return await prisma.workshop.update({
            where: { id },
            data: { position: newPosition }
        });
    }

    async findWorkshopByPosition(campId, position) {
        return await prisma.workshop.findFirst({
            where: { 
                campId: campId,  // 🔹 Zorgt dat we NIET per ongeluk een workshop uit een ander kamp pakken!
                position: position
            }
        });
    }
    
    async findWorkshopsByCamp(campId) {
        return await prisma.workshop.findMany({
            where: { campId },
            orderBy: { position: 'asc' }
        });
    }    

    async swapPositions(id1, id2, position1, position2) {
        return await prisma.$transaction([
            prisma.workshop.update({
                where: { id: id1 },
                data: { position: position2 }
            }),
            prisma.workshop.update({
                where: { id: id2 },
                data: { position: position1 }
            })
        ]);
    }
}

module.exports = new WorkshopRepository();
