/**
 * @module gameDataHelpers
 * @description Contains utility functions for transforming and calculating game data,
 * including building and asset data transformations, cost calculations, and currency display payloads.
 * These functions are used to prepare data for display in the game UI and to compute various statistics related to buildings and assets.
 */

/**
 * Transforms raw game building data into a structured format.
 * @param {Array<Object>} gameBuildings - Array of raw game building objects.
 * @returns {Array<Object>} An array of transformed building objects with id, name, building, level, and runsOnGreen properties.
 */
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

/**
 * Calculates the total grey energy cost from a list of buildings.
 * @param {Array<Object>} buildings - Array of building objects, each with a level containing energyCost.
 * @return {number} The total grey energy cost for buildings that do not run on green energy.
 */
export function calculateTotalGreyCost(buildings = []) {
  return buildings
    .filter((b) => b.runsOnGreen === false)
    .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);
}

/** * Calculates the total grey energy production from a list of assets.
 * @param {Array<Object>} assets - Array of asset objects, each with a type and energy property.
 * @return {number} The total grey energy production from assets of type "Kerncentrale".
 */
export function calculateTotalGreyProduction(assets = []) {
  return assets
    .filter((a) => a.type === "Kerncentrale")
    .reduce((sum, a) => sum + (a.energy || 0), 0);
}
/** * Calculates the percentage of buildings that run on green energy.
 * @param {Array<Object>} buildings - Array of building objects, each with a runsOnGreen property.
 * @return {number} The percentage of buildings that run on green energy, rounded to the nearest integer.
 */
export function calculateGreenBuildingPercentage(buildings = []) {
  const total = buildings.length;
  if (total === 0) return 0;
  const greenCount = buildings.filter((b) => b.runsOnGreen).length;
  return Math.round((greenCount / total) * 100);
}

/** * Builds a payload for displaying currency information in the game UI.
 * This function aggregates data from buildings, assets, and currency to create a structured payload
 * that includes grey energy costs, green energy, coins, score, green building percentage,
 * multipliers for different components, and total grey production.
 * @param {Object} params - Parameters containing buildings, assets, currency, and component multipliers.
 * @returns {Object} A structured payload object for displaying currency information.
 */
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
    totalGreyProduction,
  };
}

/** * Calculates the total green energy cost from a list of buildings.
 * @param {Array<Object>} buildings - Array of building objects, each with a level containing energyCost.
 * @return {number} The total green energy cost for buildings that run on green energy.
 */
export function calculateTotalGreenCost(buildings = []) {
  return buildings
    .filter((b) => b.runsOnGreen === true)
    .reduce((sum, b) => sum + (b.level.energyCost || 0), 0);
}

/** * Calculates the total green energy production from a list of assets.
 * This function sums the energy produced by assets of type "Windmolen", "Waterrad", and "Zonnepaneel",
 * and multiplies the result by a microbit value to adjust for game mechanics.
 * @param {Array<Object>} assets - Array of asset objects, each with a type and energy property.
 * @param {number} microbitValue - A multiplier for the total green production, default is 1.
 * @return {number} The total green energy production adjusted by the microbit value.
 */
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

/** * Computes the updated green energy based on the old green energy,
 * total green production, and total green cost.
 * @param {Object} params - Parameters containing old green energy, total green production, and total green cost.
 * @returns {number} The updated green energy value.
 */
export function computeUpdatedGreenEnergy({
  oldGreenEnergy = 0,
  totalGreenProduction = 0,
  totalGreenCost = 0,
}) {
  return oldGreenEnergy + totalGreenProduction - totalGreenCost;
}

/** * Unpacks a raw checkpoint payload into a structured format.
 * This function extracts relevant data from the raw checkpoint object,
 * including game statistics ID, currency ID, asset data, and building data.
 * @param {Object} rawCheckpoint - The raw checkpoint object containing game state data.
 * @returns {Object} An object containing unpacked game statistics ID, currency ID,
 * asset data, and transformed building data.
 */
export function unpackCheckpointPayload(rawCheckpoint) {
  return {
    gameStatisticsId: rawCheckpoint.id,
    currencyId: rawCheckpoint.currency.id,
    assetData: rawCheckpoint.assets,
    buildingData: transformBuildingData(rawCheckpoint.gameBuildings),
    gameBuildingsRaw: rawCheckpoint.gameBuildings,
  };
}
