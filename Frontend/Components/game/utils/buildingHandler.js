/**
 * @module buildingHandler
 * @description Handles building interactions, upgrades, and energy toggling in the game.
 * This module provides functions to initialize buildings, make them interactive, handle upgrades, and toggle energy usage.
 */

import { BuildingRegistry } from "./buildingRegistry.js";
import { BUILDING_DEFINITIONS } from "./buildingDefinitions.js";
import {
  upgradeBuilding,
  toggleGameBuildingRunsOnGreen,
} from "../service/gameService.js";
import { handleAchievements } from "./achievementHandler.js";
import {
  calculateTotalGreyProduction,
  calculateTotalGreyCost,
} from "./gameDataHelpers.js";

/**
 * Initializes the building registry in the given scene.
 * This function creates a new BuildingRegistry and populates it with predefined building definitions.
 * @param {Phaser.Scene} scene - The Phaser scene where the building registry will be initialized.
 */
export function initializeBuildingRegistry(scene) {
  scene.buildingRegistry = new BuildingRegistry();

  BUILDING_DEFINITIONS.forEach((buildingDef) => {
    scene.buildingRegistry.createBuilding(
      buildingDef.name,
      scene.map,
      ...buildingDef.layers
    );
  });
}

/** * Makes all buildings in the scene interactive.
 * This function iterates through the buildings registered in the scene and adds a rectangle
 * over each building's tile selection area.
 * Each rectangle is set to be interactive, allowing players to click on buildings.
 * @param {Phaser.Scene} scene - The Phaser scene where buildings will be made interactive.
 * @description Each rectangle is clickable and emits a "buildingClicked" event with the building's ID or name.
 * If the building data is found, it emits the building's ID; otherwise, it logs a warning.
 */
export function makeBuildingsInteractive(scene) {
  const tileW = scene.map.tileWidth;
  const tileH = scene.map.tileHeight;

  for (const [
    buildingName,
    tileSelection,
  ] of scene.buildingRegistry.buildings.entries()) {
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    for (const [_layerName, data] of tileSelection.originalTiles.entries()) {
      data.tiles.forEach((tile) => {
        minX = Math.min(minX, tile.x);
        minY = Math.min(minY, tile.y);
        maxX = Math.max(maxX, tile.x);
        maxY = Math.max(maxY, tile.y);
      });
    }

    if (minX !== Infinity) {
      scene.add
        .rectangle(
          minX * tileW,
          minY * tileH,
          (maxX - minX + 1) * tileW,
          (maxY - minY + 1) * tileH,
          0x0000ff,
          0.0
        )
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          scene.isDragging = false;

          const buildingList = scene.sys.game.buildingData || [];
          const matched = buildingList.find(
            (b) =>
              b.name === buildingName ||
              (b.building && b.building.name === buildingName)
          );

          if (matched) {
            scene.game.events.emit("buildingClicked", matched.id);
          } else {
            console.warn(`No building data found for ${buildingName}`);
            scene.game.events.emit("buildingClicked", buildingName);
          }
        });
    }
  }
}

/**
 * Sets the color of a building based on its energy usage.
 * If the building runs on green energy, it removes any grayscale effect.
 * If it runs on grey energy, it applies a grayscale effect.
 * @param {Phaser.Scene} scene - The Phaser scene containing the building registry.
 * @param {Object} buildingObj - The building object containing its properties.
 * @description This function retrieves the building from the registry and applies the appropriate color effect.
 * If the building is not found in the registry, it does nothing.
 */
export function setBuildingColor(scene, buildingObj) {
  const tileSel = scene.buildingRegistry.getBuilding(buildingObj.name);
  if (!tileSel) return;

  if (buildingObj.runsOnGreen) {
    tileSel.removeGrayscale();
  } else {
    tileSel.applyGrayscale(1);
  }
}

/**
 * Handles the upgrade request for a building.
 * This function checks if the player has enough coins to upgrade the building,
 * shows a confirmation dialog, and processes the upgrade if confirmed.
 * @param {Phaser.Scene} scene - The Phaser scene where the building is located.
 * @param {number} gameBuildingId - The ID of the building to upgrade.
 * @param {number} finalUpgradeCost - The final cost of the upgrade, potentially penalized.
 * @returns {Promise<void>} A promise that resolves when the upgrade process is complete.
 * @description
 * 1) Finds the building object in the scene's building data.
 * 2) Checks the current level and calculates the next level.
 * 3) Retrieves the base upgrade cost from the building object.
 * 4) Checks the player's current coins.
 * 5) If the penalized cost would overdraft too far, shows an error message.
 * 6) Shows a confirmation dialog with the final upgrade cost.
 * 7) If confirmed, calls the `upgradeBuilding` service with the building ID and final cost.
 * 8) Updates the building object with the response from the service.
 * 9) Waits for stats to update and refreshes the building detail panel.
 */
export async function handleUpgradeRequest(
  scene,
  gameBuildingId,
  finalUpgradeCost
) {
  // 1) Find the building object as before
  const buildingList = scene.sys.game.buildingData || [];
  const buildingObj = buildingList.find((b) => b.id === gameBuildingId);
  if (!buildingObj) return;

  const currentLevel = buildingObj.level.level;
  const nextLevel = currentLevel + 1;

  // 2) baseUpgradeCost for reference (if you still need it elsewhere)
  const baseUpgradeCost = buildingObj.level.upgradeCost;

  // 3) Pull current player coins
  const currentCoins = scene.sys.game.currency?.coins ?? 0;

  // 4) Show an error if even the penalized cost would overdraft too far
  //    (based on your original < -100 logic; adjust as needed)
  if (currentCoins - finalUpgradeCost < -100) {
    scene.showError(
      `Je hebt niet genoeg coins om naar niveau ${nextLevel} te gaan. Je kan niet meer lenen.`
    );
    return;
  }

  let msg;
  // 5) Show the confirmation using finalUpgradeCost (not baseUpgradeCost)
  if (currentCoins - finalUpgradeCost < 0) {
    msg = `Je krijgt een extra kost van 10% omdat je al schulden hebt. Wil je dit gebouw upgraden naar niveau ${nextLevel} voor ${finalUpgradeCost} coins?`;
  } else {
    msg = `Wil je dit gebouw upgraden naar niveau ${nextLevel} voor ${finalUpgradeCost} coins?`;
  }

  scene.showConfirmation(msg, async (confirmed) => {
    if (!confirmed) return;

    try {
      // 6) Pass finalUpgradeCost into your upgradeBuilding call
      const response = await upgradeBuilding(
        gameBuildingId,
        {
          nextLevel: nextLevel,
          cost: finalUpgradeCost, // <–– send penalized cost
        },
        scene.sys.game.token
      );

      // 7) Update buildingObj locally as before
      Object.assign(buildingObj, response.gameBuilding);

      handleAchievements(response, window.gameContainer);

      // 8) Wait for stats to update, then refresh the detail panel
      await new Promise((resolve) => {
        const statsUpdateListener = () => {
          resolve();
          scene.game.events.off("statsUpdateComplete", statsUpdateListener);
        };
        scene.game.events.on("statsUpdateComplete", statsUpdateListener);
        scene.game.events.emit("forceStatsUpdate");
      });

      document.dispatchEvent(
        new CustomEvent("scene:refresh-detail", {
          detail: { type: "building", id: gameBuildingId },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error("Error upgrading building in scene:", err);
      scene.showError("Kon gebouw niet upgraden: " + err.message);
    }
  });
}

/**
 * Handles the toggle energy request for a building.
 * This function checks if the building can switch between green and grey energy,
 * and performs the toggle operation if conditions are met.
 * @param {Phaser.Scene} scene - The Phaser scene where the building is located.
 * @param {number} gameBuildingId - The ID of the building to toggle energy for.
 * @returns {Promise<void>} A promise that resolves when the toggle operation is complete.
 * @description
 * 1) Finds the building object in the scene's building data.
 * 2) Checks the energy cost for the building.
 * 3) Retrieves the available green energy and grey energy production/use.
 * 4) If the building runs on grey energy, checks if enough green energy is available.
 * 5) If the building runs on green energy, checks if enough grey energy is available.
 * 6) If conditions are met, calls the `toggleGameBuildingRunsOnGreen` service.
 * 7) Updates the building object with the response from the service.
 * 8) Sets the building color based on the new energy state.
 * 9) Handles achievements and forces a stats update.
 * 10) Refreshes the detail panel for the building.
 */
export async function handleToggleEnergyRequest(scene, gameBuildingId) {
  const buildingList = scene.sys.game.buildingData || [];
  const buildingObj = buildingList.find((b) => b.id === gameBuildingId);
  if (!buildingObj) return;

  const energyCost =
    buildingObj.level?.energyCost || buildingObj.buildingLevel?.energyCost || 0;
  const availableGreenEnergy = scene.sys.game.currency?.greenEnergy || 0;
  // const availableGreyEnergy = scene.sys.game.currency?.greyEnergy || 0;
  const gamebuildingRunsOnGreen = buildingObj.runsOnGreen;
  const assets = scene.sys.game.assetData || [];
  const greyEnergyProduction = calculateTotalGreyProduction(assets);
  const greyEnergyUse = calculateTotalGreyCost(buildingList);

  console.log("Available green energy:", availableGreenEnergy);
  console.log("Building energy cost:", energyCost);
  console.log("Available grey energy production:", greyEnergyProduction);
  console.log("Available grey energy use:", greyEnergyUse);
  console.log(
    `greyEnergyProduction - greyEnergyUse > energyCost: ${
      greyEnergyProduction - greyEnergyUse > energyCost
    }`
  );
  // console.log(gamebuilding)

  if (!gamebuildingRunsOnGreen) {
    if (energyCost / 6 < availableGreenEnergy) {
      try {
        const response = await toggleGameBuildingRunsOnGreen(
          gameBuildingId,
          scene.sys.game.token
        );

        Object.assign(buildingObj, response.gameBuilding);

        setBuildingColor(scene, buildingObj);
        handleAchievements(response, window.gameContainer);
        scene.game.events.emit("forceStatsUpdate");

        // Refresh the detail panel for this building
        document.dispatchEvent(
          new CustomEvent("scene:refresh-detail", {
            detail: { type: "building", id: gameBuildingId },
            bubbles: true,
            composed: true,
          })
        );
      } catch (err) {
        console.error("Error toggling building energy in scene:", err);
        scene.showError("Kon gebouw niet updaten: " + err.message);
      }
    } else {
      scene.showError(
        "Niet genoeg groene energie beschikbaar om deze actie uit te voeren."
      );
    }
  } else {
    if (greyEnergyProduction - greyEnergyUse > energyCost) {
      try {
        const response = await toggleGameBuildingRunsOnGreen(
          gameBuildingId,
          scene.sys.game.token
        );

        Object.assign(buildingObj, response);

        setBuildingColor(scene, buildingObj);
        handleAchievements(response, scene.game.canvas);
        scene.game.events.emit("forceStatsUpdate");

        // Refresh the detail panel for this building
        document.dispatchEvent(
          new CustomEvent("scene:refresh-detail", {
            detail: { type: "building", id: gameBuildingId },
            bubbles: true,
            composed: true,
          })
        );
      } catch (err) {
        console.error("Error toggling building energy in scene:", err);
        scene.showError("Kon gebouw niet updaten: " + err.message);
      }
    } else {
      scene.showError(
        "Niet genoeg grijze energie beschikbaar om deze actie uit te voeren."
      );
    }
  }
}
