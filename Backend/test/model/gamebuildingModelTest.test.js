const GameBuildings = require('../../model/gameBuildings');
const Building = require('../../model/building');
const BuildingLevel = require('../../model/buildingLevel');

describe('GameBuildings model tests', () => {
  const validBuilding = new Building({ name: 'Solar Plant' });
  const validBuildingLevel = new BuildingLevel({
    level: 1,
    energyCost: 100,
    upgradeCost: 200,
    scoreDeduction: 5
  });

  const validData = {
    id: 'gb-1',
    gameStatisticsId: 'gs-123',
    checkpointId: 'cp-456',
    building: validBuilding,
    buildingLevel: validBuildingLevel,
    runsOnGreen: true,
  };

  test('creates GameBuildings with valid data', () => {
    const gb = new GameBuildings(validData);
    expect(gb).toBeInstanceOf(GameBuildings);
    expect(gb.building).toBe(validBuilding);
    expect(gb.buildingLevel).toBe(validBuildingLevel);
    expect(gb.runsOnGreen).toBe(true);
  });

  test('allows null building (optional)', () => {
    const gb = new GameBuildings({
      ...validData,
      building: null,
    });
    expect(gb.building).toBeNull();
  });

  test('throws error for invalid gameStatisticsId (not string)', () => {
    expect(() => {
      new GameBuildings({ ...validData, gameStatisticsId: 123 });
    }).toThrow('Invalid gameStatisticsId (must be a string)');
  });

  test('throws error for invalid checkpointId (not string)', () => {
    expect(() => {
      new GameBuildings({ ...validData, checkpointId: {} });
    }).toThrow('Invalid checkpointId (must be a string)');
  });

  test('throws error for invalid building (not instance)', () => {
    expect(() => {
      new GameBuildings({ ...validData, building: { name: 'Fake' } });
    }).toThrow('Invalid building (must be Building)');
  });

  test('throws error for invalid buildingLevel (not instance)', () => {
    expect(() => {
      new GameBuildings({ ...validData, buildingLevel: {} });
    }).toThrow('Invalid buildingLevel (must be BuildingLevel)');
  });

  test('throws error for invalid runsOnGreen (not boolean)', () => {
    expect(() => {
      new GameBuildings({ ...validData, runsOnGreen: 'yes' });
    }).toThrow('Invalid runsOnGreen (must be a boolean)');
  });

  test('skips validation when validate = false', () => {
    const gb = new GameBuildings(
      { ...validData, buildingLevel: {} },
      false
    );
    expect(gb.buildingLevel).toEqual({});
  });

  test('from() creates GameBuildings from valid prisma object', () => {
    const prismaGB = {
      id: 'gb-2',
      gameStatisticsId: 'gs-99',
      checkpointId: 'cp-99',
      runsOnGreen: true,
      building: { id: 'b-1', name: 'Windmill' },
      buildingLevel: {
        id: 'bl-1',
        level: 2,
        energyCost: 150,
        upgradeCost: 300,
        scoreDeduction: 8,
      },
    };

    const gb = GameBuildings.from(prismaGB);
    expect(gb).toBeInstanceOf(GameBuildings);
    expect(gb.id).toBe('gb-2');
    expect(gb.building).toBeInstanceOf(Building);
    expect(gb.building.name).toBe('Windmill');
    expect(gb.buildingLevel).toBeInstanceOf(BuildingLevel);
    expect(gb.buildingLevel.level).toBe(2);
  });
});
