const GameStatisticsRepository = require("../../repository/gameStatisticsRepository");
const Currency = require("../../model/currency");
const GameBuildings = require("../../model/gameBuildings");
const Checkpoint = require("../../model/checkpoint");
const Asset = require("../../model/asset");
const Achievement = require("../../model/achievement");
const GameStatistics = require("../../model/gameStatistics");
const Building = require("../../model/building");
const BuildingLevel = require("../../model/buildingLevel");

// Mock Prisma Client
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    gameStatistics: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    currency: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    asset: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    checkpoint: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    buildingLevel: {
      findUnique: jest.fn(),
    },
    gameBuildings: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    building: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    achievement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      connect: jest.fn(),
    },
  })),
}));

describe("GameStatisticsRepository", () => {
  let mockPrisma;
  let repo;

  // Create valid mock objects
  const mockBuilding = new Building({ id: "b-1", name: "House" }, false);
  const mockBuildingLevel = new BuildingLevel(
    { 
      id: "bl-1", 
      level: 1, 
      energyCost: 100, 
      upgradeCost: 50, 
      scoreDeduction: 5,
      buildingId: "b-1"
    }, 
    false
  );
  
  const mockGameBuilding = new GameBuildings(
    {
      id: "gb-1",
      gameStatisticsId: "gs-1",
      checkpointId: null,
      building: mockBuilding,
      buildingLevel: mockBuildingLevel,
      runsOnGreen: true,
    },
    false
  );

  const mockCurrency = new Currency(
    { 
      id: "cur-1", 
      greenEnergy: 100, 
      greyEnergy: 50, 
      coins: 200, 
      score: 1000,
      gameStatisticsId: "gs-1"
    },
    false
  );

  const mockAsset = new Asset(
    {
      id: "a-1",
      buildCost: 100,
      destroyCost: 50,
      energy: 10,
      xLocation: 0,
      yLocation: 0,
      xSize: 1,
      ySize: 1,
      type: "Windmolen",
      gameStatisticsId: "gs-1"
    },
    false
  );

  const mockAchievement = new Achievement(
    { 
      id: "ach-1", 
      title: "First Win", 
      description: "Win your first game",
      reward: 100,
      score: 50
    },
    false
  );

  beforeEach(() => {
    // Use the singleton instance directly, not as constructor
    repo = GameStatisticsRepository;
    mockPrisma = repo.prisma;
    jest.clearAllMocks();
  });

  describe("Game Statistics Operations", () => {
    describe("create", () => {
      it("should create GameStatistics with given groupId and currency", async () => {
        const mockPrismaResult = {
          id: "gs-1",
          groupId: "group-1",
          currency: {
            id: "cur-1",
            greenEnergy: 100,
            greyEnergy: 50,
            coins: 200,
            score: 1000,
            gameStatisticsId: "gs-1"
          },
          gameBuildings: [],
          assets: [],
          checkpoints: [],
          achievements: []
        };

        mockPrisma.gameStatistics.create.mockResolvedValue(mockPrismaResult);

        const result = await repo.create({
          groupId: "group-1",
          currency: mockCurrency
        });

        // expect(mockPrisma.gameStatistics.create).toHaveBeenCalledWith({
        //   data: {
        //     group: { connect: { id: "group-1" } },
        //     currency: {
        //       create: {
        //         greenEnergy: 100,
        //         greyEnergy: 50,
        //         coins: 200,
        //         score: 1000,
        //       },
        //     },
        //   },
        //   include: { currency: true },
        // });
        expect(result).toBeInstanceOf(GameStatistics);
      });

      it("should throw if currency.validate() fails", async () => {
        const invalidCurrency = new Currency({ greenEnergy: "invalid" }, false);
        
        await expect(
          repo.create({
            groupId: "group-1",
            currency: invalidCurrency
          })
        ).rejects.toThrow();
      });
    });

    describe("findById", () => {
      it("should return GameStatistics when found", async () => {
        const mockPrismaResult = {
          id: "gs-1",
          groupId: "group-1",
          currency: mockCurrency,
          gameBuildings: [mockGameBuilding],
          assets: [mockAsset],
          checkpoints: [],
          achievements: []
        };

        mockPrisma.gameStatistics.findUnique.mockResolvedValue(mockPrismaResult);

        const result = await repo.findById("gs-1");

        expect(result).toBeInstanceOf(GameStatistics);
      });

      it("should return null if not found", async () => {
        mockPrisma.gameStatistics.findUnique.mockResolvedValue(null);

        const result = await repo.findById("nonexistent");

        expect(result).toBeNull();
      });

      it("should handle options parameter correctly", async () => {
        const mockPrismaResult = {
          id: "gs-1",
          groupId: "group-1",
          currency: mockCurrency,
          gameBuildings: [],
          assets: [],
          checkpoints: [],
          achievements: []
        };

        mockPrisma.gameStatistics.findUnique.mockResolvedValue(mockPrismaResult);

        await repo.findById("gs-1", { includeCurrency: false });

        expect(mockPrisma.gameStatistics.findUnique).toHaveBeenCalledWith({
          where: { id: "gs-1" },
          include: expect.objectContaining({
            currency: false
          })
        });
      });
    });

    describe("findByGroupId", () => {
      it("should find by groupId and return GameStatistics", async () => {
        const mockPrismaResult = {
          id: "gs-1",
          groupId: "group-1",
          currency: mockCurrency,
          gameBuildings: [mockGameBuilding],
          assets: [mockAsset],
          checkpoints: [],
          achievements: []
        };

        mockPrisma.gameStatistics.findFirst.mockResolvedValue(mockPrismaResult);

        const result = await repo.findByGroupId("group-1");

        expect(result).toBeInstanceOf(GameStatistics);
      });

      it("should return null if not found", async () => {
        mockPrisma.gameStatistics.findFirst.mockResolvedValue(null);

        const result = await repo.findByGroupId("nonexistent");

        expect(result).toBeNull();
      });

      it("should handle options parameter correctly", async () => {
        const mockPrismaResult = {
          id: "gs-1",
          groupId: "group-1",
          currency: mockCurrency,
          gameBuildings: [],
          assets: [],
          checkpoints: [],
          achievements: []
        };

        mockPrisma.gameStatistics.findFirst.mockResolvedValue(mockPrismaResult);

        await repo.findByGroupId("group-1", { includeCheckpoints: true });

        expect(mockPrisma.gameStatistics.findFirst).toHaveBeenCalledWith({
          where: { groupId: "group-1" },
          include: expect.objectContaining({
            checkpoints: expect.any(Object)
          })
        });
      });
    });

    describe("getAllGameStatistics", () => {
      it("should return all game statistics", async () => {
        const mockPrismaResults = [
          {
            id: "gs-1",
            groupId: "group-1",
            currency: mockCurrency,
            gameBuildings: [],
            assets: [],
            checkpoints: [],
            achievements: []
          }
        ];

        mockPrisma.gameStatistics.findMany.mockResolvedValue(mockPrismaResults);

        const result = await repo.getAllGameStatistics();

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(GameStatistics);
      });
    });
  });

  describe("Currency Operations", () => {
    describe("findCurrencyById", () => {
      it("should return Currency when found", async () => {
        const mockPrismaResult = {
          id: "cur-1",
          greenEnergy: 100,
          greyEnergy: 50,
          coins: 200,
          score: 1000,
          gameStatisticsId: "gs-1",
          gameStatistics: { id: "gs-1" }
        };

        mockPrisma.currency.findUnique.mockResolvedValue(mockPrismaResult);

        const result = await repo.findCurrencyById("cur-1");

        expect(result).toBeInstanceOf(Currency);
      });

      it("should return null when not found", async () => {
        mockPrisma.currency.findUnique.mockResolvedValue(null);

        const result = await repo.findCurrencyById("nonexistent");

        expect(result).toBeNull();
      });
    });

    describe("updateCurrency", () => {
      it("should update currency with valid values", async () => {
        const mockUpdatedCurrency = {
          id: "cur-1",
          greenEnergy: 150,
          greyEnergy: 75,
          coins: 300,
          score: 1500
        };

        mockPrisma.currency.update.mockResolvedValue(mockUpdatedCurrency);

        const result = await repo.updateCurrency("cur-1", {
          greenEnergy: 150,
          greyEnergy: 75,
          coins: 300,
          score: 1500
        });

        expect(mockPrisma.currency.update).toHaveBeenCalledWith({
          where: { id: "cur-1" },
          data: { greenEnergy: 150, greyEnergy: 75, coins: 300, score: 1500 },
        });
        expect(result).toBeInstanceOf(Currency);
      });

      it("should throw on invalid update values", async () => {
        await expect(
          repo.updateCurrency("cur-1", {
            greenEnergy: "invalid",
            greyEnergy: 75,
            coins: 300,
            score: 1500
          })
        ).rejects.toThrow("Invalid currency values");
      });
    });

    describe("incrementCurrency", () => {
      it("should increment currency fields", async () => {
        const mockUpdatedCurrency = {
          id: "cur-1",
          greenEnergy: 105,
          greyEnergy: 55,
          coins: 205,
          score: 1000
        };

        mockPrisma.currency.update.mockResolvedValue(mockUpdatedCurrency);

        const result = await repo.incrementCurrency("cur-1", { greenEnergy: 5, greyEnergy: 5, coins: 5 });

        expect(mockPrisma.currency.update).toHaveBeenCalledWith({
          where: { id: "cur-1" },
          data: {
            greenEnergy: { increment: 5 },
            greyEnergy: { increment: 5 },
            coins: { increment: 5 },
            score: { increment: 0 },
          },
        });
        expect(result).toBeInstanceOf(Currency);
      });
    });

    describe("findCurrencyByGameStatisticsId", () => {
      it("should return Currency when found", async () => {
        const mockPrismaResult = {
          id: "cur-1",
          greenEnergy: 100,
          greyEnergy: 50,
          coins: 200,
          score: 1000,
          gameStatisticsId: "gs-1",
          gameStatistics: { id: "gs-1" }
        };

        mockPrisma.currency.findFirst.mockResolvedValue(mockPrismaResult);

        const result = await repo.findCurrencyByGameStatisticsId("gs-1");

        expect(result).toBeInstanceOf(Currency);
      });

      it("should return null when not found", async () => {
        mockPrisma.currency.findFirst.mockResolvedValue(null);

        const result = await repo.findCurrencyByGameStatisticsId("nonexistent");

        expect(result).toBeNull();
      });
    });
  });

  describe("Asset Operations", () => {
    describe("addAsset", () => {
      it("should create asset and return instance", async () => {
        const validAsset = new Asset({
          id: "a-1",
          buildCost: 100,
          destroyCost: 50,
          energy: 10,
          xLocation: 0,
          yLocation: 0,
          xSize: 1,
          ySize: 1,
          type: "Windmolen",
          gameStatisticsId: "gs-1"
        }, false);

        const mockCreatedAsset = {
          id: "a-1",
          buildCost: 100,
          destroyCost: 50,
          energy: 10,
          xLocation: 0,
          yLocation: 0,
          xSize: 1,
          ySize: 1,
          type: "Windmolen",
          gameStatisticsId: "gs-1"
        };

        mockPrisma.asset.create.mockResolvedValue(mockCreatedAsset);

        const result = await repo.addAsset("gs-1", validAsset);

        expect(result).toBeInstanceOf(Asset);
      });

      it("should throw if asset validation fails", async () => {
        const invalidAsset = new Asset({
          id: "a-1",
          buildCost: 100,
          destroyCost: 50,
          energy: 10,
          xLocation: 0,
          yLocation: 0,
          xSize: 1,
          ySize: 1,
          type: "invalid_type",
          gameStatisticsId: "gs-1"
        }, false);

        await expect(repo.addAsset("gs-1", invalidAsset)).rejects.toThrow();
      });
    });

    describe("removeAsset", () => {
      it("should delete asset by id", async () => {
        const mockDeletedAsset = { id: "a-1" };
        mockPrisma.asset.delete.mockResolvedValue(mockDeletedAsset);

        const result = await repo.removeAsset("a-1");

        expect(mockPrisma.asset.delete).toHaveBeenCalledWith({
          where: { id: "a-1" }
        });
        expect(result).toEqual(mockDeletedAsset);
      });
    });

    describe("findAllAssetsByGameStatisticsId", () => {
      it("should return all assets for a game statistics", async () => {
        const mockAssets = [
          {
            id: "a-1",
            buildCost: 100,
            destroyCost: 50,
            energy: 10,
            xLocation: 0,
            yLocation: 0,
            xSize: 1,
            ySize: 1,
            type: "Windmolen",
            gameStatisticsId: "gs-1",
            gameStatistics: { id: "gs-1" }
          }
        ];

        mockPrisma.asset.findMany.mockResolvedValue(mockAssets);

        const result = await repo.findAllAssetsByGameStatisticsId("gs-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Asset);
      });
    });
  });

  describe("Checkpoint Operations", () => {
    describe("recordCheckpoint", () => {
      it("should create checkpoint and return instance", async () => {
        const mockCheckpointResult = {
          id: "cp-1",
          gameStatisticsId: "gs-1",
          currency: {
            id: "cur-2",
            greenEnergy: 100,
            greyEnergy: 50,
            coins: 200,
            score: 1000
          },
          gameBuildings: [],
          assets: []
        };

        mockPrisma.checkpoint.create.mockResolvedValue(mockCheckpointResult);

        const result = await repo.recordCheckpoint(
          "gs-1",
          mockCurrency,
          [],
          [],
          []
        );

        expect(result).toBeInstanceOf(Checkpoint);
      });

      it("should throw if checkpoint validation fails", async () => {
        const invalidCurrency = new Currency({ greenEnergy: "invalid" }, false);

        await expect(
          repo.recordCheckpoint("gs-1", invalidCurrency, [], [])
        ).rejects.toThrow();
      });
    });

    describe("removeCheckpoint", () => {
      it("should delete checkpoint by id", async () => {
        mockPrisma.checkpoint.delete.mockResolvedValue({});
        await repo.removeCheckpoint("cp-1");
        expect(mockPrisma.checkpoint.delete).toHaveBeenCalledWith({ where: { id: "cp-1" } });
      });
    });

    describe("findCheckpointById", () => {
      it("should return checkpoint when found", async () => {
        const mockCheckpoint = {
          id: "cp-1",
          gameStatisticsId: "gs-1",
          currency: mockCurrency,
          gameBuildings: [],
          assets: []
        };

        mockPrisma.checkpoint.findUnique.mockResolvedValue(mockCheckpoint);

        const result = await repo.findCheckpointById("cp-1");

        expect(result).toBeInstanceOf(Checkpoint);
      });

      it("should throw if checkpoint not found", async () => {
        mockPrisma.checkpoint.findUnique.mockResolvedValue(null);

        await expect(repo.findCheckpointById("nonexistent")).rejects.toThrow("Checkpoint not found");
      });
    });

    describe("findAllCheckpointsByGameStatisticsId", () => {
      it("should return all checkpoints for a game statistics", async () => {
        const mockCheckpoints = [
          {
            id: "cp-1",
            gameStatisticsId: "gs-1",
            currency: mockCurrency,
            gameBuildings: [],
            assets: []
          }
        ];

        mockPrisma.checkpoint.findMany.mockResolvedValue(mockCheckpoints);

        const result = await repo.findAllCheckpointsByGameStatisticsId("gs-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Checkpoint);
      });
    });

    describe("refactorGameStatistics", () => {
      it("should refactor game statistics from checkpoint", async () => {
        const mockCheckpoint = new Checkpoint({
          gameStatisticsId: "gs-1",
          currency: mockCurrency,
          gameBuildings: [],
          assets: []
        }, false);

        const mockUpdatedGS = {
          id: "gs-1",
          groupId: "group-1",
          currency: mockCurrency,
          gameBuildings: [],
          assets: []
        };

        mockPrisma.gameBuildings.deleteMany.mockResolvedValue({});
        mockPrisma.asset.deleteMany.mockResolvedValue({});
        mockPrisma.gameStatistics.update.mockResolvedValue(mockUpdatedGS);

        const result = await repo.refactorGameStatistics({ checkpoint: mockCheckpoint });

        expect(result).toBeInstanceOf(GameStatistics);
      });
    });
  });

  describe("Building Level Operations", () => {
    describe("findBuildingLevelByBuildingIdAndLevel", () => {
      it("should return building level when found", async () => {
        const mockBuildingLevel = {
          id: "bl-1",
          level: 1,
          energyCost: 100,
          upgradeCost: 50,
          scoreDeduction: 5,
          buildingId: "b-1",
          building: mockBuilding
        };

        mockPrisma.buildingLevel.findUnique.mockResolvedValue(mockBuildingLevel);

        const result = await repo.findBuildingLevelByBuildingIdAndLevel("b-1", 1);

        expect(result).toBeInstanceOf(BuildingLevel);
      });

      it("should return null when not found", async () => {
        mockPrisma.buildingLevel.findUnique.mockResolvedValue(null);

        const result = await repo.findBuildingLevelByBuildingIdAndLevel("nonexistent", 1);

        expect(result).toBeNull();
      });
    });
  });

  describe("Game Buildings Operations", () => {
    describe("findGameBuildingById", () => {
      it("should return game building when found", async () => {
        const mockGameBuildingData = {
          id: "gb-1",
          gameStatisticsId: "gs-1",
          checkpointId: null,
          building: mockBuilding,
          buildingLevel: mockBuildingLevel,
          runsOnGreen: true,
          gameStatistics: { id: "gs-1" }
        };

        mockPrisma.gameBuildings.findUnique.mockResolvedValue(mockGameBuildingData);

        const result = await repo.findGameBuildingById("gb-1");

        expect(result).toBeInstanceOf(GameBuildings);
      });

      it("should return null when not found", async () => {
        mockPrisma.gameBuildings.findUnique.mockResolvedValue(null);

        const result = await repo.findGameBuildingById("nonexistent");

        expect(result).toBeNull();
      });
    });

    describe("findAllGameBuildingsByGameStatisticsId", () => {
      it("should return all game buildings for a game statistics", async () => {
        const mockGameBuildings = [
          {
            id: "gb-1",
            gameStatisticsId: "gs-1",
            building: mockBuilding,
            buildingLevel: mockBuildingLevel,
            runsOnGreen: true,
            gameStatistics: { id: "gs-1" }
          }
        ];

        mockPrisma.gameBuildings.findMany.mockResolvedValue(mockGameBuildings);

        const result = await repo.findAllGameBuildingsByGameStatisticsId("gs-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(GameBuildings);
      });
    });

    describe("upgradeGameBuildingLevel", () => {
      it("should upgrade game building level", async () => {
        const mockUpdatedGameBuilding = {
          id: "gb-1",
          gameStatisticsId: "gs-1",
          building: mockBuilding,
          buildingLevel: mockBuildingLevel,
          runsOnGreen: true,
          gameStatistics: { id: "gs-1" }
        };

        mockPrisma.gameBuildings.update.mockResolvedValue(mockUpdatedGameBuilding);

        const result = await repo.upgradeGameBuildingLevel("gb-1", "bl-2");

        expect(result).toBeInstanceOf(GameBuildings);
      });
    });

    describe("toggleGameBuildingRunsOnGreen", () => {
      it("should toggle runsOnGreen flag", async () => {
        const mockExisting = { runsOnGreen: true };
        const mockUpdated = {
          id: "gb-1",
          gameStatisticsId: "gs-1",
          building: mockBuilding,
          buildingLevel: mockBuildingLevel,
          runsOnGreen: false,
          gameStatistics: { id: "gs-1" }
        };

        mockPrisma.gameBuildings.findUnique.mockResolvedValue(mockExisting);
        mockPrisma.gameBuildings.update.mockResolvedValue(mockUpdated);

        const result = await repo.toggleGameBuildingRunsOnGreen("gb-1");

        expect(result).toBeInstanceOf(GameBuildings);
        expect(result.runsOnGreen).toBe(false);
      });

      it("should throw if game building not found", async () => {
        mockPrisma.gameBuildings.findUnique.mockResolvedValue(null);

        await expect(repo.toggleGameBuildingRunsOnGreen("nonexistent")).rejects.toThrow("GameBuilding not found");
      });
    });
  });

  describe("Achievement Operations", () => {
    describe("findAchievementByTitle", () => {
      it("should return achievement when found", async () => {
        const mockAchievement = {
          id: "ach-1",
          title: "First Win",
          description: "Win your first game",
          reward: 100,
          score: 50
        };

        mockPrisma.achievement.findUnique.mockResolvedValue(mockAchievement);

        const result = await repo.findAchievementByTitle("First Win");

        expect(result).toEqual(mockAchievement);
      });

      it("should return null when not found", async () => {
        mockPrisma.achievement.findUnique.mockResolvedValue(null);

        const result = await repo.findAchievementByTitle("Nonexistent");

        expect(result).toBeNull();
      });
    });

    describe("addAchievementToGameStatistics", () => {
      it("should add achievement and update currency", async () => {
        const mockUpdatedGS = {
          id: "gs-1",
          groupId: "group-1",
          currency: {
            id: "cur-1",
            greenEnergy: 100,
            greyEnergy: 50,
            coins: 300,
            score: 1050
          },
          achievements: [mockAchievement]
        };

        mockPrisma.gameStatistics.update.mockResolvedValue(mockUpdatedGS);

        const result = await repo.addAchievementToGameStatistics("gs-1", mockAchievement);

        expect(mockPrisma.gameStatistics.update).toHaveBeenCalledWith({
          where: { id: "gs-1" },
          data: {
            currency: {
              update: {
                coins: { increment: 100 },
              },
            },
            achievements: {
              connect: { id: "ach-1" },
            },
          },
          include: {
            currency: true,
            achievements: true,
          },
        });
        expect(result.currency.coins).toBe(300);
      });
    });

    describe("getGameStatisticsAchievements", () => {
      it("should return achievements for game statistics", async () => {
        const mockGSWithAchievements = {
          id: "gs-1",
          achievements: [
            {
              id: "ach-1",
              title: "First Win",
              description: "Win your first game",
              reward: 100,
              score: 50
            }
          ]
        };

        mockPrisma.gameStatistics.findUnique.mockResolvedValue(mockGSWithAchievements);

        const result = await repo.getGameStatisticsAchievements("gs-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Achievement);
      });

      it("should return null if game statistics not found", async () => {
        mockPrisma.gameStatistics.findUnique.mockResolvedValue(null);

        const result = await repo.getGameStatisticsAchievements("nonexistent");

        expect(result).toBeNull();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors", async () => {
      mockPrisma.gameStatistics.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(repo.findById("gs-1")).rejects.toThrow("Database connection failed");
    });

    it("should handle invalid parameters gracefully", async () => {
      await expect(repo.updateCurrency("cur-1", {
        greenEnergy: "not-a-number",
        greyEnergy: 50,
        coins: 100,
        score: 200
      })).rejects.toThrow("Invalid currency values");
    });
  });
});