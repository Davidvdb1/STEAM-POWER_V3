const QuestionRepository = require("../repository/questionRepository");
const Question = require("../model/question");

class QuestionService {
    constructor() {
        this.qRepo = new QuestionRepository();
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
}

module.exports = QuestionService;