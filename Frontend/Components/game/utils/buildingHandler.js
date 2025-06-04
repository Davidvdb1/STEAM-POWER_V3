// src/utils/buildingHandler.js

import { BuildingRegistry } from "./buildingRegistry.js";
import { BUILDING_DEFINITIONS } from "./buildingConfig.js";
import {
  upgradeBuilding,
  toggleGameBuildingRunsOnGreen,
} from "../service/gameService.js";
import { handleAchievements } from "./achievementHandler.js";

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

export function setBuildingColor(scene, buildingObj) {
  const tileSel = scene.buildingRegistry.getBuilding(buildingObj.name);
  if (!tileSel) return;

  if (buildingObj.runsOnGreen) {
    tileSel.removeGrayscale();
  } else {
    tileSel.applyGrayscale(1);
  }
}

export async function handleUpgradeRequest(scene, gameBuildingId) {
  const buildingList = scene.sys.game.buildingData || [];
  const buildingObj = buildingList.find((b) => b.id === gameBuildingId);
  if (!buildingObj) return;

  const currentLevel = buildingObj.level.level;
  const nextLevel = currentLevel + 1;
  const upgCost = buildingObj.level.upgradeCost;
  const msg = `Wil je dit gebouw upgraden naar niveau ${nextLevel} voor ${upgCost} coins?`;

  scene.showConfirmation(msg, async (confirmed) => {
    if (!confirmed) return;

    try {
      const response = await upgradeBuilding(
        gameBuildingId,
        { nextLevel: currentLevel + 1 },
        scene.sys.game.token
      );

      Object.assign(buildingObj, response.gameBuilding);

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
      console.error("Error upgrading building in scene:", err);
      scene.showError("Kon gebouw niet upgraden: " + err.message);
    }
  });
}

export async function handleToggleEnergyRequest(scene, gameBuildingId) {
  const buildingList = scene.sys.game.buildingData || [];
  const buildingObj = buildingList.find((b) => b.id === gameBuildingId);
  if (!buildingObj) return;

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
}
