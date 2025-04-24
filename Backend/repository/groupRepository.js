const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Group = require('../model/group');

class GroupRepository {
    async create(group) {
        group.validate();
        const batteryCapacity = await this.getBatteryCapacity(); 
        const energyMultiplier = await this.getEnergyMultiplier();
    
        const prismaGroup = await prisma.group.create({
            data: {
                ...group,
                batteryCapacity: batteryCapacity,
                energyMultiplier: energyMultiplier,
            },
        });
    
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

    async addEnergyToGroup(groupId, energy) {
        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                select: { energyMultiplier: true }
            });
    
            if (!group) throw new Error('Groep niet gevonden');
    
            const incrementAmount = energy * group.energyMultiplier;
    
            const updatedGroupAfterIncrement = await prisma.group.update({
                where: { id: groupId },
                data: {
                    energy: { increment: energy },
                    batteryLevel: { increment: incrementAmount }
                }
            });
    
            const updated = await prisma.group.findUnique({
                where: { id: groupId },
                select: { batteryLevel: true, batteryCapacity: true }
            });
    
            if (updated.batteryLevel > updated.batteryCapacity) {
                await prisma.group.update({
                    where: { id: groupId },
                    data: {
                        batteryLevel: updated.batteryCapacity
                    }
                });
    
            }
        } catch (error) {
            console.error('[ERROR] addEnergyToGroup failed:', error);
            throw new Error('Kon energie niet toevoegen aan groep');
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

    async changeBatteryCapacity(batteryCapacity) {
        try {
            const result = await prisma.group.updateMany({
                data: { batteryCapacity: parseFloat(batteryCapacity) }
            });
            return result;
        } catch (error) {
            throw new Error('Kon batterijcapaciteit niet wijzigen');
        }
    }

    async changeEnergyMultiplier(energyMultiplier) {
        try {
            const result = await prisma.group.updateMany({
                data: { energyMultiplier: parseFloat(energyMultiplier) }
            });
            return result;
        } catch (error) {
            throw new Error('Kon energievermenigvuldiger niet wijzigen');
        }
    }

    async getBatteryCapacity() {
        try {
            const group = await prisma.group.findFirst();            
            return group ? group.batteryCapacity : null;
        } catch (error) {
            console.error('Error fetching battery capacity:', error);
            throw new Error('Kon batterijcapaciteit niet ophalen');
        }
    }

    async getEnergyMultiplier() {
        try {
            const group = await prisma.group.findFirst();            
            return group ? group.energyMultiplier : null;
        } catch (error) {
            console.error('Error fetching energy multiplier:', error);
            throw new Error('Kon energievermenigvuldiger niet ophalen');
        }
    }
}

module.exports = new GroupRepository();
