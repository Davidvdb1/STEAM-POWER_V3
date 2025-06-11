/**
 * @module currencyHelpers
 * @description Contains utility functions for handling currency updates in the game.
 * These functions are used to compute and update the player's currency state,
 * particularly focusing on green energy, grey energy, coins, and score.
 */

import {
  calculateTotalGreyProduction,
  calculateTotalGreyCost,
} from "../utils/gameDataHelpers.js";
import { computeUpdatedGreenEnergy } from "./gameDataHelpers.js";

/**
 * Builds an updated currency object based on the old currency, total green cost,
 * plus the full asset- and building-data to compute grey‐energy shortfalls.
 *
 * @param {Object} oldCurrency      – previous currency state
 * @param {number} totalGreenCost   – green‐energy cost this tick
 * @param {Array}  assets           – full list of user assets
 * @param {Array}  buildingList     – transformed building data
 * @return {Object} { id, payload: { greenEnergy, greyEnergy, coins, score } }
 */
export function buildUpdatedCurrency(
  oldCurrency,
  totalGreenCost,
  assets,
  buildingList
) {
  // total grey‐energy produced this tick
  const greyEnergyProduction = calculateTotalGreyProduction(assets);
  // total grey‐energy consumed this tick
  const greyEnergyUse = calculateTotalGreyCost(buildingList);

  // if use > production, levy a “fine” (in coins)
  let fine = 0;
  if (greyEnergyProduction < greyEnergyUse) {
    fine = (greyEnergyUse - greyEnergyProduction) / 10;
  }

  // compute new green bank (using your existing helper)
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
      coins: oldCurrency.coins - fine,
      score: oldCurrency.score,
    },
  };
}
