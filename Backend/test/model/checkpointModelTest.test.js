const Checkpoint = require('../../model/checkpoint');
const Currency   = require('../../model/currency');
const Building   = require('../../model/building');
const Asset      = require('../../model/asset');
const Level      = require('../../model/level');

describe('Checkpoint model tests', () => {
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

  const validData = {
    currency: validCurrency,
    buildings: [validBuilding],
    assets: [validAsset]
  };

  test('creates Checkpoint with valid data', () => {
    const cp = new Checkpoint(validData);
    expect(cp).toBeInstanceOf(Checkpoint);
    expect(cp.currency).toBeInstanceOf(Currency);
    expect(cp.buildings[0]).toBeInstanceOf(Building);
    expect(cp.assets[0]).toBeInstanceOf(Asset);
  });

  test('throws error for invalid currency', () => {
    expect(() => {
      new Checkpoint({ ...validData, currency: {} });
    }).toThrow('Invalid currency (must be Currency)');
  });

  test('throws error for non-array buildings', () => {
    expect(() => {
      new Checkpoint({ ...validData, buildings: 'not an array' });
    }).toThrow('Invalid buildings (must be Building[])');
  });

  test('throws error for buildings with wrong types', () => {
    expect(() => {
      new Checkpoint({ ...validData, buildings: [{}] });
    }).toThrow('Invalid buildings (must be Building[])');
  });

  test('throws error for non-array assets', () => {
    expect(() => {
      new Checkpoint({ ...validData, assets: 'nope' });
    }).toThrow('Invalid assets (must be Asset[])');
  });

  test('throws error for assets with wrong types', () => {
    expect(() => {
      new Checkpoint({ ...validData, assets: [{}] });
    }).toThrow('Invalid assets (must be Asset[])');
  });

  test('skips validation when validate = false', () => {
    expect(() => {
      new Checkpoint({ currency: {}, buildings: [{}], assets: [{}] }, false);
    }).not.toThrow();
  });

  test('from() creates Checkpoint from prisma-like object', () => {
    const prismaCp = {
      id: 99,
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
      assets: [
        {
          id: 4,
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

    const cp = Checkpoint.from(prismaCp);
    expect(cp).toBeInstanceOf(Checkpoint);
    expect(cp.currency).toBeInstanceOf(Currency);
    expect(cp.buildings[0]).toBeInstanceOf(Building);
    expect(cp.assets[0]).toBeInstanceOf(Asset);
    expect(cp.id).toBe(99);
  });
});
