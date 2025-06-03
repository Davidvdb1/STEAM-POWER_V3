import { computeUpdatedGreenEnergy } from "./gameDataHelpers.js";

export function buildUpdatedCurrency(
  oldCurrency,
  totalGreenProduction,
  totalGreenCost
) {
  const newGreen = computeUpdatedGreenEnergy({
    oldGreenEnergy: oldCurrency.greenEnergy,
    totalGreenProduction,
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
