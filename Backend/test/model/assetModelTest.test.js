const Asset = require('../../model/asset');

describe('Asset model tests', () => {
  const validData = {
    buildCost: 100,
    destroyCost: 50,
    energy: 25,
    xLocation: 10,
    yLocation: 20,
    xSize: 2,
    ySize: 2,
    type: 'Zonnepaneel',
  };

  test('creates Asset with valid data', () => {
    const asset = new Asset(validData);
    expect(asset).toBeInstanceOf(Asset);
    expect(asset.buildCost).toBe(100);
    expect(asset.type).toBe('Zonnepaneel');
  });

  test('throws error for invalid buildCost', () => {
    expect(() => {
      new Asset({ ...validData, buildCost: 'not a number' });
    }).toThrow('Invalid buildCost');
  });

  test('throws error for invalid destroyCost', () => {
    expect(() => {
      new Asset({ ...validData, destroyCost: null });
    }).toThrow('Invalid destroyCost');
  });

  test('throws error for invalid energy', () => {
    expect(() => {
      new Asset({ ...validData, energy: 'high' });
    }).toThrow('Invalid energy');
  });

  test('throws error for invalid xLocation', () => {
    expect(() => {
      new Asset({ ...validData, xLocation: [] });
    }).toThrow('Invalid xLocation');
  });

  test('throws error for invalid yLocation', () => {
    expect(() => {
      new Asset({ ...validData, yLocation: undefined });
    }).toThrow('Invalid yLocation');
  });

  test('throws error for invalid xSize', () => {
    expect(() => {
      new Asset({ ...validData, xSize: 'wide' });
    }).toThrow('Invalid xSize');
  });

  test('throws error for invalid ySize', () => {
    expect(() => {
      new Asset({ ...validData, ySize: false });
    }).toThrow('Invalid ySize');
  });

  test('throws error for invalid type', () => {
    expect(() => {
      new Asset({ ...validData, type: 123 });
    }).toThrow('Invalid type');
  });

  test('skips validation if validate = false', () => {
    expect(() => {
      new Asset({ ...validData, buildCost: 'invalid' }, false);
    }).not.toThrow();
  });

  test('from() creates Asset from prismaAsset', () => {
    const prismaAsset = { ...validData, id: 99 };
    const asset = Asset.from(prismaAsset);
    expect(asset).toBeInstanceOf(Asset);
    expect(asset.id).toBe(99);
  });
});
