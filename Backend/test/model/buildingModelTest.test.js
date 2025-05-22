const Building = require('../../model/building');
const Level = require('../../model/level');

describe('Building model tests', () => {
  const validLevel = new Level({
    level: 1,
    upgradeCost: 100,
    energyCost: 50
  });

  const validData = {
    xLocation: 10,
    yLocation: 20,
    xSize: 3,
    ySize: 3,
    level: validLevel
  };

  test('creates Building with valid data', () => {
    const building = new Building(validData);
    expect(building).toBeInstanceOf(Building);
    expect(building.level).toBeInstanceOf(Level);
  });

  test('throws error for invalid xLocation', () => {
    expect(() => {
      new Building({ ...validData, xLocation: 'left' });
    }).toThrow('Invalid xLocation');
  });

  test('throws error for invalid yLocation', () => {
    expect(() => {
      new Building({ ...validData, yLocation: null });
    }).toThrow('Invalid yLocation');
  });

  test('throws error for invalid xSize', () => {
    expect(() => {
      new Building({ ...validData, xSize: [] });
    }).toThrow('Invalid xSize');
  });

  test('throws error for invalid ySize', () => {
    expect(() => {
      new Building({ ...validData, ySize: undefined });
    }).toThrow('Invalid ySize');
  });

  test('throws error for invalid level (not a Level instance)', () => {
    expect(() => {
      new Building({ ...validData, level: { level: 1, upgradeCost: 100, energyCost: 50 } });
    }).toThrow('Invalid level (must be a Level instance)');
  });

  test('skips validation when validate = false', () => {
    expect(() => {
      new Building({ ...validData, xLocation: 'invalid' }, false);
    }).not.toThrow();
  });

  test('from() creates Building from prismaBuilding object', () => {
    const prismaBuilding = {
      id: 123,
      xLocation: 5,
      yLocation: 6,
      xSize: 2,
      ySize: 2,
      level: {
        id: 1,
        level: 2,
        upgradeCost: 200,
        energyCost: 75
      }
    };

    const building = Building.from(prismaBuilding);
    expect(building).toBeInstanceOf(Building);
    expect(building.level).toBeInstanceOf(Level);
    expect(building.id).toBe(123);
    expect(building.level.level).toBe(2);
  });
});
