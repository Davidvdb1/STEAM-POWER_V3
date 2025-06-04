const Checkpoint = require("../../model/checkpoint");
const Currency = require("../../model/currency");
const GameBuildings = require("../../model/gameBuildings");
const Asset = require("../../model/asset");

describe("Checkpoint model tests", () => {
  const validCurrency = new Currency({ name: "Gold", amount: 1000 });
  const validGameBuilding = new GameBuildings(
    {
      building: null,
      buildingLevel: {
        level: 1,
        energyCost: 10,
        upgradeCost: 20,
        scoreDeduction: 0,
      },
    },
    false
  ); // skip validation for simplicity
  const validAsset = new Asset({
    name: "Truck",
    value: 500,
    buildCost: 1000,
    destroyCost: 200,
    energy: 50,
    xLocation: 5,
    yLocation: 10,
    xSize: 2,
    ySize: 3,
    type: "Windmolen", // of een andere geldige type uit allowedTypes
  });

  const validData = {
    id: "cp-1",
    currency: validCurrency,
    gameBuildings: [validGameBuilding],
    assets: [validAsset],
    gameStatisticsId: "gs-99",
  };

  test("creates Checkpoint with valid data", () => {
    const cp = new Checkpoint(validData);
    expect(cp).toBeInstanceOf(Checkpoint);
    expect(cp.currency).toBe(validCurrency);
    expect(Array.isArray(cp.gameBuildings)).toBe(true);
    expect(cp.gameBuildings[0]).toBe(validGameBuilding);
    expect(Array.isArray(cp.assets)).toBe(true);
    expect(cp.assets[0]).toBe(validAsset);
    expect(cp.gameStatisticsId).toBe("gs-99");
  });

  test("defaults gameBuildings and assets to empty arrays", () => {
    const cp = new Checkpoint({ currency: validCurrency });
    expect(Array.isArray(cp.gameBuildings)).toBe(true);
    expect(cp.gameBuildings.length).toBe(0);
    expect(Array.isArray(cp.assets)).toBe(true);
    expect(cp.assets.length).toBe(0);
  });

  test("throws error if currency is not instance of Currency", () => {
    expect(() => {
      new Checkpoint({ currency: {} });
    }).toThrow("Invalid currency (must be Currency)");
  });

  test("throws error if gameBuildings is not array", () => {
    expect(() => {
      new Checkpoint({ currency: validCurrency, gameBuildings: {} });
    }).toThrow("Invalid gameBuildings (must be GameBuildings[])");
  });

  test("throws error if gameBuildings contains non-GameBuildings instances", () => {
    expect(() => {
      new Checkpoint({ currency: validCurrency, gameBuildings: [{}] });
    }).toThrow("Invalid gameBuildings (must be GameBuildings[])");
  });

  test("throws error if assets is not array", () => {
    expect(() => {
      new Checkpoint({ currency: validCurrency, assets: {} });
    }).toThrow("Invalid assets (must be Asset[])");
  });

  test("throws error if assets contains non-Asset instances", () => {
    expect(() => {
      new Checkpoint({ currency: validCurrency, assets: [{}] });
    }).toThrow("Invalid assets (must be Asset[])");
  });

  test("from() creates Checkpoint from prisma object", () => {
    const prismaCp = {
      id: "cp-2",
      currency: { name: "Silver", amount: 500 },
      gameBuildings: [
        {
          id: "gb-1",
          runsOnGreen: true,
          building: null,
          buildingLevel: {
            level: 2,
            energyCost: 200,
            upgradeCost: 400,
            scoreDeduction: 10,
          },
        },
      ],
      assets: [{ id: "a-1", name: "Car", value: 1000 }],
      gameStatisticsId: "gs-55",
    };

    const cp = Checkpoint.from(prismaCp);
    expect(cp).toBeInstanceOf(Checkpoint);
    expect(cp.id).toBe("cp-2");
    expect(cp.currency).toBeInstanceOf(Currency);
    expect(cp.gameBuildings.length).toBe(1);
    expect(cp.gameBuildings[0]).toBeInstanceOf(GameBuildings);
    expect(cp.assets.length).toBe(1);
    expect(cp.assets[0]).toBeInstanceOf(Asset);
    expect(cp.gameStatisticsId).toBe("gs-55");
  });

  test("from() handles missing optional arrays gracefully", () => {
    const prismaCp = {
      id: "cp-3",
      currency: { name: "Bronze", amount: 250 },
      gameStatisticsId: "gs-77",
    };

    const cp = Checkpoint.from(prismaCp);
    expect(cp.gameBuildings).toEqual([]);
    expect(cp.assets).toEqual([]);
  });
});
