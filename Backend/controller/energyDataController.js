const express = require('express');
const energyDataService = require('../service/energyDataService');
const middleware = require('../util/middleware');


const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const energyData = await energyDataService.create(req.body);
        res.status(200).json({ message: 'Energy data created', energyData });
    } catch (error) {
        console.error('Error creating energy data:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get('/:groupId', async (req, res) => {
    try {
        const energyData = await energyDataService.getAllByGroup(req.params.groupId);
        res.status(200).json(energyData);
    } catch (error) {
        console.error(`Error fetching energy data for group ${req.params.groupId}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;