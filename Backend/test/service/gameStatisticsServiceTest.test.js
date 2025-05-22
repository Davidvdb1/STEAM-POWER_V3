const GameStatisticsService = require("../../service/gameStatisticsService");
const gameStatisticsRepository = require("../../repository/gameStatisticsRepository");

const Currency = require("../../model/currency");
const Building = require("../../model/building");
const Asset = require("../../model/asset");
const Checkpoint = require("../../model/checkpoint");
const Level = require("../../model/level");

jest.mock("../../repository/gameStatisticsRepository");

const service = require("../../service/gameStatisticsService");

describe("GameStatisticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create GameStatistics with Currency", async () => {
      const fakeGS = { id: 123 };
      gameStatisticsRepository.create.mockResolvedValue(fakeGS);

      const result = await service.create({
        groupId: "group1",
        greenEnergy: 10,
        greyEnergy: 20,
        coins: 30,
      });

      expect(gameStatisticsRepository.create).toHaveBeenCalledTimes(1);
      const arg = gameStatisticsRepository.create.mock.calls[0][0];
      expect(arg.groupId).toBe("group1");
      expect(arg.currency).toBeInstanceOf(Currency);
      expect(arg.currency.greenEnergy).toBe(10);
      expect(result).toBe(fakeGS);
    });
  });

  describe("getById", () => {
    it("should call repository findById with correct args", async () => {
      const fakeGS = { id: 1 };
      gameStatisticsRepository.findById.mockResolvedValue(fakeGS);

      const result = await service.getById(1, true, false, true, false, true);

      expect(gameStatisticsRepository.findById).toHaveBeenCalledWith(1, {
        includeCurrency: true,
        includeBuildings: false,
        includeAssets: true,
        includeCheckpoints: false,
        includeGroup: true,
      });
      expect(result).toBe(fakeGS);
    });
  });

  describe("getByGroupId", () => {
    it("should call repository findByGroupId with correct args", async () => {
      const fakeGS = { id: 2 };
      gameStatisticsRepository.findByGroupId.mockResolvedValue(fakeGS);

      const result = await service.getByGroupId(
        "group1",
        false,
        true,
        false,
        true,
        false
      );

      expect(gameStatisticsRepository.findByGroupId).toHaveBeenCalledWith(
        "group1",
        {
          includeCurrency: false,
          includeBuildings: true,
          includeAssets: false,
          includeCheckpoints: true,
          includeGroup: false,
        }
      );
      expect(result).toBe(fakeGS);
    });
  });

  describe("getCurrencyById", () => {
    it("should call repository findCurrencyById", async () => {
      const fakeCurrency = { id: 10 };
      gameStatisticsRepository.findCurrencyById.mockResolvedValue(fakeCurrency);

      const result = await service.getCurrencyById(10);

      expect(gameStatisticsRepository.findCurrencyById).toHaveBeenCalledWith(
        10
      );
      expect(result).toBe(fakeCurrency);
    });
  });

  describe("updateCurrency", () => {
    it("should call repository updateCurrency", async () => {
      const updatePayload = { greenEnergy: 5 };
      const updatedCurrency = { id: 1, greenEnergy: 5 };
      gameStatisticsRepository.updateCurrency.mockResolvedValue(
        updatedCurrency
      );

      const result = await service.updateCurrency(1, updatePayload);

      expect(gameStatisticsRepository.updateCurrency).toHaveBeenCalledWith(
        1,
        updatePayload
      );
      expect(result).toBe(updatedCurrency);
    });
  });

  describe("incrementCurrency", () => {
    it("should call repository incrementCurrency", async () => {
      const incPayload = { coins: 10 };
      const updatedCurrency = { id: 1, coins: 15 };
      gameStatisticsRepository.incrementCurrency.mockResolvedValue(
        updatedCurrency
      );

      const result = await service.incrementCurrency(1, incPayload);

      expect(gameStatisticsRepository.incrementCurrency).toHaveBeenCalledWith(
        1,
        incPayload
      );
      expect(result).toBe(updatedCurrency);
    });
  });

  describe("addBuilding", () => {
    it("should create Building instance and call repository addBuilding", async () => {
      const bData = {
        xLocation: 1,
        yLocation: 2,
        xSize: 3,
        ySize: 4,
        level: new Level({ level: 1, upgradeCost: 100, energyCost: 50 }),
      };
      const fakeBuilding = { id: 100, ...bData };
      gameStatisticsRepository.addBuilding.mockResolvedValue(fakeBuilding);

      const result = await service.addBuilding(5, bData);

      expect(gameStatisticsRepository.addBuilding).toHaveBeenCalled();
      const [statsId, buildingInstance] =
        gameStatisticsRepository.addBuilding.mock.calls[0];
      expect(statsId).toBe(5);
      expect(buildingInstance).toBeInstanceOf(Building);
      expect(result).toBe(fakeBuilding);
    });
  });

  describe("updateBuilding", () => {
    it("should call repository updateBuilding", async () => {
      const updates = { xLocation: 10 };
      const updatedBuilding = { id: 7, xLocation: 10 };
      gameStatisticsRepository.updateBuilding.mockResolvedValue(
        updatedBuilding
      );

      const result = await service.updateBuilding(7, updates);

      expect(gameStatisticsRepository.updateBuilding).toHaveBeenCalledWith(
        7,
        updates
      );
      expect(result).toBe(updatedBuilding);
    });
  });

  describe("removeBuilding", () => {
    it("should call repository removeBuilding", async () => {
      gameStatisticsRepository.removeBuilding.mockResolvedValue();

      await service.removeBuilding(8);

      expect(gameStatisticsRepository.removeBuilding).toHaveBeenCalledWith(8);
    });
  });

  describe("addAsset", () => {
    it("should create Asset instance and call repository addAsset", async () => {
      const aData = {
        buildCost: 10,
        destroyCost: 5,
        energy: 20,
        xLocation: 1,
        yLocation: 2,
        xSize: 3,
        ySize: 4,
        type: "factory",
      };
      const fakeAsset = { id: 15, ...aData };
      gameStatisticsRepository.addAsset.mockResolvedValue(fakeAsset);

      const result = await service.addAsset(3, aData);

      expect(gameStatisticsRepository.addAsset).toHaveBeenCalled();
      const [statsId, assetInstance] =
        gameStatisticsRepository.addAsset.mock.calls[0];
      expect(statsId).toBe(3);
      expect(assetInstance).toBeInstanceOf(Asset);
      expect(result).toBe(fakeAsset);
    });
  });

  describe("removeAsset", () => {
    it("should call repository removeAsset", async () => {
      gameStatisticsRepository.removeAsset.mockResolvedValue();

      await service.removeAsset(12);

      expect(gameStatisticsRepository.removeAsset).toHaveBeenCalledWith(12);
    });
  });

  describe("recordCheckpoint", () => {
    it("should create Currency, Buildings, Assets and call repository recordCheckpoint", async () => {
      const cpData = {
        currency: { greenEnergy: 1, greyEnergy: 2, coins: 3 },
        buildings: [
          {
            xLocation: 1,
            yLocation: 1,
            xSize: 2,
            ySize: 2,
            level: { level: 1, upgradeCost: 100, energyCost: 50 },
          },
          {
            xLocation: 2,
            yLocation: 2,
            xSize: 2,
            ySize: 2,
            level: { level: 2, upgradeCost: 200, energyCost: 75 },
          },
        ],
        assets: [
          {
            buildCost: 10,
            destroyCost: 5,
            energy: 20,
            xLocation: 1,
            yLocation: 1,
            xSize: 1,
            ySize: 1,
            type: "factory",
          },
        ],
      };
      const fakeCheckpoint = { id: 99 };
      gameStatisticsRepository.recordCheckpoint.mockResolvedValue(
        fakeCheckpoint
      );

      const result = await service.recordCheckpoint(7, cpData);

      expect(gameStatisticsRepository.recordCheckpoint).toHaveBeenCalled();
      const [statsId, checkpointInstance] =
        gameStatisticsRepository.recordCheckpoint.mock.calls[0];
      expect(statsId).toBe(7);
      expect(checkpointInstance).toBeInstanceOf(Checkpoint);
      expect(checkpointInstance.currency).toBeInstanceOf(Currency);
      expect(checkpointInstance.buildings.length).toBe(2);
      expect(checkpointInstance.buildings[0]).toBeInstanceOf(Building);
      expect(checkpointInstance.assets.length).toBe(1);
      expect(checkpointInstance.assets[0]).toBeInstanceOf(Asset);
      expect(result).toBe(fakeCheckpoint);
    });
  });

  describe("removeCheckpoint", () => {
    it("should call repository removeCheckpoint", async () => {
      gameStatisticsRepository.removeCheckpoint.mockResolvedValue();

      await service.removeCheckpoint(5);

      expect(gameStatisticsRepository.removeCheckpoint).toHaveBeenCalledWith(5);
    });
  });

  describe("delete", () => {
    it("should call repository delete", async () => {
      gameStatisticsRepository.delete.mockResolvedValue();

      await service.delete(2);

      expect(gameStatisticsRepository.delete).toHaveBeenCalledWith(2);
    });
  });
});
