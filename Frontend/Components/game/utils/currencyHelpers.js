/**
 * @module currencyHelpers
 * @description Contains utility functions for handling currency updates in the game.
 * These functions are used to compute and update the player's currency state,
 * particularly focusing on green energy, grey energy, coins, and score.
 */

import { computeUpdatedGreenEnergy } from "./gameDataHelpers.js";

/**
 * Builds an updated currency object based on the old currency and total green cost.
 * This function computes the new green energy based on the old currency's green energy,
 * the total green production, and the total green cost.
 * @param {Object} oldCurrency - The previous currency state containing green energy, grey energy, coins, and score.
 * @param {number} totalGreenCost - The total cost in green energy to be applied.
 * @return {Object} A new currency object with updated green energy, retaining the other properties from the old currency.
 */
export function buildUpdatedCurrency(oldCurrency, totalGreenCost) {
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
