const Currency = require('../../model/currency'); 

describe('Currency model tests', () => {
  const validData = {
    greenEnergy: 100,
    greyEnergy: 50,
    coins: 2000,
  };

  test('creates Currency with valid data', () => {
    const currency = new Currency(validData);
    expect(currency).toBeInstanceOf(Currency);
    expect(currency.greenEnergy).toBe(100);
    expect(currency.greyEnergy).toBe(50);
    expect(currency.coins).toBe(2000);
  });

  test('creates Currency with default values', () => {
    const currency = new Currency({});
    expect(currency.greenEnergy).toBe(Currency.DEFAULT_GREEN_ENERGY);
    expect(currency.greyEnergy).toBe(Currency.DEFAULT_GREY_ENERGY);
    expect(currency.coins).toBe(Currency.STARTING_COINS);
  });

  test('throws error for invalid greenEnergy', () => {
    expect(() => {
      new Currency({ ...validData, greenEnergy: 'not a number' });
    }).toThrow('Invalid greenEnergy');
  });

  test('throws error for invalid greyEnergy', () => {
    expect(() => {
      new Currency({ ...validData, greyEnergy: null });
    }).toThrow('Invalid greyEnergy');
  });

  test('throws error for invalid coins', () => {
    expect(() => {
      new Currency({ ...validData, coins: {} });
    }).toThrow('Invalid coins');
  });

  test('skips validation when validate = false', () => {
    expect(() => {
      new Currency({ greenEnergy: 'invalid' }, false);
    }).not.toThrow();
  });

  test('from() creates Currency from prismaCurrency object', () => {
    const prismaCurrency = {
      id: 77,
      greenEnergy: 10,
      greyEnergy: 5,
      coins: 500
    };

    const currency = Currency.from(prismaCurrency);
    expect(currency).toBeInstanceOf(Currency);
    expect(currency.id).toBe(77);
    expect(currency.greenEnergy).toBe(10);
    expect(currency.greyEnergy).toBe(5);
    expect(currency.coins).toBe(500);
  });
});
