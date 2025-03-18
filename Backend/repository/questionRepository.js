const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Question = require('../model/question');

class QuestionRepository {
    async create(data) {
        try {
            const prismaQuestion = await prisma.question.create({
                data: data
            });
            return Question.from(prismaQuestion);
        } catch (err) {
            throw err;
        }

    }

    async update(id, data) {
        const prismaQuestion = await prisma.question.update({
            where: { id: id },
            data: data
        });
        return Question.from(prismaQuestion);
    }

    async delete(id) {
        const prismaQuestion = await prisma.question.delete({
            where: { id: id }
        });
        return Question.from(prismaQuestion);
    }

    async findById(id) {
        const prismaQuestion = await prisma.question.findUnique({
            where: { id: id }
        });
        return prismaQuestion ? Question.from(prismaQuestion) : null;
    }

    async findAll() {
        const prismaQuestions = await prisma.question.findMany();

        return prismaQuestions.map(Question.from);
    }
}

module.exports = QuestionRepository;