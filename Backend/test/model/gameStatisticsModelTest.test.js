const Currency = require("../../model/currency");
const GameBuildings = require("../../model/gameBuildings");
const Checkpoint = require("../../model/checkpoint");
const Asset = require("../../model/asset");
const Achievement = require("../../model/achievement");
const GameStatistics = require("../../model/gameStatistics");
const Building = require("../../model/building");
const BuildingLevel = require("../../model/buildingLevel");

describe("GameStatistics", () => {
  // Maak geldige mocks van Building en BuildingLevel
  const mockBuilding = new Building({ id: "b-1", name: "House" }, false);
  const mockBuildingLevel = new BuildingLevel({ id: "bl-1", level: 1 }, false);

  // Mock van GameBuildings met correcte Building en BuildingLevel instances
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
    { id: "cur-1", name: "Gold", symbol: "G" },
    false
  );

  const mockCheckpoint = new Checkpoint(
    {
      id: "cp-1",
      currency: mockCurrency,
      gameBuildings: [mockGameBuilding],
      assets: [],
      gameStatisticsId: "gs-1",
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
      type: "building",
    },
    false
  );

  const mockAchievement = new Achievement(
    { id: "ach-1", name: "First Win" },
    false
  );

  describe("constructor and validate", () => {
    it("creates instance with valid data", () => {
      const gs = new GameStatistics({
        id: "gs-1",
        currency: mockCurrency,
        gameBuildings: [mockGameBuilding],
        groupId: "group-1",
        checkpoints: [mockCheckpoint],
        assets: [mockAsset],
        achievements: [mockAchievement],
      });

      expect(gs.id).toBe("gs-1");
      expect(gs.currency).toBeInstanceOf(Currency);
      expect(gs.gameBuildings).toHaveLength(1);
      expect(gs.gameBuildings[0]).toBeInstanceOf(GameBuildings);
      expect(gs.groupId).toBe("group-1");
      expect(gs.checkpoints).toHaveLength(1);
      expect(gs.checkpoints[0]).toBeInstanceOf(Checkpoint);
      expect(gs.assets).toHaveLength(1);
      expect(gs.assets[0]).toBeInstanceOf(Asset);
      expect(gs.achievements).toHaveLength(1);
      expect(gs.achievements[0]).toBeInstanceOf(Achievement);
    });

    it("throws on invalid currency", () => {
      expect(
        () =>
          new GameStatistics({
            currency: {},
            gameBuildings: [],
            groupId: "group-1",
            checkpoints: [],
            assets: [],
            achievements: [],
          })
      ).toThrow("Invalid currency (must be Currency)");
    });

    it("throws on invalid gameBuildings array", () => {
      expect(
        () =>
          new GameStatistics({
            currency: mockCurrency,
            gameBuildings: [{}],
            groupId: "group-1",
            checkpoints: [],
            assets: [],
            achievements: [],
          })
      ).toThrow("Invalid gameBuilding (must be GameBuildings)");
    });

    it("throws on non-string groupId", () => {
      expect(
        () =>
          new GameStatistics({
            currency: mockCurrency,
            gameBuildings: [],
            groupId: 123,
            checkpoints: [],
            assets: [],
            achievements: [],
          })
      ).toThrow("Invalid groupId (must be string)");
    });

    it("throws on invalid achievements element", () => {
      expect(
        () =>
          new GameStatistics({
            currency: mockCurrency,
            gameBuildings: [],
            groupId: "group-1",
            checkpoints: [],
            assets: [],
            achievements: [{}],
          })
      ).toThrow("Invalid achievement (must be Achievement)");
    });
  });

  describe("from() static method", () => {
    it("creates GameStatistics from prisma-like object", () => {
      const prismaObj = {
        id: "gs-2",
        currency: { id: "cur-2", name: "Silver", symbol: "S" },
        gameBuildings: [
          {
            id: "gb-2",
            gameStatisticsId: "gs-2",
            checkpointId: null,
            building: { id: "b-2", name: "Farm" },
            buildingLevel: {
              id: "bl-2",
              level: 2,
              energyCost: 100,
              upgradeCost: 50,
              scoreDeduction: 5, // <-- toegevoegd
              // voeg hier nog andere vereiste properties toe als die er zijn
            },
            runsOnGreen: false,
          },
        ],

        groupId: "group-2",
        checkpoints: [],
        assets: [],
        achievements: [],
      };

      const gs = GameStatistics.from(prismaObj);

      expect(gs.id).toBe("gs-2");
      expect(gs.currency).toBeInstanceOf(Currency);
      // expect(gs.currency.name).toBe("Silver");
      expect(gs.gameBuildings).toHaveLength(1);
      expect(gs.gameBuildings[0]).toBeInstanceOf(GameBuildings);
      expect(gs.groupId).toBe("group-2");
      expect(gs.checkpoints).toHaveLength(0);
      expect(gs.assets).toHaveLength(0);
      expect(gs.achievements).toHaveLength(0);
    });

    it("handles null currency and missing optional arrays", () => {
      const prismaObj = {
        id: "gs-3",
        currency: null,
        groupId: "group-3",
      };

      const gs = GameStatistics.from(prismaObj);

      expect(gs.currency).toBeNull();
      expect(gs.gameBuildings).toHaveLength(0);
      expect(gs.checkpoints).toHaveLength(0);
      expect(gs.assets).toHaveLength(0);
      expect(gs.achievements).toHaveLength(0);
    });
  });

  describe("toJSON()", () => {
    it("serializes without circular references", () => {
      const gs = new GameStatistics({
        id: "gs-4",
        currency: mockCurrency,
        gameBuildings: [mockGameBuilding],
        groupId: "group-4",
        checkpoints: [mockCheckpoint],
        assets: [mockAsset],
        achievements: [mockAchievement],
      });

      const json = gs.toJSON();

      expect(json).toEqual({
        id: "gs-4",
        currency: mockCurrency,
        gameBuildings: [
          {
            id: mockGameBuilding.id,
            building: mockGameBuilding.building,
            buildingLevel: mockGameBuilding.buildingLevel,
            runsOnGreen: mockGameBuilding.runsOnGreen,
          },
        ],
        groupId: "group-4",
        checkpoints: [mockCheckpoint],
        assets: [mockAsset],
        achievements: [mockAchievement],
      });
    });
  });
});
