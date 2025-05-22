const GameStatistics = require('../../model/gameStatistics');
const Currency       = require('../../model/currency');
const Building       = require('../../model/building');
const Asset          = require('../../model/asset');
const Checkpoint     = require('../../model/checkpoint');
const Level          = require('../../model/level');

describe('GameStatistics model tests', () => {
  const validCurrency = new Currency({
    greenEnergy: 10,
    greyEnergy: 20,
    coins: 1000
  });

  const validLevel = new Level({
    level: 1,
    upgradeCost: 100,
    energyCost: 10
  });

  const validBuilding = new Building({
    xLocation: 1,
    yLocation: 2,
    xSize: 2,
    ySize: 2,
    level: validLevel
  });

  const validAsset = new Asset({
    buildCost: 50,
    destroyCost: 10,
    energy: 5,
    xLocation: 0,
    yLocation: 0,
    xSize: 1,
    ySize: 1,
    type: 'solar'
  });

  const validCheckpoint = new Checkpoint({
    currency: validCurrency,
    buildings: [validBuilding],
    assets: [validAsset]
  });

  const validData = {
    currency: validCurrency,
    buildings: [validBuilding],
    groupId: 'group123',
    checkpoints: [validCheckpoint],
    assets: [validAsset]
  };

  test('creates GameStatistics with valid data', () => {
    const gs = new GameStatistics(validData);
    expect(gs).toBeInstanceOf(GameStatistics);
    expect(gs.currency).toBeInstanceOf(Currency);
    expect(gs.buildings[0]).toBeInstanceOf(Building);
    expect(gs.groupId).toBe('group123');
    expect(gs.checkpoints[0]).toBeInstanceOf(Checkpoint);
    expect(gs.assets[0]).toBeInstanceOf(Asset);
  });

  test('throws error for invalid currency', () => {
    expect(() => {
      new GameStatistics({ ...validData, currency: {} });
    }).toThrow('Invalid currency (must be Currency)');
  });

  test('throws error for invalid buildings array', () => {
    expect(() => {
      new GameStatistics({ ...validData, buildings: 'not an array' });
    }).toThrow('Invalid buildings (must be Building[])');
  });

  test('throws error for buildings with invalid types', () => {
    expect(() => {
      new GameStatistics({ ...validData, buildings: [{}] });
    }).toThrow('Invalid buildings (must be Building[])');
  });

  test('throws error for invalid groupId type', () => {
    expect(() => {
      new GameStatistics({ ...validData, groupId: 123 });
    }).toThrow('Invalid groupId (must be string)');
  });

  test('throws error for invalid checkpoints array', () => {
    expect(() => {
      new GameStatistics({ ...validData, checkpoints: 'nope' });
    }).toThrow('Invalid checkpoints (must be Checkpoint[])');
  });

  test('throws error for checkpoints with invalid types', () => {
    expect(() => {
      new GameStatistics({ ...validData, checkpoints: [{}] });
    }).toThrow('Invalid checkpoints (must be Checkpoint[])');
  });

  test('throws error for invalid assets array', () => {
    expect(() => {
      new GameStatistics({ ...validData, assets: 'no' });
    }).toThrow('Invalid assets (must be Asset[])');
  });

  test('throws error for assets with invalid types', () => {
    expect(() => {
      new GameStatistics({ ...validData, assets: [{}] });
    }).toThrow('Invalid assets (must be Asset[])');
  });

  test('skips validation when validate = false', () => {
    expect(() => {
      new GameStatistics({
        currency: {},
        buildings: [{}],
        groupId: 123,
        checkpoints: [{}],
        assets: [{}],
      }, false);
    }).not.toThrow();
  });

  test('from() creates GameStatistics from prisma-like object', () => {
    const prismaGS = {
      id: 123,
      currency: {
        id: 1,
        greenEnergy: 10,
        greyEnergy: 20,
        coins: 1000
      },
      buildings: [
        {
          id: 2,
          xLocation: 1,
          yLocation: 2,
          xSize: 2,
          ySize: 2,
          level: {
            id: 3,
            level: 1,
            upgradeCost: 100,
            energyCost: 10
          }
        }
      ],
      groupId: 'group123',
      checkpoints: [
        {
          id: 4,
          currency: {
            id: 5,
            greenEnergy: 5,
            greyEnergy: 10,
            coins: 500
          },
          buildings: [],
          assets: []
        }
      ],
      assets: [
        {
          id: 6,
          buildCost: 50,
          destroyCost: 10,
          energy: 5,
          xLocation: 0,
          yLocation: 0,
          xSize: 1,
          ySize: 1,
          type: 'solar'
        }
      ]
    };

    const gs = GameStatistics.from(prismaGS);
    expect(gs).toBeInstanceOf(GameStatistics);
    expect(gs.currency).toBeInstanceOf(Currency);
    expect(gs.buildings[0]).toBeInstanceOf(Building);
    expect(gs.groupId).toBe('group123');
    expect(gs.checkpoints[0]).toBeInstanceOf(Checkpoint);
    expect(gs.assets[0]).toBeInstanceOf(Asset);
    expect(gs.id).toBe(123);
  });
});
