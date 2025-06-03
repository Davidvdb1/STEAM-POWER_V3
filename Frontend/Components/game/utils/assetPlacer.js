import { addAsset } from "../service/gameService.js";
import { handleAchievements } from "./achievementHandler.js";
import { ASSETS } from "./assetConfig.js";

/**
 * Checks if an asset can be placed at specified coordinates
 * 
 * @function canPlaceAsset
 * @memberof game.utils.assetPlacer
 * @param {Object} tileAssetMap - Map of occupied tiles
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @returns {{canPlace: boolean, reason?: string}} 
 *  An object indicating whether the asset can be placed.
 *  If placement is not possible, a reason is provided.
 */
function canPlaceAsset(tileAssetMap, tx, ty, size) {
  // Check corners first (most likely to fail)
  if (
    tileAssetMap[`${tx},${ty}`] 
    || tileAssetMap[`${tx + size.width - 1},${ty}`]
    || tileAssetMap[`${tx},${ty + size.height - 1}`]
    || tileAssetMap[`${tx + size.width - 1},${ty + size.height - 1}`]
  ) {
    return false;
  }
  
  // Check remaining tiles if corners are clear
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      // Skip corners we already checked
      if ((dx === 0 || dx === size.width - 1) && (dy === 0 || dy === size.height - 1)) {
        continue;
      }

      if (tileAssetMap[`${tx + dx},${ty + dy}`]) {
        return {
          canPlace: false,
          reason: "Deze locatie is al bezet"
        };
      }
    }
  }

  return { canPlace: true };
}


/**
 * Marks tiles as occupied in the tile asset map
 * 
 * @function reserveTiles
 * @memberof game.utils.assetPlacer
 * @param {Object} tileAssetMap - Map of occupied tiles
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @returns {void} This function doesn't return a value
 */
export function reserveTiles(tileAssetMap, tx, ty, size) {
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      tileAssetMap[`${tx + dx},${ty + dy}`] = true;
    }
  }
}


/**
 * Releases occupied tiles so they can be reused
 * 
 * @function releaseTiles
 * @memberof game.utils.assetPlacer
 * @param {Object} tileAssetMap - Map of occupied tiles
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @returns {void} This function doesn't return a value
 */
export function releaseTiles(tileAssetMap, tx, ty, size) {
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      delete tileAssetMap[`${tx + dx},${ty + dy}`];
    }
  }
}


/**
 * Verifies if an asset can be placed at specified location
 * 
 * @function verifyAssetPlacement
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @returns {Object} Result with canPlace boolean and reason
 */
function verifyAssetPlacement(scene, type, tx, ty) {
  // Check if asset type is valid
  const size = ASSETS[type];
  if (!size) {
    return { 
      canPlace: false, 
      reason: `Onbekend type: ${type}` 
    };
  }

  // Check if the asset is placed on valid tiles for its type
  const placedOnValidTiles = verifyAssetTypePlacement(scene, type, size, tx, ty);
  if (!placedOnValidTiles.canPlace) {
    return placedOnValidTiles;
  }

  // Check if the asset is within map bounds
  if (tx < 0 || ty < 0 
      || tx + size.width > scene.map.width 
      || ty + size.height > scene.map.height) {
    return {
      canPlace: false,
      reason: `Plaats je ${type.toLowerCase()} binnen de kaartgrenzen`
    };
  }

  // Check if the space is already occupied
  const isSpaceAvailable = canPlaceAsset(scene.tileAssetMap, tx, ty, size);
  if (!isSpaceAvailable) {
    return {
      canPlace: false,
      reason: "Deze locatie is al bezet"
    };
  }
  
  // All checks passed
  return { canPlace: true };
}


/**
 * Verifies if a water mill can be placed at the specified location.
 * Water mills can only be placed along specific water edges
 * 
 * @function checkWaterMillPlacement
 * @memberof game.utils.assetPlacer
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @returns {{canPlace: boolean, reason?: string}} 
 *  An object indicating whether the asset can be placed.
 *  If placement is not possible, a reason is provided.
 */
function verifyWaterMillPlacement(size, tx, ty) {
  const validRanges = [
    { startX: 62, endX: 75, y: 9 },
    { startX: 92, endX: 125, y: 14 }
  ];
  
  // Check if placement is along one of the valid water edges
  // and ensure the full width of the mill fits within the valid range
  for (const { startX, endX, y } of validRanges) {
    if (ty+size.height-1 === y && tx >= startX && tx+size.width-1 <= endX) {
      return { canPlace: true };
    }
  }
  
  // Return false with reason if no valid placement found
  return { 
    canPlace: false, 
    reason: "Waterrad kan alleen langs het water geplaatst worden" 
  };
}


/**
 * Verifies whether an asset can be placed on tiles with any of the specified indices
 *
 * @function verifyAssetPlacedOnTileIndices
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number|number[]} validIndices - Single index or array of valid tile indices the asset can be placed on.
 * @returns {{canPlace: boolean, reason?: string}} 
 *  An object indicating whether the asset can be placed.
 *  If placement is not possible, a reason is provided.
 */
function verifyAssetPlacedOnTileIndices(scene, type, size, tx, ty, validIndices) {
  // Convert single index to array for consistent handling
  const indices = Array.isArray(validIndices) ? validIndices : [validIndices];
  
  // Check all tiles the asset would occupy
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      // Get current tile
      const tile = scene.layer1.getTileAt(tx+dx, ty+dy);
      // If no tile exists or its index is not in the valid indices, return false
      if (!tile?.index || !indices.includes(tile.index)) {
        return {
          canPlace: false,
          reason: `Een ${type.toLowerCase()} kan niet op dit terrein worden geplaatst`
        };
      }
    }
  }

  // If all tiles are in valid locations, return true
  return { canPlace: true };
}


/**
 * Verifies if an asset of a given type can be placed at the specified tile coordinates.
 *
 * @function verifyAssetTypePlacement
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @returns {{canPlace: boolean, reason?: string}} 
 *  An object indicating whether the asset can be placed.
 *  If placement is not possible, a reason is provided.
 */
function verifyAssetTypePlacement(scene, type, size, tx, ty) {
  switch (type) {
    case "Waterrad":
      // Water mills can only be placed along specific water edges
      return verifyWaterMillPlacement(size, tx, ty);

    case "Windmolen":
      // Check if the windmill is placed on either grass (9630) or water (9451, 44640) tiles
      return verifyAssetPlacedOnTileIndices(scene, type, size, tx, ty, [9630, 9451, 44640]);

    default:
      // For all other assets, check if they are placed on grass (9630) tiles
      return verifyAssetPlacedOnTileIndices(scene, type, size, tx, ty, 9630);
  }
}


/**
 * Draws a highlight showing if an asset can be placed
 * 
 * @function highlightPlacementArea
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void} This function doesn't return a value
 */
function highlightPlacementArea(scene, type, tx, ty, graphics) {
  const size = ASSETS[type];
  if (!size) return;
  
  // Clear previous highlight
  graphics.clear();
  
  // Calculate placement validity
  const canPlace = verifyAssetPlacement(scene, type, tx, ty).canPlace;
  
  // Set color based on validity
  graphics.fillStyle(canPlace ? 0x00ff00 : 0xff0000, 0.4);
  
  // Draw a single rectangle for the entire asset area
  graphics.fillRect(
    tx * scene.map.tileWidth,
    ty * scene.map.tileHeight,
    size.width * scene.map.tileWidth,
    size.height * scene.map.tileHeight
  );
}


/**
 * Adds the asset's image on the map to visually represent it
 * 
 * @function createAssetSprite
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {{width: number, height: number}} size - The dimensions of the asset to be placed.
 * @param {string} assetId - Asset ID from backend
 * @returns {Object} Created asset data
 */
export function createAssetSprite(scene, type, tx, ty, size, assetId) {
  const sprite = scene.add.image(
    tx * scene.map.tileWidth,
    ty * scene.map.tileHeight,
    type
  )
    .setOrigin(0)
    .setDisplaySize(
      size.width * scene.map.tileWidth,
      size.height * scene.map.tileHeight
    )
    .setInteractive()
    .on("pointerdown", () => scene.game.events.emit("assetClicked", assetId));
  
  // Reserve tiles in the map
  reserveTiles(scene.tileAssetMap, tx, ty, size);
  
  // Create and return the asset data
  return { id: assetId, image: sprite, tx, ty, size, type };
}


/**
 * Places an asset after backend confirmation
 * 
 * @function placeAsset
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Type of asset being placed
 * @param {number} tx - The x-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {number} ty - The y-coordinate (in tiles) where the asset's top-left corner will be placed.
 * @param {string} successMessage - Message to show on success
 * @returns {Promise<Object>} Result of the placement operation
 */
async function placeAsset(scene, type, tx, ty, successMessage = null) {
  const verification = verifyAssetPlacement(scene, type, tx, ty);
  if (!verification.canPlace) {
    scene.showError(`Kan hier niets plaatsen: ${verification.reason}`);
    return { success: false, reason: verification.reason };
  }

  const size = ASSETS[type];
  const cost = size.cost;
  const msg = `Wil je hier een ${type} plaatsen voor ${cost} coins?`;
  
  return new Promise(resolve => {
    scene.showConfirmation(msg, async confirmed => {
      if (!confirmed) {
        resolve({ success: false, reason: "User cancelled" });
        return;
      }
      
      try {
        const { gameStatisticsId, token } = scene.sys.game;

        // Add the asset to the backend (which will also handle currency updates)
        const response = await addAsset(
          gameStatisticsId,
          {
            buildCost:   cost,
            destroyCost: cost,
            energy:      size.energy,
            xLocation:   tx,
            yLocation:   ty,
            xSize:       size.width,
            ySize:       size.height,
            type
          },
          token
        );
        
        // Handle achievements
        handleAchievements(response, window.gameContainer);

        // Place the asset on the map
        const assetData = createAssetSprite(scene, type, tx, ty, size, response.asset.id);
        scene.assetObjects.push(assetData);
        
        // Show success message
        if (successMessage || successMessage === null) {
          scene.showError(successMessage || `${type} succesvol geplaatst!`);
        }
        
        resolve({ success: true, asset: response.asset, assetData });
      } catch (err) {
        scene.showError("Plaatsen mislukt: " + err.message);
        resolve({ success: false, reason: err.message });
      }
    });
  });
}


/**
 * Sets up drag and drop for asset placement
 * 
 * @function setupAssetDragAndDrop
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @returns {void} This function doesn't return a value
 */
export function setupAssetDragAndDrop(scene) {
  const canvas = scene.game.canvas;
  let currentType = null;

  canvas.addEventListener("dragenter", mouseEvent => {
    mouseEvent.preventDefault();
    try {
      currentType = mouseEvent.dataTransfer.getData("text/plain");
      scene.draggedAssetType = currentType;
    } catch {}
  });

  canvas.addEventListener("dragover", mouseEvent => {
    mouseEvent.preventDefault();
    const type = scene.draggedAssetType ?? currentType;
    if (!type) return;

    const [tx, ty] = getTileFromEvent(scene, mouseEvent);
    highlightPlacementArea(scene, type, tx, ty, scene.dragHighlight);
  });

  canvas.addEventListener("dragleave", () => {
    scene.dragHighlight.clear();
  });

  canvas.addEventListener("drop", async mouseEvent => {
    mouseEvent.preventDefault();
  
    try {
      const type = mouseEvent.dataTransfer.getData("text/plain");
      if (!type) {
        scene.showError("Kon het object niet herkennen. Probeer het opnieuw of herlaad de pagina.");
        return;
      }
      
      const [tx, ty] = getTileFromEvent(scene, mouseEvent);
      await placeAsset(scene, type, tx, ty);
    } catch (error) {
      scene.showError("Er is een probleem opgetreden. Probeer het opnieuw of herlaad de pagina.");
    } finally {
      scene.dragHighlight.clear();
      scene.draggedAssetType = null;
    }
  });
}


/**
 * Gets tile coordinates from mouse event
 * 
 * @function getTileFromEvent
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {Event} mouseEvent - Mouse event
 * @returns {number[]} Array with [tx, ty] coordinates
 */
function getTileFromEvent(scene, mouseEvent) {
  const rect   = scene.game.canvas.getBoundingClientRect();
  const scaleX = scene.game.config.width  / rect.width;
  const scaleY = scene.game.config.height / rect.height;
  const x      = (mouseEvent.clientX - rect.left) * scaleX;
  const y      = (mouseEvent.clientY - rect.top)  * scaleY;
  const world  = scene.cameras.main.getWorldPoint(x, y);
  return [
    Math.floor(world.x / scene.map.tileWidth),
    Math.floor(world.y / scene.map.tileHeight)
  ];
}
