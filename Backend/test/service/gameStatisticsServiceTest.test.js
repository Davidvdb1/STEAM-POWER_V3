const gameStatisticsService = require("../../service/gameStatisticsService");
const gameStatisticsRepository = require("../../repository/gameStatisticsRepository");
const Currency = require("../../model/currency");
const Asset = require("../../model/asset");
const Nature = require("../../model/nature");
const GameStatistics = require("../../model/gameStatistics");
const GameBuildings = require("../../model/gameBuildings");
const Building = require("../../model/building");
const BuildingLevel = require("../../model/buildingLevel");
const Achievement = require("../../model/achievement");
const Checkpoint = require("../../model/checkpoint");

jest.mock("../../repository/gameStatisticsRepository");

describe("GameStatisticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Game Statistics Operations", () => {
    describe("create", () => {
      it("should create GameStatistics with default Currency values", async () => {
        const mockCreatedGS = new GameStatistics(
          {
            id: "gs-1",
            groupId: "group-1",
            currency: {
              greenEnergy: Currency.DEFAULT_GREEN_ENERGY,
              greyEnergy: Currency.DEFAULT_GREY_ENERGY,
              coins: Currency.STARTING_COINS,
              score: Currency.STARTING_SCORE,
            },
          },
          false
        );

        gameStatisticsRepository.create.mockResolvedValue(mockCreatedGS);
        // Mock the additional calls made by the new create function
        gameStatisticsRepository.addAsset.mockResolvedValue();
        gameStatisticsRepository.updateCurrency.mockResolvedValue();
        gameStatisticsRepository.findById.mockResolvedValue(mockCreatedGS);

        const result = await gameStatisticsService.create({
          groupId: "group-1",
        });

        expect(gameStatisticsRepository.create).toHaveBeenCalledWith({
          groupId: "group-1",
          currency: expect.any(Currency),
        });
        // Expect addAsset to be called 7 times (for 7 Kerncentrales)
        expect(gameStatisticsRepository.addAsset).toHaveBeenCalledTimes(7);
        expect(result).toBe(mockCreatedGS);
      });

      it("should create GameStatistics with custom Currency values", async () => {
        const mockCreatedGS = new GameStatistics(
          {
            id: "gs-1",
            groupId: "group-1",
            currency: {
              greenEnergy: 10,
              greyEnergy: 20,
              coins: 30,
              score: 40,
            },
          },
          false
        );

        gameStatisticsRepository.create.mockResolvedValue(mockCreatedGS);
        // Mock the additional calls made by the new create function
        gameStatisticsRepository.addAsset.mockResolvedValue();
        gameStatisticsRepository.updateCurrency.mockResolvedValue();
        gameStatisticsRepository.findById.mockResolvedValue(mockCreatedGS);

        const result = await gameStatisticsService.create({
          groupId: "group-1",
          greenEnergy: 10,
          greyEnergy: 20,
          coins: 30,
          score: 40,
        });

        const arg = gameStatisticsRepository.create.mock.calls[0][0];
        expect(arg.groupId).toBe("group-1");
        expect(arg.currency).toBeInstanceOf(Currency);
        expect(arg.currency.greenEnergy).toBe(10);
        expect(arg.currency.greyEnergy).toBe(20);
        expect(arg.currency.coins).toBe(30);
        expect(arg.currency.score).toBe(40);
        expect(result).toBe(mockCreatedGS);
      });
    });

    describe("getAllGameStatistics", () => {
      it("should return all game statistics", async () => {
        const mockGSArray = [
          new GameStatistics({ id: "gs-1", groupId: "group-1" }, false),
          new GameStatistics({ id: "gs-2", groupId: "group-2" }, false),
        ];

        gameStatisticsRepository.getAllGameStatistics.mockResolvedValue(
          mockGSArray
        );

        const result = await gameStatisticsService.getAllGameStatistics();

        expect(
          gameStatisticsRepository.getAllGameStatistics
        ).toHaveBeenCalled();
        expect(result).toBe(mockGSArray);
      });
    });

    describe("getById", () => {
      it("should call repository findById with correct options object", async () => {
        const mockGS = new GameStatistics({ id: "gs-1" }, false);
        gameStatisticsRepository.findById.mockResolvedValue(mockGS);

        const result = await gameStatisticsService.getById(
          "gs-1",
          true,
          false,
          true,
          false,
          true
        );

        expect(gameStatisticsRepository.findById).toHaveBeenCalledWith("gs-1", {
          includeCurrency: true,
          includeGameBuildings: false,
          includeAssets: true,
          includeCheckpoints: false,
          includeGroup: true,
        });
        expect(result).toBe(mockGS);
      });

      it("should use default parameters", async () => {
        const mockGS = new GameStatistics({ id: "gs-1" }, false);
        gameStatisticsRepository.findById.mockResolvedValue(mockGS);

        await gameStatisticsService.getById("gs-1");

        expect(gameStatisticsRepository.findById).toHaveBeenCalledWith("gs-1", {
          includeCurrency: true,
          includeGameBuildings: true,
          includeAssets: true,
          includeCheckpoints: true,
          includeGroup: false,
        });
      });
    });

    describe("getByGroupId", () => {
      it("should call repository findByGroupId with correct options object", async () => {
        const mockGS = new GameStatistics(
          { id: "gs-1", groupId: "group-1" },
          false
        );
        gameStatisticsRepository.findByGroupId.mockResolvedValue(mockGS);

        const result = await gameStatisticsService.getByGroupId(
          "group-1",
          false,
          true,
          false,
          true,
          false
        );

        expect(gameStatisticsRepository.findByGroupId).toHaveBeenCalledWith(
          "group-1",
          {
            includeCurrency: false,
            includeGameBuildings: true,
            includeAssets: false,
            includeCheckpoints: true,
            includeGroup: false,
          }
        );
        expect(result).toBe(mockGS);
      });
    });
  });

  describe("Currency Operations", () => {
    describe("getCurrencyById", () => {
      it("should call repository findCurrencyById", async () => {
        const mockCurrency = new Currency(
          { id: "cur-1", greenEnergy: 100 },
          false
        );
        gameStatisticsRepository.findCurrencyById.mockResolvedValue(
          mockCurrency
        );

        const result = await gameStatisticsService.getCurrencyById("cur-1");

        expect(gameStatisticsRepository.findCurrencyById).toHaveBeenCalledWith(
          "cur-1"
        );
        expect(result).toBe(mockCurrency);
      });
    });

    describe("updateCurrency", () => {
      it("should call repository updateCurrency", async () => {
        const updatePayload = {
          greenEnergy: 150,
          greyEnergy: 75,
          coins: 500,
          score: 1000,
        };
        const mockUpdatedCurrency = new Currency(updatePayload, false);
        gameStatisticsRepository.updateCurrency.mockResolvedValue(
          mockUpdatedCurrency
        );

        const result = await gameStatisticsService.updateCurrency(
          "cur-1",
          updatePayload
        );

        expect(gameStatisticsRepository.updateCurrency).toHaveBeenCalledWith(
          "cur-1",
          updatePayload
        );
        expect(result).toBe(mockUpdatedCurrency);
      });
    });

    describe("incrementCurrency", () => {
      it("should call repository incrementCurrency", async () => {
        const incrementPayload = { coins: 10, score: 5 };
        const mockUpdatedCurrency = new Currency(
          { coins: 110, score: 105 },
          false
        );
        gameStatisticsRepository.incrementCurrency.mockResolvedValue(
          mockUpdatedCurrency
        );

        const result = await gameStatisticsService.incrementCurrency(
          "cur-1",
          incrementPayload
        );

        expect(gameStatisticsRepository.incrementCurrency).toHaveBeenCalledWith(
          "cur-1",
          incrementPayload
        );
        expect(result).toBe(mockUpdatedCurrency);
      });
    });
  });

  describe("Asset Operations", () => {
    describe("addAsset", () => {
      it("should create Asset instance and add it with achievements tracking", async () => {
        const assetData = {
          buildCost: 100,
          destroyCost: 50,
          energy: 20,
          xLocation: 1,
          yLocation: 2,
          xSize: 1,
          ySize: 1,
          type: "Windmolen",
        };

        const mockAddedAsset = new Asset({ ...assetData, id: "a-1" }, false);
        const mockGameStatistics = new GameStatistics(
          {
            id: "gs-1",
            currency: {
              id: "cur-1",
              greenEnergy: 100,
              greyEnergy: 50,
              coins: 500,
              score: 1000,
            },
          },
          false
        );
        const mockAchievement = new Achievement(
          { id: "ach-1", title: "Energie-ingenieur" },
          false
        );

        gameStatisticsRepository.addAsset.mockResolvedValue(mockAddedAsset);
        gameStatisticsRepository.findById.mockResolvedValue(mockGameStatistics);
        gameStatisticsRepository.updateCurrency.mockResolvedValue();
        gameStatisticsService._trackEarnedAchievements = jest
          .fn()
          .mockResolvedValue([mockAchievement]);

        const result = await gameStatisticsService.addAsset("gs-1", assetData);

        expect(gameStatisticsRepository.addAsset).toHaveBeenCalledWith(
          "gs-1",
          expect.any(Asset)
        );
        expect(gameStatisticsRepository.updateCurrency).toHaveBeenCalledWith(
          "cur-1",
          {
            greenEnergy: 120, // 100 + 20 (asset energy)
            greyEnergy: 50,
            coins: 400, // 500 - 100 (build cost)
            score: 1001, // 1000 + 1 (Windmolen score from scoreCost.ActiveGreenSource)
          }
        );
        expect(result.asset).toBe(mockAddedAsset);
        expect(result.newlyEarnedAchievements).toEqual([mockAchievement]);
      });

      it("should handle Kerncentrale asset and update grey energy", async () => {
        const nuclearData = {
          buildCost: 1000,
          destroyCost: 500,
          energy: 200,
          xLocation: 5,
          yLocation: 5,
          xSize: 3,
          ySize: 3,
          type: "Kerncentrale",
        };

        const mockAddedAsset = new Asset({ ...nuclearData, id: "a-2" }, false);
        const mockGameStatistics = new GameStatistics(
          {
            id: "gs-1",
            currency: {
              id: "cur-1",
              greenEnergy: 100,
              greyEnergy: 50,
              coins: 1500,
              score: 1000,
            },
          },
          false
        );

        gameStatisticsRepository.addAsset.mockResolvedValue(mockAddedAsset);
        gameStatisticsRepository.findById.mockResolvedValue(mockGameStatistics);
        gameStatisticsRepository.updateCurrency.mockResolvedValue();
        gameStatisticsService._trackEarnedAchievements = jest
          .fn()
          .mockResolvedValue([]);

        await gameStatisticsService.addAsset("gs-1", nuclearData);

        expect(gameStatisticsRepository.updateCurrency).toHaveBeenCalledWith(
          "cur-1",
          {
            greenEnergy: 100, // unchanged
            greyEnergy: 250, // 50 + 200 (nuclear energy)
            coins: 500, // 1500 - 1000 (build cost)
            score: 998, // 1000 + (-2) (Kerncentrale penalty from scoreCost.ActiveGreySource)
          }
        );
      });
    });

    describe("removeAsset", () => {
      it("should remove asset and track achievements", async () => {
        const mockRemovedAsset = new Asset(
          {
            id: "a-1",
            gameStatisticsId: "gs-1",
            type: "Kerncentrale",
          },
          false
        );
        const mockAchievement = new Achievement(
          { id: "ach-1", title: "Milieuheld" },
          false
        );

        gameStatisticsRepository.removeAsset.mockResolvedValue(
          mockRemovedAsset
        );
        gameStatisticsService._trackEarnedAchievements = jest
          .fn()
          .mockResolvedValue([mockAchievement]);

        const result = await gameStatisticsService.removeAsset("a-1");

        expect(gameStatisticsRepository.removeAsset).toHaveBeenCalledWith(
          "a-1"
        );
        expect(
          gameStatisticsService._trackEarnedAchievements
        ).toHaveBeenCalledWith("gs-1", ["Milieuheld"], mockRemovedAsset);
        expect(result.asset).toBe(mockRemovedAsset);
        expect(result.newlyEarnedAchievements).toEqual([mockAchievement]);
      });
    });

    describe("findAllAssetsByGameStatisticsId", () => {
      it("should call repository method", async () => {
        const mockAssets = [new Asset({ id: "a-1" }, false)];
        gameStatisticsRepository.findAllAssetsByGameStatisticsId.mockResolvedValue(
          mockAssets
        );

        const result =
          await gameStatisticsService.findAllAssetsByGameStatisticsId("gs-1");

        expect(
          gameStatisticsRepository.findAllAssetsByGameStatisticsId
        ).toHaveBeenCalledWith("gs-1");
        expect(result).toBe(mockAssets);
      });
    });
  });

  describe("Checkpoint Operations", () => {
    describe("recordCheckpoint", () => {
      it("should create checkpoint from current game state", async () => {
        const mockGameBuildings = [new GameBuildings({ id: "gb-1" }, false)];
        const mockAssets = [new Asset({ id: "a-1" }, false)];
        const mockAchievements = [
          new Achievement({ id: "ach-1", title: "Test Achievement" }, false),
        ];

        const mockGameStatistics = new GameStatistics(
          {
            id: "gs-1",
            currency: { id: "cur-1", greenEnergy: 100 },
            gameBuildings: mockGameBuildings,
            assets: mockAssets,
          },
          false
        );

        const mockCheckpoint = new Checkpoint({ id: "cp-1" }, false);

        gameStatisticsRepository.findById.mockResolvedValue(mockGameStatistics);
        gameStatisticsRepository.getGameStatisticsAchievements.mockResolvedValue(
          mockAchievements
        );
        gameStatisticsRepository.recordCheckpoint.mockResolvedValue(
          mockCheckpoint
        );

        const result = await gameStatisticsService.recordCheckpoint("gs-1");

        expect(gameStatisticsRepository.recordCheckpoint).toHaveBeenCalledWith(
          "gs-1",
          mockGameStatistics.currency,
          mockGameBuildings,
          mockAssets,
          mockAchievements
        );
        expect(result).toBe(mockCheckpoint);
      });
    });

    describe("findAllCheckpointsByGameStatisticsId", () => {
      it("should call repository method", async () => {
        const mockCheckpoints = [new Checkpoint({ id: "cp-1" }, false)];
        gameStatisticsRepository.findAllCheckpointsByGameStatisticsId.mockResolvedValue(
          mockCheckpoints
        );

        const result =
          await gameStatisticsService.findAllCheckpointsByGameStatisticsId(
            "gs-1"
          );

        expect(
          gameStatisticsRepository.findAllCheckpointsByGameStatisticsId
        ).toHaveBeenCalledWith("gs-1");
        expect(result).toBe(mockCheckpoints);
      });
    });

    describe("removeCheckpoint", () => {
      it("should call repository removeCheckpoint", async () => {
        const mockCheckpoint = new Checkpoint({ id: "cp-1" }, false);
        gameStatisticsRepository.removeCheckpoint.mockResolvedValue(
          mockCheckpoint
        );

        const result = await gameStatisticsService.removeCheckpoint("cp-1");

        expect(gameStatisticsRepository.removeCheckpoint).toHaveBeenCalledWith(
          "cp-1"
        );
        expect(result).toBe(mockCheckpoint);
      });
    });

    describe("refactorGameStatistics", () => {
      it("should refactor game statistics from checkpoint", async () => {
        const mockCheckpoint = new Checkpoint({ id: "cp-1" }, false);
        const mockRefactoredGS = new GameStatistics({ id: "gs-1" }, false);

        gameStatisticsRepository.findCheckpointById.mockResolvedValue(
          mockCheckpoint
        );
        gameStatisticsRepository.refactorGameStatistics.mockResolvedValue(
          mockRefactoredGS
        );

        const result = await gameStatisticsService.refactorGameStatistics(
          "cp-1"
        );

        expect(
          gameStatisticsRepository.findCheckpointById
        ).toHaveBeenCalledWith("cp-1");
        expect(
          gameStatisticsRepository.refactorGameStatistics
        ).toHaveBeenCalledWith({ checkpoint: mockCheckpoint });
        expect(result).toBe(mockRefactoredGS);
      });
    });
  });

  describe("Game Building Operations", () => {
    describe("getAllGameBuildingsByGroupId", () => {
      it("should call repository method", async () => {
        const mockGameBuildings = [new GameBuildings({ id: "gb-1" }, false)];
        gameStatisticsRepository.findAllGameBuildingsByGroupId.mockResolvedValue(
          mockGameBuildings
        );

        const result = await gameStatisticsService.getAllGameBuildingsByGroupId(
          "group-1"
        );

        expect(
          gameStatisticsRepository.findAllGameBuildingsByGroupId
        ).toHaveBeenCalledWith("group-1");
        expect(result).toBe(mockGameBuildings);
      });
    });

    describe("upgradeGameBuilding", () => {
      it("should upgrade building level and track achievements", async () => {
        const mockGameBuilding = new GameBuildings(
          {
            id: "gb-1",
            gameStatisticsId: "gs-1",
            building: { id: "b-1" },
          },
          false
        );
        const mockCurrentLevel = new BuildingLevel(
          { id: "bl-1", upgradeCost: 100 },
          false
        );
        const mockNextLevel = new BuildingLevel(
          { id: "bl-2", level: 2 },
          false
        );
        const mockUpdatedGameBuilding = new GameBuildings(
          { id: "gb-1" },
          false
        );
        const mockGameStatistics = new GameStatistics(
          {
            id: "gs-1",
            currency: { id: "cur-1", coins: 500 },
          },
          false
        );
        const mockAchievement = new Achievement(
          { id: "ach-1", title: "Bouwassistent" },
          false
        );

        gameStatisticsRepository.findGameBuildingById.mockResolvedValue(
          mockGameBuilding
        );
        gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel
          .mockResolvedValueOnce(mockCurrentLevel) // level 1
          .mockResolvedValueOnce(mockNextLevel); // level 2
        gameStatisticsRepository.upgradeGameBuildingLevel.mockResolvedValue(
          mockUpdatedGameBuilding
        );
        gameStatisticsRepository.findById.mockResolvedValue(mockGameStatistics);
        gameStatisticsRepository.updateCurrency.mockResolvedValue();
        gameStatisticsService._trackEarnedAchievements = jest
          .fn()
          .mockResolvedValue([mockAchievement]);

        const result = await gameStatisticsService.upgradeGameBuilding("gb-1", {
          nextLevel: 2,
        });

        expect(
          gameStatisticsRepository.upgradeGameBuildingLevel
        ).toHaveBeenCalledWith("gb-1", "bl-2");
        expect(gameStatisticsRepository.updateCurrency).toHaveBeenCalledWith(
          "cur-1",
          expect.objectContaining({
            coins: 400, // 500 - 100 (upgrade cost)
          })
        );
        expect(result.gameBuilding).toBe(mockUpdatedGameBuilding);
        expect(result.newlyEarnedAchievements).toEqual([mockAchievement]);
      });

      it("should throw error if game building not found", async () => {
        gameStatisticsRepository.findGameBuildingById.mockResolvedValue(null);

        await expect(
          gameStatisticsService.upgradeGameBuilding("invalid", { nextLevel: 2 })
        ).rejects.toThrow("GameBuilding with id invalid not found");
      });

      it("should throw error if building level not found", async () => {
        const mockGameBuilding = new GameBuildings(
          {
            id: "gb-1",
            building: { id: "b-1" },
          },
          false
        );

        gameStatisticsRepository.findGameBuildingById.mockResolvedValue(
          mockGameBuilding
        );
        gameStatisticsRepository.findBuildingLevelByBuildingIdAndLevel.mockResolvedValue(
          null
        );

        await expect(
          gameStatisticsService.upgradeGameBuilding("gb-1", { nextLevel: 2 })
        ).rejects.toThrow("BuildingLevel 1 for building b-1 not found");
      });
    });

    describe("toggleGameBuildingRunsOnGreen", () => {
      it("should call repository method", async () => {
        const mockUpdatedBuilding = new GameBuildings(
          { id: "gb-1", runsOnGreen: false },
          false
        );
        gameStatisticsRepository.toggleGameBuildingRunsOnGreen.mockResolvedValue(
          mockUpdatedBuilding
        );

        const result =
          await gameStatisticsService.toggleGameBuildingRunsOnGreen("gb-1");

        expect(
          gameStatisticsRepository.toggleGameBuildingRunsOnGreen
        ).toHaveBeenCalledWith("gb-1");
        expect(result).toBe(mockUpdatedBuilding);
      });
    });

    describe("createGameBuildings", () => {
      it("should call repository method", async () => {
        const mockGameBuildings = [new GameBuildings({ id: "gb-1" }, false)];
        gameStatisticsRepository.createGameBuildings.mockResolvedValue(
          mockGameBuildings
        );

        const result = await gameStatisticsService.createGameBuildings("gs-1");

        expect(
          gameStatisticsRepository.createGameBuildings
        ).toHaveBeenCalledWith("gs-1");
        expect(result).toBe(mockGameBuildings);
      });
    });
  });

  describe("Achievement Operations", () => {
    describe("getGameStatisticsAchievements", () => {
      it("should call repository method", async () => {
        const mockAchievements = [new Achievement({ id: "ach-1" }, false)];
        gameStatisticsRepository.getGameStatisticsAchievements.mockResolvedValue(
          mockAchievements
        );

        const result =
          await gameStatisticsService.getGameStatisticsAchievements("gs-1");

        expect(
          gameStatisticsRepository.getGameStatisticsAchievements
        ).toHaveBeenCalledWith("gs-1");
        expect(result).toBe(mockAchievements);
      });
    });

    describe("hasAchievementBeenAchieved", () => {
      it("should return true for Bouwassistent achievement when building upgraded to level 2", async () => {
        const mockGameStatistics = new GameStatistics(
          {
            gameBuildings: [
              new GameBuildings(
                {
                  buildingLevel: { level: 2 },
                },
                false
              ),
            ],
          },
          false
        );

        gameStatisticsService.getById = jest
          .fn()
          .mockResolvedValue(mockGameStatistics);

        const result = await gameStatisticsService.hasAchievementBeenAchieved(
          "gs-1",
          "Bouwassistent"
        );

        expect(result).toBe(true);
      });

      it("should return true for Energie-ingenieur achievement when renewable energy source built", async () => {
        const mockGameStatistics = new GameStatistics(
          {
            assets: [new Asset({ type: "Windmolen" }, false)],
          },
          false
        );

        gameStatisticsService.getById = jest
          .fn()
          .mockResolvedValue(mockGameStatistics);

        const result = await gameStatisticsService.hasAchievementBeenAchieved(
          "gs-1",
          "Energie-ingenieur"
        );

        expect(result).toBe(true);
      });

      it("should return true for Milieuheld achievement when nuclear plant destroyed", async () => {
        const removedAsset = new Asset({ type: "Kerncentrale" }, false);
        const mockGameStatistics = new GameStatistics({ assets: [] }, false);

        gameStatisticsService.getById = jest
          .fn()
          .mockResolvedValue(mockGameStatistics);

        const result = await gameStatisticsService.hasAchievementBeenAchieved(
          "gs-1",
          "Milieuheld",
          removedAsset
        );

        expect(result).toBe(true);
      });

      it("should return false for unknown achievement", async () => {
        const mockGameStatistics = new GameStatistics({ assets: [] }, false);
        gameStatisticsService.getById = jest
          .fn()
          .mockResolvedValue(mockGameStatistics);

        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const result = await gameStatisticsService.hasAchievementBeenAchieved(
          "gs-1",
          "Unknown Achievement"
        );

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Unknown achievement title: Unknown Achievement"
        );
        consoleSpy.mockRestore();
      });
    });

    describe("addAchievementToGameStatistics", () => {
      it("should add achievement without updating currency", async () => {
        const mockAchievement = new Achievement(
          { id: "ach-1", title: "Test Achievement" }, // Remove reward property
          false
        );
        const mockGameStatistics = new GameStatistics(
          {
            id: "gs-1",
            currency: { id: "cur-1", score: 100 },
          },
          false
        );

        gameStatisticsRepository.findAchievementByTitle.mockResolvedValue(
          mockAchievement
        );
        gameStatisticsRepository.getGameStatisticsAchievements.mockResolvedValue(
          []
        );
        gameStatisticsRepository.addAchievementToGameStatistics.mockResolvedValue(
          mockAchievement
        );

        const result =
          await gameStatisticsService.addAchievementToGameStatistics(
            "gs-1",
            "Test Achievement"
          );

        expect(
          gameStatisticsRepository.addAchievementToGameStatistics
        ).toHaveBeenCalledWith("gs-1", mockAchievement);

        // Since achievements no longer give rewards, currency should not be updated
        expect(gameStatisticsRepository.updateCurrency).not.toHaveBeenCalled();
        expect(gameStatisticsRepository.findById).not.toHaveBeenCalled();
        expect(result).toBe(mockAchievement);
      });

      it("should throw error if achievement not found", async () => {
        gameStatisticsRepository.findAchievementByTitle.mockResolvedValue(null);

        await expect(
          gameStatisticsService.addAchievementToGameStatistics(
            "gs-1",
            "Nonexistent Achievement"
          )
        ).rejects.toThrow(
          'Achievement with title "Nonexistent Achievement" not found'
        );
      });

      it("should return early if achievement already exists", async () => {
        const mockAchievement = new Achievement(
          { id: "ach-1", title: "Test Achievement" },
          false
        );
        const existingAchievements = [mockAchievement];

        gameStatisticsRepository.findAchievementByTitle.mockResolvedValue(
          mockAchievement
        );
        gameStatisticsRepository.getGameStatisticsAchievements.mockResolvedValue(
          existingAchievements
        );

        const result =
          await gameStatisticsService.addAchievementToGameStatistics(
            "gs-1",
            "Test Achievement"
          );

        expect(
          gameStatisticsRepository.addAchievementToGameStatistics
        ).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });
    });
  });
});
