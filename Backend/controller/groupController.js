const express = require('express');
const groupService = require('../service/groupService');
const middleware = require('../util/middleware');


const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const group = await groupService.create(req.body);
        res.status(200).json({ message: 'Groep gemaakt', group });
    } catch (error) {
        console.error('Error creating group:', error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
})

router.put('/', async (req, res) => {
    try {
        const group = await groupService.update(req.body);
        res.status(200).json({ message: 'Groep aangepast', group });
    } catch (error) {
        console.error(`Error updating group ${req.body.id}:`, error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/:id/score', async (req, res) => {
    try {
        const group = await groupService.addScore(req.params.id, req.body);
        res.status(200).json({ message: 'Score toegevoegd', group });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




router.post('/login', async (req, res) => {
    try {
        const JWT = await groupService.login(req.body.code);
        res.status(200).json({ message: 'Succesvol ingelogd', JWT })
    } catch (error) {
        console.error(`Error logging in group with code ${req.body.code}:`, error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        const groups = await groupService.getAll();
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching all groups:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/battery', async (req, res) => {
    try {
        const batteryCapacity = await groupService.getBatteryCapacity();
        res.status(200).json(batteryCapacity);
    } catch (error) {
        console.error('Error fetching battery capacity:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/multiplier', async (req, res) => {
    try {
        const energyMultiplier = await groupService.getEnergyMultiplier();
        res.status(200).json(energyMultiplier);
    } catch (error) {
        console.error('Error fetching energy multiplier:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await groupService.deleteById(req.params.id);
        res.status(200).json({ message: 'Groep verwijderd' });
    } catch (error) {
        console.error(`Error deleting group ${req.params.id}:`, error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/battery', async (req, res) => {
    try {
        const { batteryCapacity } = req.body;

        if (typeof batteryCapacity !== 'number') {
            return res.status(400).json({ error: 'batteryCapacity moet een getal zijn' });
        }

        const result = await groupService.changeBatteryCapacityForAllGroups(batteryCapacity);
        res.status(200).json({ message: 'Batterijcapaciteit aangepast voor alle groepen', result });
    } catch (error) {
        console.error('Error updating battery capacity for all groups:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/multiplier', async (req, res) => {
    try {
        const { energyMultiplier } = req.body;

        if (typeof energyMultiplier !== 'number') {
            return res.status(400).json({ error: 'energyMultiplier moet een getal zijn' });
        }

        const result = await groupService.changeEnergyMultiplierForAllGroups(energyMultiplier);
        res.status(200).json({ message: 'Energievermenigvuldiger aangepast voor alle groepen', result });
    } catch (error) {
        console.error('Error updating energy multiplier for all groups:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
}); 

module.exports = router;
