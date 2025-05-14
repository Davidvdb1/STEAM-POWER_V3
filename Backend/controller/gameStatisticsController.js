const express = require('express');
const gameStatisticsService = require('../service/gameStatisticsService');

const router = express.Router();

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

router.get('/group/:groupId', async (req, res) => {
  try {
    const gs = await gameStatisticsService.getByGroupId(req.params.groupId);
    if (!gs) {
      return res.status(404).json({ error: 'GameStatistics for group not found' });
    }
    res.status(200).json(gs);
  } catch (error) {
    console.error(`Error fetching GameStatistics for group ${req.params.groupId}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

router.put('/:id/currency', async (req, res) => {
  try {
    const updated = await gameStatisticsService.updateCurrency(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error(`Error updating currency for GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

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

router.put('/buildings/:buildingId', async (req, res) => {
  try {
    const building = await gameStatisticsService.updateBuilding(req.params.buildingId, req.body);
    res.status(200).json(building);
  } catch (error) {
    console.error(`Error updating building ${req.params.buildingId}:`, error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

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

module.exports = router;
