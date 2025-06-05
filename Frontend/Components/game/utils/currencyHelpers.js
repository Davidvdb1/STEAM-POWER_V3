import { computeUpdatedGreenEnergy } from "./gameDataHelpers.js";

export function buildUpdatedCurrency(
  oldCurrency,
  totalGreenCost
) {
  const newGreen = computeUpdatedGreenEnergy({
    oldGreenEnergy: oldCurrency.greenEnergy,
    totalGreenProduction: 0,
    totalGreenCost,
  });

  return {
    id: oldCurrency.id,
    payload: {
      greenEnergy: newGreen,
      greyEnergy: oldCurrency.greyEnergy,
      coins: oldCurrency.coins,
      score: oldCurrency.score,
    },
  };
}
