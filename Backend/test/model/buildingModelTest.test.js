const Building = require('../../model/building');

describe('Building model tests', () => {
  test('creates Building with valid name', () => {
    const building = new Building({ name: 'Main Hall' });
    expect(building).toBeInstanceOf(Building);
    expect(building.name).toBe('Main Hall');
    expect(building.id).toBeUndefined();
  });

  test('throws error for invalid name (non-string)', () => {
    expect(() => {
      new Building({ name: 123 });
    }).toThrow('Invalid name');
  });

  test('skips validation when validate = false', () => {
    const building = new Building({ name: 123 }, false);
    expect(building).toBeInstanceOf(Building);
    expect(building.name).toBe(123);
  });

  test('from() creates Building from prismaBuilding object', () => {
    const prismaBuilding = {
      id: 'abc123',
      name: 'Warehouse',
    };

    const building = Building.from(prismaBuilding);
    expect(building).toBeInstanceOf(Building);
    expect(building.id).toBe('abc123');
    expect(building.name).toBe('Warehouse');
  });
});
