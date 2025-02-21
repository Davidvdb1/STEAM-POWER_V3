const express = require('express');
const groupService = require('../service/groupService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const group = await groupService.create(req.body);
        res.status(200).json({ message: 'Groep gemaakt', group });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const JWT = await groupService.login(req.body);
        res.status(200).json({ message: 'Succesvol ingelogd', JWT})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        const groups = await groupService.getAll();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
