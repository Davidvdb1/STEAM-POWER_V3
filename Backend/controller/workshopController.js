const express = require('express');
const workshopService = require('../service/workshopService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const workshop = await workshopService.create(req.body);
        res.status(200).json({ message: 'Workshop gemaakt', workshop });
    } catch (error) {
        console.error('Error creating workshop:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.put('/:id', async (req, res) => {
    try {
        const workshopId = req.params.id;
        const updatedData = req.body;
        
        if (!workshopId) {
            return res.status(400).json({ error: "Workshop ID is vereist" });
        }
        const updatedWorkshop = await workshopService.update(workshopId, updatedData);
        res.status(200).json({ message: "Workshop aangepast", workshop: updatedWorkshop });
    } catch (error) {
        console.error(`Error updating workshop ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const workshop = await workshopService.getById(req.params.id);
        res.status(200).json(workshop);
    } catch (error) {
        console.error(`Error fetching workshop ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        const workshops = await workshopService.getAll();
        res.status(200).json(workshops);
    } catch (error) {
        console.error('Error fetching all workshops:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/title/:title', async (req, res) => {
    try {
        const workshop = await workshopService.getByTitle(req.params.title);
        res.status(200).json(workshop);
    } catch (error) {
        console.error(`Error fetching workshop with title ${req.params.title}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/:id/move', async (req, res) => {
    try {
        const { id } = req.params;
        const { direction } = req.body;

        if (!["up", "down"].includes(direction)) {
            return res.status(400).json({ error: "Invalid direction. Use 'up' or 'down'." });
        }

        const result = await workshopService.moveWorkshop(id, direction);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error moving workshop ${req.params.id} ${req.body.direction}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;
