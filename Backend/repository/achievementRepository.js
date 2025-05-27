const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Achievement = require('../model/achievement');
const utility = require('../util/utility');

class AchievementRepository {
    async create(data) {
        try {
            const achievement = new Achievement(data);
            achievement.validate();
            const prismaAchievement = await prisma.achievement.create({ 
                data: {
                    description: achievement.description,
                    reward: achievement.reward,
                    gameStatistics: { connect: { id: data.gameStatisticsId } }
                } 
            });
            return Achievement.from(prismaAchievement);
        } catch (error) {
            if (error.message.includes('Invalid')) {
                throw new Error(`Validation error: ${error.message}`);
            }
            throw new Error(`Error creating achievement: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            // First, validate the data would make a valid achievement
            const tempAchievement = new Achievement({
                ...data,
                id // Add the ID to make it a complete object
            });
            
            const prismaAchievement = await prisma.achievement.update({
                where: { id },
                data: {
                    description: data.description,
                    reward: data.reward
                }
            });
            
            return Achievement.from(prismaAchievement);
        } catch (error) {
            if (error.message.includes('Invalid')) {
                throw new Error(`Validation error: ${error.message}`);
            }
            throw new Error(`Error updating achievement: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await prisma.achievement.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting achievement: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const prismaAchievement = await prisma.achievement.findUnique({
                where: { id }
            });
            return prismaAchievement ? Achievement.from(prismaAchievement) : null;
        } catch (error) {
            throw new Error(`Error finding achievement by ID: ${error.message}`);
        }
    }

    async findAllByGameStatisticsId(gameStatisticsId) {
        try {
            const prismaAchievements = await prisma.achievement.findMany({
                where: { gameStatisticsId }
            });
            return prismaAchievements.map(Achievement.from);
        } catch (error) {
            throw new Error(`Error finding achievements by game statistics ID: ${error.message}`);
        }
    }

    async findAll() {
        try {
            const prismaAchievements = await prisma.achievement.findMany();
            return prismaAchievements.map(Achievement.from);
        } catch (error) {
            throw new Error(`Error finding all achievements: ${error.message}`);
        }
    }
}

module.exports = new AchievementRepository();
