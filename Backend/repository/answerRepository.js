const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Answer = require('../model/answer');

class AnswerRepository {
    async create(data) {
        try {
            const prismaAnswer = await prisma.answer.create({
                data: data
            });
            return Answer.from(prismaAnswer);
        } catch (err) {
            throw err;
        }
    }

    async update(id, data) {
        const prismaAnswer = await prisma.answer.update({
            where: { id: id },
            data: data
        });
        return Answer.from(prismaAnswer);
    }

    async delete(id) {
        const prismaAnswer = await prisma.answer.delete({
            where: { id: id }
        });
        return Answer.from(prismaAnswer);
    }

    async findById(id) {
        const prismaAnswer = await prisma.answer.findUnique({
            where: { id: id }
        });
        return prismaAnswer ? Answer.from(prismaAnswer) : null;
    }

    async findAll() {
        const prismaAnswers = await prisma.answer.findMany();
        return prismaAnswers.map(Answer.from);
    }

    async findByQuestionId(questionId) {
        const prismaAnswers = await prisma.answer.findMany({
            where: { questionId: questionId }
        });
        return prismaAnswers.map(Answer.from);
    }

    async findByGroupId(groupId) {
        const prismaAnswers = await prisma.answer.findMany({
            where: { groupId: groupId }
        });
        return prismaAnswers.map(Answer.from);
    }

    async findByGroupIdAndQuestionId(groupId, questionId) {
        const prismaAnswers = await prisma.answer.findMany({
            where: {
                groupId: groupId,
                questionId: questionId
            }
        });
        return prismaAnswers.map(Answer.from);
    }
}

module.exports = AnswerRepository;