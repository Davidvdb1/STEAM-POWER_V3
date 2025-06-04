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
    beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Game Statistics Operations', () => {
    describe('POST /gameStatistics', () => {
      it('should create game statistics', async () => {
        const mockResponse = { id: 'gs-1', groupId: 'group-1', currency: {} };
        gameStatisticsService.create.mockResolvedValue(mockResponse);

        const res = await request(app)
          .post('/gameStatistics')
          .send({ groupId: 'group-1', greenEnergy: 10, greyEnergy: 20, coins: 30 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockResponse);
        expect(gameStatisticsService.create).toHaveBeenCalledWith({
          groupId: 'group-1',
          greenEnergy: 10,
          greyEnergy: 20,
          coins: 30
        });
      });

      it('should handle errors during creation', async () => {
        const errorMessage = 'Validation error';
        gameStatisticsService.create.mockRejectedValue(new Error(errorMessage));

        const res = await request(app)
          .post('/gameStatistics')
          .send({ groupId: 'group-1' });

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe(errorMessage);
      });
    });

    describe('GET /gameStatistics', () => {
      it('should get all game statistics', async () => {
        const mockGameStatistics = [
          { id: 'gs-1', groupId: 'group-1' },
          { id: 'gs-2', groupId: 'group-2' }
        ];
        gameStatisticsService.getAllGameStatistics.mockResolvedValue(mockGameStatistics);

        const res = await request(app).get('/gameStatistics');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockGameStatistics);
        expect(gameStatisticsService.getAllGameStatistics).toHaveBeenCalled();
      });

      it('should handle errors when getting all game statistics', async () => {
        gameStatisticsService.getAllGameStatistics.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/gameStatistics');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Database error');
      });
    });

    describe('GET /gameStatistics/:id', () => {
      it('should fetch game statistics by ID', async () => {
        const mockData = { id: 'gs-1', groupId: 'group-1' };
        gameStatisticsService.getById.mockResolvedValue(mockData);

        const res = await request(app).get('/gameStatistics/gs-1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(gameStatisticsService.getById).toHaveBeenCalledWith('gs-1');
      });

      it('should return 404 if not found', async () => {
        gameStatisticsService.getById.mockResolvedValue(null);

        const res = await request(app).get('/gameStatistics/nonexistent');
        
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('GameStatistics not found');
      });
    });

    describe('GET /gameStatistics/group/:groupId', () => {
      it('should fetch game statistics by group ID', async () => {
        const mockData = { id: 'gs-1', groupId: 'group-1' };
        gameStatisticsService.getByGroupId.mockResolvedValue(mockData);

        const res = await request(app).get('/gameStatistics/group/group-1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(gameStatisticsService.getByGroupId).toHaveBeenCalledWith('group-1');
      });

      it('should return 404 if group not found', async () => {
        gameStatisticsService.getByGroupId.mockResolvedValue(null);

        const res = await request(app).get('/gameStatistics/group/nonexistent');
        
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('GameStatistics for group not found');
      });
    });
  });

  describe('Currency Operations', () => {
    describe('GET /gameStatistics/:id/currency', () => {
      it('should get currency by ID', async () => {
        const mockCurrency = { id: 'cur-1', greenEnergy: 100, greyEnergy: 50, coins: 500, score: 1000 };
        gameStatisticsService.getCurrencyById.mockResolvedValue(mockCurrency);

        const res = await request(app).get('/gameStatistics/gs-1/currency');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockCurrency);
        expect(gameStatisticsService.getCurrencyById).toHaveBeenCalledWith('gs-1');
      });

      it('should return 404 if currency not found', async () => {
        gameStatisticsService.getCurrencyById.mockResolvedValue(null);

        const res = await request(app).get('/gameStatistics/nonexistent/currency');
        
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Currency not found');
      });
    });

    describe('PUT /gameStatistics/:id/currency', () => {
      it('should update currency', async () => {
        const updatedCurrency = { id: 'cur-1', coins: 50 };
        gameStatisticsService.updateCurrency.mockResolvedValue(updatedCurrency);

        const res = await request(app)
          .put('/gameStatistics/gs-1/currency')
          .send({ coins: 50 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(updatedCurrency);
        expect(gameStatisticsService.updateCurrency).toHaveBeenCalledWith('gs-1', { coins: 50 });
      });

      it('should handle currency update errors', async () => {
        gameStatisticsService.updateCurrency.mockRejectedValue(new Error('Invalid currency values'));

        const res = await request(app)
          .put('/gameStatistics/gs-1/currency')
          .send({ coins: -10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid currency values');
      });
    });

    describe('POST /gameStatistics/:id/currency/increment', () => {
      it('should increment currency', async () => {
        const incrementedCurrency = { id: 'cur-1', coins: 110 };
        gameStatisticsService.incrementCurrency.mockResolvedValue(incrementedCurrency);

        const res = await request(app)
          .post('/gameStatistics/gs-1/currency/increment')
          .send({ coins: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(incrementedCurrency);
        expect(gameStatisticsService.incrementCurrency).toHaveBeenCalledWith('gs-1', { coins: 10 });
      });
    });
  });

  describe('Asset Operations', () => {
    describe('POST /gameStatistics/:id/assets', () => {
      it('should add an asset', async () => {
        const assetData = {
          buildCost: 100,
          destroyCost: 50,
          energy: 20,
          xLocation: 1,
          yLocation: 2,
          xSize: 1,
          ySize: 1,
          type: 'Windmolen'
        };
        const mockResponse = {
          asset: { id: 'a-1', ...assetData },
          newlyEarnedAchievements: []
        };
        gameStatisticsService.addAsset.mockResolvedValue(mockResponse);

        const res = await request(app)
          .post('/gameStatistics/gs-1/assets')
          .send(assetData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockResponse);
        expect(gameStatisticsService.addAsset).toHaveBeenCalledWith('gs-1', assetData);
      });

      it('should handle asset creation errors', async () => {
        gameStatisticsService.addAsset.mockRejectedValue(new Error('Invalid asset data'));

        const res = await request(app)
          .post('/gameStatistics/gs-1/assets')
          .send({ invalid: 'data' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid asset data');
      });
    });

    describe('DELETE /gameStatistics/assets/:assetId', () => {
      it('should remove an asset', async () => {
        const mockResponse = {
          asset: { id: 'a-1' },
          newlyEarnedAchievements: []
        };
        gameStatisticsService.removeAsset.mockResolvedValue(mockResponse);

        const res = await request(app).delete('/gameStatistics/assets/a-1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockResponse);
        expect(gameStatisticsService.removeAsset).toHaveBeenCalledWith('a-1');
      });
    });
  });

  describe('Checkpoint Operations', () => {
    describe('POST /gameStatistics/:id/checkpoints', () => {
      it('should record a checkpoint', async () => {
        const mockCheckpoint = { id: 'cp-1' };
        gameStatisticsService.recordCheckpoint.mockResolvedValue(mockCheckpoint);

        const res = await request(app)
          .post('/gameStatistics/gs-1/checkpoints');

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockCheckpoint);
        expect(gameStatisticsService.recordCheckpoint).toHaveBeenCalledWith('gs-1');
      });

      it('should handle checkpoint creation errors', async () => {
        gameStatisticsService.recordCheckpoint.mockRejectedValue(new Error('Cannot create checkpoint'));

        const res = await request(app)
          .post('/gameStatistics/gs-1/checkpoints');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Cannot create checkpoint');
      });
    });

    describe('GET /gameStatistics/:id/checkpoints', () => {
      it('should get all checkpoints for game statistics', async () => {
        const mockCheckpoints = [{ id: 'cp-1' }, { id: 'cp-2' }];
        gameStatisticsService.findAllCheckpointsByGameStatisticsId.mockResolvedValue(mockCheckpoints);

        const res = await request(app).get('/gameStatistics/gs-1/checkpoints');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockCheckpoints);
        expect(gameStatisticsService.findAllCheckpointsByGameStatisticsId).toHaveBeenCalledWith('gs-1');
      });
    });

    describe('DELETE /gameStatistics/checkpoints/:checkpointId', () => {
      it('should remove a checkpoint', async () => {
        gameStatisticsService.removeCheckpoint.mockResolvedValue();

        const res = await request(app).delete('/gameStatistics/checkpoints/cp-1');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Checkpoint removed');
        expect(gameStatisticsService.removeCheckpoint).toHaveBeenCalledWith('cp-1');
      });
    });

    describe('PUT /gameStatistics/refactor/:checkpointId', () => {
      it('should refactor game statistics from checkpoint', async () => {
        const mockGameStatistics = { id: 'gs-1', restored: true };
        gameStatisticsService.refactorGameStatistics.mockResolvedValue(mockGameStatistics);

        const res = await request(app).put('/gameStatistics/refactor/cp-1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockGameStatistics);
        expect(gameStatisticsService.refactorGameStatistics).toHaveBeenCalledWith('cp-1');
      });
    });
  });

  describe('Game Building Operations', () => {
    describe('PUT /gameStatistics/buildings/:gameBuildingId/upgrade', () => {
      it('should upgrade a game building', async () => {
        const mockResponse = {
          gameBuilding: { id: 'gb-1', level: 2 },
          newlyEarnedAchievements: []
        };
        gameStatisticsService.upgradeGameBuilding.mockResolvedValue(mockResponse);

        const res = await request(app)
          .put('/gameStatistics/buildings/gb-1/upgrade')
          .send({ nextLevel: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockResponse);
        expect(gameStatisticsService.upgradeGameBuilding).toHaveBeenCalledWith('gb-1', { nextLevel: 2 });
      });

      it('should handle building upgrade errors', async () => {
        gameStatisticsService.upgradeGameBuilding.mockRejectedValue(new Error('Building not found'));

        const res = await request(app)
          .put('/gameStatistics/buildings/invalid/upgrade')
          .send({ nextLevel: 2 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Building not found');
      });
    });

    describe('GET /gameStatistics/gameBuildings/getAllGameBuildingsByGroupId/:groupId', () => {
      it('should get all game buildings by group ID', async () => {
        const mockBuildings = [{ id: 'gb-1' }, { id: 'gb-2' }];
        gameStatisticsService.getAllGameBuildingsByGroupId.mockResolvedValue(mockBuildings);

        const res = await request(app)
          .get('/gameStatistics/gameBuildings/getAllGameBuildingsByGroupId/group-1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockBuildings);
        expect(gameStatisticsService.getAllGameBuildingsByGroupId).toHaveBeenCalledWith('group-1');
      });
    });

    describe('PUT /gameStatistics/buildings/:gameBuildingId/green', () => {
      it('should toggle building runs on green', async () => {
        const mockBuilding = { id: 'gb-1', runsOnGreen: true };
        gameStatisticsService.toggleGameBuildingRunsOnGreen.mockResolvedValue(mockBuilding);

        const res = await request(app)
          .put('/gameStatistics/buildings/gb-1/green');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockBuilding);
        expect(gameStatisticsService.toggleGameBuildingRunsOnGreen).toHaveBeenCalledWith('gb-1');
      });
    });

    describe('POST /gameStatistics/gameBuildings/:gameStatisticsId', () => {
      it('should create game buildings', async () => {
        const mockBuildings = [{ id: 'gb-1' }, { id: 'gb-2' }];
        gameStatisticsService.createGameBuildings.mockResolvedValue(mockBuildings);

        const res = await request(app)
          .post('/gameStatistics/gameBuildings/gs-1');

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockBuildings);
        expect(gameStatisticsService.createGameBuildings).toHaveBeenCalledWith('gs-1');
      });
    });
  });

  describe('Achievement Operations', () => {
    describe('POST /gameStatistics/achievements/add/:gameStatisticsId/:title', () => {
      it('should add achievement to game statistics', async () => {
        const mockGameStatistics = { id: 'gs-1', achievements: [{ title: 'Test Achievement' }] };
        gameStatisticsService.addAchievementToGameStatistics.mockResolvedValue(mockGameStatistics);

        const res = await request(app)
          .post('/gameStatistics/achievements/add/gs-1/Test Achievement');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockGameStatistics);
        expect(gameStatisticsService.addAchievementToGameStatistics).toHaveBeenCalledWith('gs-1', 'Test Achievement');
      });

      it('should handle achievement addition errors', async () => {
        gameStatisticsService.addAchievementToGameStatistics.mockRejectedValue(new Error('Achievement not found'));

        const res = await request(app)
          .post('/gameStatistics/achievements/add/gs-1/Invalid Achievement');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Achievement not found');
      });
    });

    describe('GET /gameStatistics/:gameStatisticsId/achievements', () => {
      it('should get game statistics achievements', async () => {
        const mockAchievements = [{ id: 'ach-1', title: 'First Win' }];
        gameStatisticsService.getGameStatisticsAchievements.mockResolvedValue(mockAchievements);

        const res = await request(app)
          .get('/gameStatistics/gs-1/achievements');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockAchievements);
        expect(gameStatisticsService.getGameStatisticsAchievements).toHaveBeenCalledWith('gs-1');
      });
    });

    describe('GET /gameStatistics/:gameStatisticsId/achievements/check/:title', () => {
      it('should check if achievement has been achieved', async () => {
        const mockGameStatistics = { id: 'gs-1' };
        gameStatisticsService.getById.mockResolvedValue(mockGameStatistics);
        gameStatisticsService.hasAchievementBeenAchieved.mockResolvedValue(true);

        const res = await request(app)
          .get('/gameStatistics/gs-1/achievements/check/Test Achievement');

        expect(res.statusCode).toBe(200);
        expect(res.body.achieved).toBe(true);
        expect(gameStatisticsService.getById).toHaveBeenCalledWith('gs-1');
        expect(gameStatisticsService.hasAchievementBeenAchieved).toHaveBeenCalledWith(mockGameStatistics, 'Test Achievement');
      });

      it('should return 404 if game statistics not found', async () => {
        gameStatisticsService.getById.mockResolvedValue(null);

        const res = await request(app)
          .get('/gameStatistics/nonexistent/achievements/check/Test Achievement');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('GameStatistics not found');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors with custom status codes', async () => {
      const customError = new Error('Custom error');
      customError.statusCode = 418;
      gameStatisticsService.create.mockRejectedValue(customError);

      const res = await request(app)
        .post('/gameStatistics')
        .send({ groupId: 'test' });

      expect(res.statusCode).toBe(418);
      expect(res.body.error).toBe('Custom error');
    });

    it('should handle unexpected errors gracefully', async () => {
      gameStatisticsService.getAllGameStatistics.mockRejectedValue(new Error('Unexpected error'));

      const res = await request(app).get('/gameStatistics');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Unexpected error');
    });
  });
});