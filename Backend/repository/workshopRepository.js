const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Workshop = require('../model/workshop');
const utility = require('../util/utility');

class WorkshopRepository {
    async create(workshop) {
        try {
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
        } catch (error) {
            throw new utility.DatabaseError(`Error creating workshop: ${error.message}`);
        }
    }
    
    async update(id, updatedWorkshop) {
        try {
            const existingWorkshop = await this.findById(id);
            if (!existingWorkshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }

            const prismaWorkshop = await prisma.workshop.update({
                where: { id },
                data: {
                    ...updatedWorkshop,
                },
            });

            return Workshop.from(prismaWorkshop);
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            if (error.code === 'P2025') {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            throw new utility.DatabaseError(`Error updating workshop: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const prismaWorkshop = await prisma.workshop.findUnique({ where: { id } });
            if (!prismaWorkshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            return Workshop.from(prismaWorkshop);
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error finding workshop by ID: ${error.message}`);
        }
    }

    async findByTitle(title) {
        try {
            const prismaWorkshop = await prisma.workshop.findFirst({
                where: { title }
            });
    
            if (!prismaWorkshop) {
                throw new utility.NotFoundError("Workshop niet gevonden met titel: " + title);
            }
            return Workshop.from(prismaWorkshop);
            
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error finding workshop by title: ${error.message}`);
        }
    }
    
    async findAll() {
        try {
            const prismaWorkshops = await prisma.workshop.findMany();
            return prismaWorkshops.map(Workshop.from);
        } catch (error) {
            throw new utility.DatabaseError(`Error finding all workshops: ${error.message}`);
        }
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
            throw new utility.DatabaseError(`Error finding unlinked workshops: ${error.message}`);
        }
    }

    async updatePosition(id, newPosition) {
        try {
            return await prisma.workshop.update({
                where: { id },
                data: { position: newPosition }
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            throw new utility.DatabaseError(`Error updating workshop position: ${error.message}`);
        }
    }

    async findWorkshopByPosition(campId, position) {
        try {
            const workshop = await prisma.workshop.findFirst({
                where: { 
                    campId: campId,
                    position: position
                }
            });
            return workshop;
        } catch (error) {
            throw new utility.DatabaseError(`Error finding workshop by position: ${error.message}`);
        }
    }
    
    async findWorkshopsByCamp(campId) {
        try {
            return await prisma.workshop.findMany({
                where: { campId },
                orderBy: { position: 'asc' }
            });
        } catch (error) {
            throw new utility.DatabaseError(`Error finding workshops by camp: ${error.message}`);
        }
    }    

    async swapPositions(id1, id2, position1, position2) {
        try {
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
        } catch (error) {
            if (error.code === 'P2025') {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            throw new utility.DatabaseError(`Error swapping workshop positions: ${error.message}`);
        }
    }
}

module.exports = new WorkshopRepository();
