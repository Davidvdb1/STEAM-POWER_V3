const express = require('express');
const { EnergyDataService } = require('../service/energyDataService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const energyData = await energyDataService.create(req.body);
        res.status(200).json({ message: 'Energy data created', energyData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:groupId', async (req, res) => {
    try {
        const energyData = await energyDataService.getAllByGroup(req.params.groupId);
        res.status(200).json(energyData);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;