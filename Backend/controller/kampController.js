const express = require('express');
const kampService = require('../service/kampService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const kamp = await kampService.create(req.body);
        res.status(200).json({ message: 'kamp created', kamp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const kamp = await kampService.getById(req.params.id);
        if (!kamp) return res.status(400).json({ error: 'kamp not found' });
        res.status(200).json(kamp);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/', async (req, res) => {
    try {
        const kamps = await kampService.getAll();
        res.status(200).json(kamps);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
