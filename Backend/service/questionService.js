const QuestionRepository = require("../repository/questionRepository");
const Question = require("../model/question");
const Answer = require("../model/answer"); // added import for Answer model
const AnswerRepository = require("../repository/answerRepository"); // added import for Answer repository

class QuestionService {
    constructor() {
        this.qRepo = new QuestionRepository();
        this.answerRepo = new AnswerRepository(); // fixed property assignment
    }

    async createQuestion(data) {
        try {
            const question = new Question(data);
            return await this.qRepo.create(question);
        } catch (error) {
            throw error;
        }
    }

    async updateQuestion(id, data) {
        try {
            // Check if the question exists
            const existingQuestion = await this.qRepo.findById(id);
            if (!existingQuestion) {
                throw new Error("Question not found");
            }

            // Validate the update data
            const updatedQuestion = new Question({ ...existingQuestion, ...data }, true);

            return await this.qRepo.update(id, updatedQuestion);
        } catch (error) {
            throw error;
        }
    }

    async deleteQuestion(id) {
        try {
            // Check if the question exists
            const existingQuestion = await this.qRepo.findById(id);
            if (!existingQuestion) {
                throw new Error("Question not found");
            }
            return await this.qRepo.delete(id);
        } catch (error) {
            throw error;
        }
    }

    async getQuestionById(id) {
        try {
            const question = await this.qRepo.findById(id);
            if (!question) throw new Error(`Could not find question with id ${id}`);

            return question;
        } catch (error) {
            throw error;
        }
    }

    async getAllQuestions() {
        try {
            return await this.qRepo.findAll();
        } catch (error) {
            throw error;
        }
    }

    async submitAnswer({ questionId, groupId, answerValue, energyReading }) {
        try {
            const question = await this.getQuestionById(questionId);
            if (!question) throw new Error(`Could not find question with id ${questionId}`);

            const answer = new Answer({ questionId, groupId, answerValue, energyReading });
            answer.checkAnswerValue(question.wattage);

            return await this.answerRepo.create(answer);
        } catch (error) {
            throw error;
        }
    }

    async getGroupQuestions(groupId) {
        try {

            const allQuestions = await this.qRepo.findAll();

            const groupSpecificQuestions = await Promise.all(
                allQuestions.map(async (question) => {
                    const answersForQuestions = await this.answerRepo.findByGroupIdAndQuestionId(groupId, question.id);
                    const answerCount = answersForQuestions.length;
                    const isSolved = answersForQuestions.some(answer => answer.isCorrect);
                    return {
                        ...question,
                        answerCount,
                        isSolved
                        
                    };
                })
            );

            return groupSpecificQuestions;


        } catch (error) {
            throw error;
        }
    }
}

module.exports = QuestionService;