const express = require('express');
const campService = require('../service/campService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const camp = await campService.create(req.body);
        res.status(200).json({ message: 'Kamp gemaakt', camp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.put('/', async (req, res) => {
    try {
        const camp = await campService.update(req.body);
        res.status(200).json({ message: 'Kamp aangepast', camp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const includeWorkshops = req.query.includeworkshops?.toLowerCase() === 'true';
        const camp = await campService.getById(req.params.id, includeWorkshops);
        if (!camp) return res.status(400).json({ error: 'Kamp niet gevonden' });
        res.status(200).json(camp);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/', async (req, res) => {
    try {
        const includeWorkshops = req.query.includeworkshops?.toLowerCase() === 'true';
        const camps = await campService.getAll(includeWorkshops);
        res.status(200).json(camps);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/:id', async (req, res) => {
    try {
        const campId = req.params.id;
        const updatedData = req.body;
        
        if (!campId) {
            return res.status(400).json({ error: "Kamp ID is vereist" });
        }
        const updatedCamp = await campService.update(campId, updatedData);
        if (!updatedCamp) {
            return res.status(404).json({ error: "Kamp niet gevonden" });
        }
        res.status(200).json({ message: "Kamp aangepast", camp: updatedCamp });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const campId = req.params.id;

        if (!campId) {
            return res.status(400).json({ error: "Kamp ID is vereist" });
        }

        const deletedCamp = await campService.delete(campId);
        if (!deletedCamp) {
            return res.status(404).json({ error: "Kamp niet gevonden" });
        }

        res.status(200).json({ message: "Kamp succesvol verwijderd" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});



module.exports = router;
