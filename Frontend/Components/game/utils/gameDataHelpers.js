//Components\game\utils\gameDataHelpers.js
export function transformBuildingData(gameBuildings) {
  if (!gameBuildings || !Array.isArray(gameBuildings)) return [];

  return gameBuildings.map((gb) => ({
    id: gb.id,
    name: gb.building ? gb.building.name : "Unknown Building",
    building: gb.building,
    level: gb.buildingLevel,
    runsOnGreen: gb.runsOnGreen,
  }));
}

export function calculateTotalGreyCost(buildings = []) {
  return buildings
    .filter((b) => b.runsOnGreen === false)
    .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);
}

export function calculateTotalGreyProduction(assets = []) {
  return assets
    .filter((a) => a.type === "Kerncentrale")
    .reduce((sum, a) => sum + (a.energy || 0), 0);
}

export function calculateGreenBuildingPercentage(buildings = []) {
  const total = buildings.length;
  if (total === 0) return 0;
  const greenCount = buildings.filter((b) => b.runsOnGreen).length;
  return Math.round((greenCount / total) * 100);
}

export function buildCurrencyDisplayPayload({
  buildings = [],
  assets = [],
  currency = { greenEnergy: 0, greyEnergy: 0, coins: 0, score: 0 },
  componentMultipliers = { solar: 1, wind: 1, water: 1 },
}) {
  const totalGreyCost = calculateTotalGreyCost(buildings);
  const totalGreyProduction = calculateTotalGreyProduction(assets);
  const greenBuildingPercentage = calculateGreenBuildingPercentage(buildings);

  return {
    greyEnergy: `${totalGreyCost} / ${totalGreyProduction}`,
    greenEnergy: currency.greenEnergy,
    coins: currency.coins,
    score: currency.score,
    greenBuildingPercentage,
    multipliers: componentMultipliers,
    totalGreyProduction
  };
}

export function calculateTotalGreenCost(buildings = []) {
  return buildings
    .filter((b) => b.runsOnGreen === true)
    .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);
}

export function calculateTotalGreenProduction(assets = [], microbitValue = 1) {
  const rawSum = assets
    .filter(
      (a) =>
        a.type === "Windmolen" ||
        a.type === "Waterrad" ||
        a.type === "Zonnepaneel"
    )
    .reduce((sum, a) => sum + (a.energy || 0), 0);
  return rawSum * microbitValue;
}

export function computeUpdatedGreenEnergy({
  oldGreenEnergy = 0,
  totalGreenProduction = 0,
  totalGreenCost = 0,
}) {
  return oldGreenEnergy + totalGreenProduction - totalGreenCost;
}

export function unpackCheckpointPayload(rawCheckpoint) {
  return {
    gameStatisticsId: rawCheckpoint.id,
    currencyId: rawCheckpoint.currency.id,
    assetData: rawCheckpoint.assets,
    buildingData: transformBuildingData(rawCheckpoint.gameBuildings),
    gameBuildingsRaw: rawCheckpoint.gameBuildings,
  };
}
