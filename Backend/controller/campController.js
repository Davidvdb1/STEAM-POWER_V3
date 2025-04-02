const express = require('express');
const campService = require('../service/campService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const camp = await campService.create(req.body);
        res.status(200).json({ message: 'Kamp gemaakt', camp });
    } catch (error) {
        console.error('Error creating camp:', error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
})

router.put('/', async (req, res) => {
    try {
        const camp = await campService.update(req.body);
        res.status(200).json({ message: 'Kamp aangepast', camp });
    } catch (error) {
        console.error(`Error updating camp ${req.body.id}:`, error);
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const includeWorkshops = req.query.includeworkshops?.toLowerCase() === 'true';
        const camp = await campService.getById(req.params.id, includeWorkshops);
        if (!camp) return res.status(400).json({ error: 'Kamp niet gevonden' });
        res.status(200).json(camp);
    } catch (error) {
        console.error(`Error fetching camp ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        const includeWorkshops = req.query.includeworkshops?.toLowerCase() === 'true';
        const camps = await campService.getAll(includeWorkshops);
        res.status(200).json(camps);
    } catch (error) {
        console.error('Error fetching all camps:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
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
        console.error(`Error updating camp ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/:id/workshop/:workshopId', async (req, res) => {
    try {
        const campId = req.params.id;
        const workshopId = req.params.workshopId;
        
        if (!campId || !workshopId) {
            return res.status(400).json({ error: "Kamp ID en Workshop ID zijn vereist" });
        }
        const updatedCamp = await campService.addWorkshop(campId, workshopId);
        if (!updatedCamp) {
            return res.status(404).json({ error: "Kamp of Workshop niet gevonden" });
        }
        res.status(200).json({ message: "Workshop toegevoegd aan kamp", camp: updatedCamp });
    } catch (error) {
        console.error(`Error adding workshop ${req.params.workshopId} to camp ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
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
        console.error(`Error deleting camp ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get('/unlinked-workshops/:campId', async (req, res) => {
    try {
        const { campId } = req.params;

        if (!campId) {
            return res.status(400).json({ error: "Camp ID is vereist" });
        }

        const workshops = await campService.getUnlinkedWorkshops(campId);

        res.status(200).json(workshops);
    } catch (error) {
        console.error(`Error fetching unlinked workshops for camp ${req.params.campId}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;
