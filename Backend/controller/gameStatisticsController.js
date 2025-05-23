const express = require('express');
const gameStatisticsService = require('../service/gameStatisticsService');

const router = express.Router();

// Create new game statistics (ok)
router.post('/', async (req, res) => {
  try {
    const { groupId, greenEnergy, greyEnergy, coins } = req.body;
    const gs = await gameStatisticsService.create({ groupId, greenEnergy, greyEnergy, coins });
    res.status(201).json(gs);
  } catch (error) {
    console.error('Error creating game statistics:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Fetch all game statistics (ok)
router.get('/', async (req, res) => {
  console.log('→ [gameStatistics] fetching all game statistics');
  try {
    const gameStatistics = await gameStatisticsService.getAllGameStatistics();
    res.status(200).json(gameStatistics);
  } catch (error) {
    console.error('✖ [gameStatistics] ERROR in GET / →', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// GET /gameStatistics/group/:groupId (ok)
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  console.log('→ [gameStatistics] fetching stats for groupId:', groupId);

  try {
    const gs = await gameStatisticsService.getByGroupId(groupId);
    if (!gs) {
      console.log(`→ [gameStatistics] no stats found for group ${groupId}`);
      return res.status(404).json({ error: 'GameStatistics for group not found' });
    }
    console.log('→ [gameStatistics] found stats:', gs);
    res.status(200).json(gs);
  } catch (error) {
    console.error('✖ [gameStatistics] ERROR in GET /group/:groupId →', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// ——— Fetch by statistics ID ——— (ok)
router.get('/:id', async (req, res) => {
  try {
    const gs = await gameStatisticsService.getById(req.params.id);
    if (!gs) {
      return res.status(404).json({ error: 'GameStatistics not found' });
    }
    res.status(200).json(gs);
  } catch (error) {
    console.error(`Error fetching GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// get currency by id (ok)
router.get('/:id/currency', async (req, res) => {
  console.log(`→ HIT /:id/currency; req.params.id =`, req.params.id);
  try {
    const currency = await gameStatisticsService.getCurrencyById(req.params.id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    res.status(200).json(currency);
  } catch (error) {
    console.error(`Error fetching currency for GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Update currency (ok)
router.put('/:id/currency', async (req, res) => {
  try {
    const updated = await gameStatisticsService.updateCurrency(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(`Error updating currency ${req.params.id}:`, error);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.post('/:id/currency/increment', async (req, res) => {
  try {
    const updated = await gameStatisticsService.incrementCurrency(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(`Error incrementing currency ${req.params.id}:`, error);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});


// Add a building (ok)
router.post('/:id/buildings', async (req, res) => {
  try {
    const building = await gameStatisticsService.addBuilding(req.params.id, req.body);
    res.status(201).json(building);
  } catch (error) {
    console.error(`Error adding building to GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});


// Delete a building (ok)
router.delete('/buildings/:buildingId', async (req, res) => {
  try {
    await gameStatisticsService.removeBuilding(req.params.buildingId);
    res.status(200).json({ message: 'Building removed' });
  } catch (error) {
    console.error(`Error removing building ${req.params.buildingId}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Add an asset (ok)
router.post('/:id/assets', async (req, res) => {
  try {
    const asset = await gameStatisticsService.addAsset(req.params.id, req.body);
    res.status(201).json(asset);
  } catch (error) {
    console.error(`Error adding asset to GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

// Delete an asset (ok)
router.delete('/assets/:assetId', async (req, res) => {
  try {
    await gameStatisticsService.removeAsset(req.params.assetId);
    res.status(200).json({ message: 'Asset removed' });
  } catch (error) {
    console.error(`Error removing asset ${req.params.assetId}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Record a checkpoint (ok)
router.post('/:id/checkpoints', async (req, res) => {
  try {
    const cp = await gameStatisticsService.recordCheckpoint(req.params.id, req.body);
    res.status(201).json(cp);
  } catch (error) {
    console.error(`Error recording checkpoint for GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

// Delete a checkpoint (ok)
router.delete('/checkpoints/:checkpointId', async (req, res) => {
  try {
    await gameStatisticsService.removeCheckpoint(req.params.checkpointId);
    res.status(200).json({ message: 'Checkpoint removed' });
  } catch (error) {
    console.error(`Error removing checkpoint ${req.params.checkpointId}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Delete game statistics (ok)
router.delete('/:id', async (req, res) => {
  try {
    await gameStatisticsService.delete(req.params.id);
    res.status(200).json({ message: 'GameStatistics deleted' });
  } catch (error) {
    console.error(`Error deleting GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// upgrade a building

router.put('/buildings/:buildingId/upgrade', async (req, res) => {
   console.log('→ [PUT /buildings/:buildingId/upgrade] params =', req.params, 'body =', req.body);
  try {
    const building = await gameStatisticsService.upgradeBuilding(req.params.buildingId, req.body);
    res.status(200).json(building);
  } catch (error) {
    console.error(`Error upgrading building ${req.params.buildingId}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

module.exports = router;
