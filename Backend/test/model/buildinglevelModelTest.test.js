const BuildingLevel = require('../../model/buildingLevel');

describe('BuildingLevel model tests', () => {
  const validData = {
    id: 'level-123',
    buildingId: 'building-456',
    level: 2,
    energyCost: 100,
    upgradeCost: 200,
    scoreDeduction: 10,
  };

  test('creates BuildingLevel with valid data', () => {
    const level = new BuildingLevel(validData);
    expect(level).toBeInstanceOf(BuildingLevel);
    expect(level.level).toBe(2);
    expect(level.energyCost).toBe(100);
    expect(level.buildingId).toBe('building-456');
  });

  test('throws error for invalid buildingId (not string)', () => {
    expect(() => {
      new BuildingLevel({ ...validData, buildingId: 123 });
    }).toThrow('Invalid buildingId');
  });

  test('throws error for invalid level (not number)', () => {
    expect(() => {
      new BuildingLevel({ ...validData, level: 'two' });
    }).toThrow('Invalid level');
  });

  test('throws error for invalid energyCost (not number)', () => {
    expect(() => {
      new BuildingLevel({ ...validData, energyCost: null });
    }).toThrow('Invalid energyCost');
  });

  test('throws error for invalid upgradeCost (not number)', () => {
    expect(() => {
      new BuildingLevel({ ...validData, upgradeCost: [] });
    }).toThrow('Invalid upgradeCost');
  });

  test('throws error for invalid scoreDeduction (not number)', () => {
    expect(() => {
      new BuildingLevel({ ...validData, scoreDeduction: 'low' });
    }).toThrow('Invalid scoreDeduction');
  });

  test('skips validation when validate = false', () => {
    const level = new BuildingLevel(
      { ...validData, level: 'not-a-number' },
      false
    );
    expect(level.level).toBe('not-a-number');
    expect(level).toBeInstanceOf(BuildingLevel);
  });

  test('from() creates BuildingLevel from prismaBuildingLevel object', () => {
    const prismaBuildingLevel = {
      id: 'lvl-1',
      level: 1,
      energyCost: 50,
      upgradeCost: 75,
      scoreDeduction: 5,
      buildingId: 'bldg-99',
    };

    const level = BuildingLevel.from(prismaBuildingLevel);
    expect(level).toBeInstanceOf(BuildingLevel);
    expect(level.id).toBe('lvl-1');
    expect(level.buildingId).toBe('bldg-99');
    expect(level.level).toBe(1);
  });

  test('from() handles missing buildingId but uses building.id fallback', () => {
    const prismaBuildingLevel = {
      id: 'lvl-2',
      level: 3,
      energyCost: 120,
      upgradeCost: 150,
      scoreDeduction: 20,
      building: { id: 'bldg-88' },
    };

    const level = BuildingLevel.from(prismaBuildingLevel);
    expect(level.buildingId).toBe('bldg-88');
  });
});
