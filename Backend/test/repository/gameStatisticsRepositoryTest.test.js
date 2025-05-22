const GameStatisticsRepository = require('../../repository/gameStatisticsRepository');
const Currency       = require('../../model/currency');
const Building       = require('../../model/building');
const Asset          = require('../../model/asset');
const Checkpoint     = require('../../model/checkpoint');
const GameStatistics = require('../../model/gameStatistics');
const Level          = require('../../model/level');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    gameStatistics: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    },
    currency: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    building: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    asset: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    checkpoint: {
      create: jest.fn(),
      delete: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('GameStatisticsRepository', () => {
  let repo;
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = GameStatisticsRepository;
    prisma = repo.prisma;
  });

  describe('create()', () => {
    it('should create GameStatistics with given groupId and currency', async () => {
      const currency = new Currency({ greenEnergy: 1, greyEnergy: 2, coins: 3 });
      const prismaResult = {
        id: 123,
        groupId: 'group1',
        currency: {
          id: 456,
          greenEnergy: 1,
          greyEnergy: 2,
          coins: 3,
        },
      };
      prisma.gameStatistics.create.mockResolvedValue(prismaResult);

      const result = await repo.create({ groupId: 'group1', currency });
      expect(currency).toBeInstanceOf(Currency);
      expect(prisma.gameStatistics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          group: { connect: { id: 'group1' } },
          currency: expect.any(Object)
        }),
        include: { currency: true }
      });
      expect(result).toBeInstanceOf(GameStatistics);
      expect(result.id).toBe(prismaResult.id);
      expect(result.currency.greenEnergy).toBe(1);
    });

    it('should throw if currency.validate() fails', () => {
      const badCurrency = new Currency({ greenEnergy: 'invalid' }, false);
      expect(() => repo.create({ groupId: 'group1', currency: badCurrency })).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('should return GameStatistics when found', async () => {
      const prismaData = {
        id: 1,
        currency: { id: 2, greenEnergy: 0, greyEnergy: 0, coins: 100 },
        buildings: [],
        assets: [],
        checkpoints: [],
        groupId: 'group1'
      };
      prisma.gameStatistics.findUnique.mockResolvedValue(prismaData);

      const result = await repo.findById(1);
      expect(prisma.gameStatistics.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
      expect(result).toBeInstanceOf(GameStatistics);
      expect(result.id).toBe(1);
    });

    it('should return null if not found', async () => {
      prisma.gameStatistics.findUnique.mockResolvedValue(null);
      const result = await repo.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByGroupId()', () => {
    it('should find by groupId and return GameStatistics', async () => {
      const prismaData = { id: 1, currency: { id: 2 }, buildings: [], assets: [], checkpoints: [], groupId: 'group1' };
      prisma.gameStatistics.findFirst.mockResolvedValue(prismaData);

      const result = await repo.findByGroupId('group1');
      expect(prisma.gameStatistics.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { groupId: 'group1' }
      }));
      expect(result).toBeInstanceOf(GameStatistics);
    });

    it('should return null if not found', async () => {
      prisma.gameStatistics.findFirst.mockResolvedValue(null);
      const result = await repo.findByGroupId('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findCurrencyById()', () => {
    it('should return Currency when found', async () => {
      const prismaCurrency = { id: 10, greenEnergy: 1, greyEnergy: 2, coins: 3 };
      prisma.currency.findUnique.mockResolvedValue(prismaCurrency);
      const result = await repo.findCurrencyById(10);
      expect(prisma.currency.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        include: { gameStatistics: true }
      });
      expect(result).toBeInstanceOf(Currency);
      expect(result.id).toBe(10);
    });

    it('should return null when not found', async () => {
      prisma.currency.findUnique.mockResolvedValue(null);
      const result = await repo.findCurrencyById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateCurrency()', () => {
    it('should update currency with valid values', async () => {
      const updatedData = { id: 1, greenEnergy: 10, greyEnergy: 20, coins: 30 };
      prisma.currency.update.mockResolvedValue(updatedData);

      const result = await repo.updateCurrency(1, { greenEnergy: 10, greyEnergy: 20, coins: 30 });
      expect(prisma.currency.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { greenEnergy: 10, greyEnergy: 20, coins: 30 }
      });
      expect(result).toBeInstanceOf(Currency);
      expect(result.greenEnergy).toBe(10);
    });

    it('should throw on invalid update values', async () => {
      await expect(repo.updateCurrency(1, { greenEnergy: 'no', greyEnergy: 20, coins: 30 })).rejects.toThrow('Invalid currency values');
    });
  });

  describe('incrementCurrency()', () => {
    it('should increment currency fields', async () => {
      const updated = { id: 1, greenEnergy: 15, greyEnergy: 25, coins: 35 };
      prisma.currency.update.mockResolvedValue(updated);

      const result = await repo.incrementCurrency(1, { greenEnergy: 5, greyEnergy: 5, coins: 5 });
      expect(prisma.currency.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          greenEnergy: { increment: 5 },
          greyEnergy: { increment: 5 },
          coins: { increment: 5 }
        }
      });
      expect(result).toBeInstanceOf(Currency);
      expect(result.greenEnergy).toBe(15);
    });
  });

  describe('addBuilding()', () => {
    it('should create building and return instance', async () => {
      const level = new Level({ level: 1, upgradeCost: 100, energyCost: 10 });
      const building = new Building({
        xLocation: 1,
        yLocation: 2,
        xSize: 3,
        ySize: 4,
        level
      });

      const createdPrisma = {
        id: 10,
        xLocation: 1,
        yLocation: 2,
        xSize: 3,
        ySize: 4,
        level: {
          id: 1,
          level: 1,
          upgradeCost: 100,
          energyCost: 10
        }
      };

      prisma.building.create.mockResolvedValue(createdPrisma);

      const result = await repo.addBuilding(5, building);
      expect(prisma.building.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          xLocation: 1,
          yLocation: 2,
          xSize: 3,
          ySize: 4,
          level: { connect: { id: level.id } },
          gameStatistics: { connect: { id: 5 } }
        }),
        include: { level: true }
      }));
      expect(result).toBeInstanceOf(Building);
      expect(result.xLocation).toBe(1);
    });

    it('should throw if building validation fails', () => {
      const invalidBuilding = new Building({ xLocation: 'bad', yLocation: 2, xSize: 3, ySize: 4, level: null }, false);
      expect(() => repo.addBuilding(5, invalidBuilding)).rejects.toThrow();
    });
  });

  describe('updateBuilding()', () => {
    it('should update building with provided fields', async () => {
      const updatedPrisma = {
        id: 7,
        xLocation: 10,
        yLocation: 20,
        xSize: 30,
        ySize: 40,
        level: { id: 1, level: 2, upgradeCost: 100, energyCost: 10 }
      };
      prisma.building.update.mockResolvedValue(updatedPrisma);

      const result = await repo.updateBuilding(7, { xLocation: 10, yLocation: 20 });
      expect(prisma.building.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 7 },
        data: { xLocation: 10, yLocation: 20 },
        include: { level: true }
      }));
      expect(result).toBeInstanceOf(Building);
      expect(result.xLocation).toBe(10);
    });
  });

  describe('removeBuilding()', () => {
    it('should delete building by id', async () => {
      prisma.building.delete.mockResolvedValue({});
      await repo.removeBuilding(8);
      expect(prisma.building.delete).toHaveBeenCalledWith({ where: { id: 8 } });
    });
  });

  describe('addAsset()', () => {
    it('should create asset and return instance', async () => {
      const asset = new Asset({
        buildCost: 10,
        destroyCost: 5,
        energy: 20,
        xLocation: 1,
        yLocation: 2,
        xSize: 3,
        ySize: 4,
        type: 'factory'
      });
      const created = { id: 15, ...asset };
      prisma.asset.create.mockResolvedValue(created);

      const result = await repo.addAsset(3, asset);
      expect(prisma.asset.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          buildCost: 10,
          destroyCost: 5,
          energy: 20,
          xLocation: 1,
          yLocation: 2,
          xSize: 3,
          ySize: 4,
          type: 'factory',
          gameStatistics: { connect: { id: 3 } }
        })
      }));
      expect(result).toBeInstanceOf(Asset);
      expect(result.type).toBe('factory');
    });

    it('should throw if asset validation fails', () => {
      const badAsset = new Asset({ buildCost: 'no', destroyCost: 5, energy: 10, xLocation: 1, yLocation: 2, xSize: 3, ySize: 4, type: 'factory' }, false);
      expect(() => repo.addAsset(3, badAsset)).rejects.toThrow();
    });
  });

  describe('removeAsset()', () => {
    it('should delete asset by id', async () => {
      prisma.asset.delete.mockResolvedValue({});
      await repo.removeAsset(12);
      expect(prisma.asset.delete).toHaveBeenCalledWith({ where: { id: 12 } });
    });
  });

  describe('recordCheckpoint()', () => {
    it('should create checkpoint and return instance', async () => {
      const cp = new Checkpoint({
        currency: new Currency({ greenEnergy: 1, greyEnergy: 2, coins: 3 }),
        buildings: [],
        assets: []
      });
      const prismaCP = {
        id: 99,
        currency: { id: 1, greenEnergy: 1, greyEnergy: 2, coins: 3 },
        buildings: [],
        assets: []
      };
      prisma.checkpoint.create.mockResolvedValue(prismaCP);

      const result = await repo.recordCheckpoint(7, cp);
      expect(prisma.checkpoint.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Checkpoint);
      expect(result.id).toBe(99);
    });

    it('should throw if checkpoint validation fails', () => {
      const badCp = new Checkpoint({ currency: { greenEnergy: null } }, false);
      expect(() => repo.recordCheckpoint(7, badCp)).rejects.toThrow();
    });
  });

  describe('removeCheckpoint()', () => {
    it('should delete checkpoint by id', async () => {
      prisma.checkpoint.delete.mockResolvedValue({});
      await repo.removeCheckpoint(5);
      expect(prisma.checkpoint.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });
  });

  describe('delete()', () => {
    it('should delete gameStatistics by id', async () => {
      prisma.gameStatistics.delete.mockResolvedValue({});
      await repo.delete(2);
      expect(prisma.gameStatistics.delete).toHaveBeenCalledWith({ where: { id: 2 } });
    });
  });
});
