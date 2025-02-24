const express = require('express');
const workshopService = require('../service/workshopService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const workshop = await workshopService.create(req.body);
        res.status(200).json({ message: 'Workshop gemaakt', workshop });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.put('/', async (req, res) => {
    try {
        const workshop = await workshopService.update(req.body);
        res.status(200).json({ message: 'Workshop aangepast', workshop });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const workshop = await workshopService.getById(req.params.id);
        if (!workshop) return res.status(400).json({ error: 'Workshop niet gevonden' });
        res.status(200).json(workshop);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/', async (req, res) => {
    try {
        const workshops = await workshopService.getAll();
        res.status(200).json(workshops);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
