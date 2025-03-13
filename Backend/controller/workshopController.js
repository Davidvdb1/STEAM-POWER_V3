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

router.put('/:id', async (req, res) => {
    try {
        const workshopId = req.params.id;
        const updatedData = req.body;
        
        if (!workshopId) {
            return res.status(400).json({ error: "Workshop ID is vereist" });
        }
        const updatedWorkshop = await workshopService.update(workshopId, updatedData);
        if (!updatedWorkshop) {
            return res.status(404).json({ error: "Workshop niet gevonden" });
        }
        res.status(200).json({ message: "Workshop aangepast", workshop: updatedWorkshop });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

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

router.get('/title/:title', async (req, res) => {
    try {
        const workshop = await workshopService.getByTitle(req.params.title);
        if (!workshop) {
            console.log("❌ Workshop niet gevonden:", req.params.title);
            return res.status(400).json({ error: 'Workshop niet gevonden' });
        }
        res.status(200).json(workshop);
    } catch (error) {
        console.error("❌ Fout in GET /title/:title:", error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


module.exports = router;
