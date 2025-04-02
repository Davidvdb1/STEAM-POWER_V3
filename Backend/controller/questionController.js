const express = require('express');
const QuestionService = require('../service/questionService');
const middleware = require('../util/middleware');


const router = express.Router();
const qService = new QuestionService();

// Create a new question
router.post('/', async (req, res) => {
    try {
        const question = await qService.createQuestion(req.body);
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
        const question = await qService.getQuestionById(req.params.id);
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
        const question = await qService.updateQuestion(req.params.id, req.body);
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
        const question = await qService.deleteQuestion(req.params.id);
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
        const questions = await qService.getAllQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching all questions:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;