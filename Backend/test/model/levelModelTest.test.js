const Level = require('../../model/level'); 

describe('Level model tests', () => {
  const validData = {
    level: 1,
    upgradeCost: 150,
    energyCost: 30
  };

  test('creates Level with valid data', () => {
    const level = new Level(validData);
    expect(level).toBeInstanceOf(Level);
    expect(level.level).toBe(1);
    expect(level.upgradeCost).toBe(150);
    expect(level.energyCost).toBe(30);
  });

  test('throws error for invalid level', () => {
    expect(() => {
      new Level({ ...validData, level: 'not a number' });
    }).toThrow('Invalid level');
  });

  test('throws error for invalid upgradeCost', () => {
    expect(() => {
      new Level({ ...validData, upgradeCost: null });
    }).toThrow('Invalid upgradeCost');
  });

  test('throws error for invalid energyCost', () => {
    expect(() => {
      new Level({ ...validData, energyCost: {} });
    }).toThrow('Invalid energyCost');
  });

  test('skips validation if validate = false', () => {
    expect(() => {
      new Level({ ...validData, level: 'invalid' }, false);
    }).not.toThrow();
  });

  test('from() creates Level from prismaLevel object', () => {
    const prismaLevel = {
      id: 42,
      level: 5,
      upgradeCost: 200,
      energyCost: 40
    };

    const level = Level.from(prismaLevel);
    expect(level).toBeInstanceOf(Level);
    expect(level.id).toBe(42);
    expect(level.level).toBe(5);
    expect(level.upgradeCost).toBe(200);
    expect(level.energyCost).toBe(40);
  });
});
