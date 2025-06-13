/**
 * This file contains the configuration for the assets used in the game.
 * Each asset has properties such as width, height, cost, and energy.
 * You can add or modify assets as needed.
 * @module AssetConfig
 * @description Configuration for game assets including their dimensions, cost, and energy production.
 */

/**
 * @typedef {Object} Asset
 * @property {number} width - The width of the asset in grid units.
 * @property {number} height - The height of the asset in grid units.
 * @property {number} cost - The cost of the asset in coins.
 * @property {number} energy - The energy produced by the asset (0 if it does not produce energy).
 * */
export const ASSETS = {
  Zonnepaneel: {
    width: 4,
    height: 6,
    cost: 20,
    energy: 1,
  },
  Windmolen: {
    width: 6,
    height: 10,
    cost: 20,
    energy: 1,
  },
  Waterrad: {
    width: 7,
    height: 8,
    cost: 20,
    energy: 1,
  },
  Kerncentrale: {
    width: 12,
    height: 10,
    cost: 20,
    energy: 250,
  },
  Eik: {
    width: 5,
    height: 6,
    cost: 10,
    energy: 0,
  },
  Beuk: {
    width: 4,
    height: 5,
    cost: 10,
    energy: 0,
  },
  Buxus: {
    width: 2,
    height: 4,
    cost: 10,
    energy: 0,
  },
  Hulst: {
    width: 3,
    height: 3,
    cost: 10,
    energy: 0,
  },
};
