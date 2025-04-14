const express = require('express');
const questionService = require('../service/questionService');
const middleware = require('../util/middleware');
const groupService = require('../service/groupService');


const router = express.Router();

// Create a new question
router.post('/', async (req, res) => {
    try {
        const question = await questionService.createQuestion(req.body);
        res.status(201).json(question);
    } catch (error) {
        console.error('Error creating question:', error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
});

// Get a question by ID
router.get('/:id', async (req, res) => {
    try {
        const question = await questionService.getQuestionById(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Error fetching question ${req.params.id}:`, error);
        const statusCode = error.statusCode || 404;
        res.status(statusCode).json({ error: error.message });
    }
});

// Update a question by ID
router.put('/:id', async (req, res) => {
    try {
        const question = await questionService.updateQuestion(req.params.id, req.body);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Error updating question ${req.params.id}:`, error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
});

// Delete a question by ID
router.delete('/:id', async (req, res) => {
    try {
        const question = await questionService.deleteQuestion(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Error deleting question ${req.params.id}:`, error);
        const statusCode = error.statusCode || 404;
        res.status(statusCode).json({ error: error.message });
    }
});

// Get all questions
router.get('/', async (req, res) => {
    try {
        const questions = await questionService.getAllQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching all questions:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.post('/:id/answer', async (req, res) => {
    try {
        const { id } = req.params;
        const { groupId, answerValue, energyReading } = req.body;

        if (!groupId || answerValue === "" || !energyReading) {
            return res.status(400).json({ error: "Group ID, answer value and energy reading are required" });
        }

        const answer = await questionService.submitAnswer({ questionId: id, groupId, answerValue, energyReading });
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

        const group = await groupService.getById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const groupQuestions = await questionService.getGroupQuestions(groupId);
        res.status(200).json(groupQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;