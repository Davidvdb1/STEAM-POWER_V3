const TestLogger = require("./testLogger");

const assert = require('assert');
const QuestionService = require('../service/questionService');
const Question = require('../model/question');
const Answer = require('../model/answer');

(async function runTests() {
    const questionServiceInstance = new QuestionService();

    // Test case: Successful answer submission.
    try {
        questionServiceInstance.getQuestionById = async (id) => {
            return { wattage: 100 };
        };
        questionServiceInstance.answerRepo.create = async (answer) => {
            return { ...answer, id: 1 };
        };

        const result = await questionServiceInstance.submitAnswer({
            questionId: 1,
            groupId: 10,
            answerValue: 100,
            energyReading: 50
        });
        assert.strictEqual(result.id, 1);
        TestLogger.log("Test submitAnswer success passed");
    } catch (error) {
        TestLogger.error("Test submitAnswer success failed", error);
    }

    // Test case: Failing when the question cannot be found.
    try {
        questionServiceInstance.getQuestionById = async (id) => {
            throw new Error(`Could not find question with id ${id}`);
        };

        await questionServiceInstance.submitAnswer({
            questionId: 2,
            groupId: 20,
            answerValue: 200,
            energyReading: 60
        });
        assert.fail("Expected error was not thrown");
    } catch (error) {
        assert.strictEqual(error.message, "Could not find question with id 2");
        TestLogger.log("Test submitAnswer failure passed");
    }

    // Test case: getGroupQuestions returns enriched questions
    try {
        questionServiceInstance.qRepo.findAll = async () => {
            return [
                { id: "q1", wattage: 10, title: "Question 1" },
                { id: "q2", wattage: 20, title: "Question 2" }
            ];
        };
        questionServiceInstance.answerRepo.findByGroupIdAndQuestionId = async (groupId, questionId) => {
            if (questionId === "q1") return []; // no answers
            if (questionId === "q2") return [{ isCorrect: true }];
            return [];
        };

        const groupId = "groupTest";
        const result = await questionServiceInstance.getGroupQuestions(groupId);

        assert.strictEqual(result.length, 2, "Expected 2 questions in the result");

        const q1 = result.find(q => q.id === "q1");
        const q2 = result.find(q => q.id === "q2");

        assert.ok(q1, "Question q1 should exist");
        assert.strictEqual(q1.answerCount, 0, "q1 answerCount should be 0");
        assert.strictEqual(q1.isSolved, false, "q1 isSolved should be false");

        assert.ok(q2, "Question q2 should exist");
        assert.strictEqual(q2.answerCount, 1, "q2 answerCount should be 1");
        assert.strictEqual(q2.isSolved, true, "q2 isSolved should be true");

        TestLogger.log("Test getGroupQuestions passed");
    } catch (error) {
        TestLogger.error("Test getGroupQuestions failed", error);
    }

})();

