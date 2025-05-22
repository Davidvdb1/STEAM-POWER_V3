const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const gameStatisticsRouter = require('../../controller/gameStatisticsController');
const gameStatisticsService = require('../../service/gameStatisticsService');

jest.mock('../../service/gameStatisticsService');

const app = express();
app.use(bodyParser.json());
app.use('/gameStatistics', gameStatisticsRouter);

describe('GameStatistics Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /gameStatistics', () => {
    it('should create game statistics', async () => {
      const mockResponse = { id: 1, groupId: 'abc', currency: {} };
      gameStatisticsService.create.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/gameStatistics')
        .send({ groupId: 'abc', greenEnergy: 10, greyEnergy: 20, coins: 30 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockResponse);
      expect(gameStatisticsService.create).toHaveBeenCalled();
    });
  });

  describe('GET /gameStatistics/:id', () => {
    it('should fetch game statistics by ID', async () => {
      const mockData = { id: 1, groupId: 'abc' };
      gameStatisticsService.getById.mockResolvedValue(mockData);

      const res = await request(app).get('/gameStatistics/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockData);
    });

    it('should return 404 if not found', async () => {
      gameStatisticsService.getById.mockResolvedValue(null);

      const res = await request(app).get('/gameStatistics/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('GameStatistics not found');
    });
  });

  describe('PUT /gameStatistics/:id/currency', () => {
    it('should update currency', async () => {
      const updatedCurrency = { id: 1, coins: 50 };
      gameStatisticsService.updateCurrency.mockResolvedValue(updatedCurrency);

      const res = await request(app)
        .put('/gameStatistics/1/currency')
        .send({ coins: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updatedCurrency);
    });
  });

  describe('POST /gameStatistics/:id/buildings', () => {
    it('should add a building', async () => {
      const building = { id: 1, xLocation: 1, yLocation: 2, level: { level: 1 } };
      gameStatisticsService.addBuilding.mockResolvedValue(building);

      const res = await request(app)
        .post('/gameStatistics/1/buildings')
        .send(building);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(building);
    });
  });

  describe('POST /gameStatistics/:id/checkpoints', () => {
    it('should record a checkpoint', async () => {
      const cp = { id: 123 };
      gameStatisticsService.recordCheckpoint.mockResolvedValue(cp);

      const res = await request(app)
        .post('/gameStatistics/1/checkpoints')
        .send({
          currency: { greenEnergy: 1, greyEnergy: 2, coins: 3 },
          buildings: [],
          assets: [],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(cp);
    });
  });

  describe('DELETE /gameStatistics/:id', () => {
    it('should delete game statistics', async () => {
      gameStatisticsService.delete.mockResolvedValue();

      const res = await request(app).delete('/gameStatistics/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('GameStatistics deleted');
    });
  });
});
