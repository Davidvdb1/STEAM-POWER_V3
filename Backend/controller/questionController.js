const express = require('express');
const QuestionService = require('../service/questionService');

const router = express.Router();
const qService = new QuestionService();

// Create a new question
router.post('/', async (req, res) => {
    try {
        const question = await qService.createQuestion(req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a question by ID
router.get('/:id', async (req, res) => {
    try {
        const question = await qService.getQuestionById(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Update a question by ID
router.put('/:id', async (req, res) => {
    try {
        const question = await qService.updateQuestion(req.params.id, req.body);
        res.status(200).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a question by ID
router.delete('/:id', async (req, res) => {
    try {
        const question = await qService.deleteQuestion(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Get all questions
router.get('/', async (req, res) => {
    try {
        const questions = await qService.getAllQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/answer', async (req, res) => {
    try {
        const { id } = req.params;
        const { groupId, answerValue, energyReading } = req.body;

        if (!groupId || !answerValue || !energyReading) {
            return res.status(400).json({ error: "Group ID, answer value and energy reading are required" });
        }

        const answer = await qService.submitAnswer({questionId: id, groupId, answerValue, energyReading});
        res.status(201).json(answer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ error: "Group ID is required" });
        }

        const groupQuestions = await qService.getGroupQuestions(groupId);
        res.status(200).json(groupQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;