const TestLogger = require("./testLogger");
const assert = require('assert');

const QuestionController = require('../controller/questionController');

const apiUrl = "http://localhost:3000/";

(async function runTests() {
    // Test case: Successful answer submission.
    try {
        const groupsResponse = await fetch(`${apiUrl}/groups`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!groupsResponse.ok) {
            throw new Error("Failed to fetch groups");
        }

        const groups = await groupsResponse.json();

        if (groups.length === 0) {
            throw new Error("No groups found");
        }

        const testGroup = groups[0];

        const questionsResponse = await fetch(`${apiUrl}/questions/group/${testGroup.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!questionsResponse.ok) {
            throw new Error("Failed to fetch questions");
        }

        const questions = await questionsResponse.json();

        if (questions.length === 0) {
            throw new Error("No questions found");
        }

        const testQuestion = questions[0];
        const testAnswer = {
            questionId: testQuestion.id,
            groupId: testGroup.id,
            answerValue: 100,
            energyReading: 50
        };

    } catch (error) {
        TestLogger.error("Test submitAnswer success failed", error);
    }
})();
