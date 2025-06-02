import { addAsset, updateCurrency, getCurrencyById } from "../service/gameService.js";
import { handleAchievements } from "./achievementHandler.js";
import { ASSETS } from "./assetConfig.js";

/**
 * Checks if an asset can be placed at specified coordinates
 * 
 * @function canPlaceAsset
 * @memberof game.utils.assetPlacer
 * @param {Object} tileAssetMap - Map of occupied tiles
 * @param {number} tx - Target X coordinate (in tiles)
 * @param {number} ty - Target Y coordinate (in tiles)
 * @param {Object} size - Size of the asset
 * @returns {boolean} True if placement is possible
 */
export function canPlaceAsset(tileAssetMap, tx, ty, size) {
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
      if ((dx === 0 || dx === size.width - 1) && 
          (dy === 0 || dy === size.height - 1)) {
        continue;
      }
      
      if (tileAssetMap[`${tx + dx},${ty + dy}`]) {
        return false;
      }
    }
  }
  
  return true;
}


/**
 * Marks tiles as occupied in the tile asset map
 * 
 * @function reserveTiles
 * @memberof game.utils.assetPlacer
 * @param {Object} tileAssetMap - Map of occupied tiles
 * @param {number} tx - X coordinate (in tiles)
 * @param {number} ty - Y coordinate (in tiles)
 * @param {Object} size - Size of the asset
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
 * @param {number} tx - X coordinate (in tiles)
 * @param {number} ty - Y coordinate (in tiles)
 * @param {Object} size - Size of the asset
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
 * @param {string} type - Asset type
 * @param {number} tx - Tile x coordinate
 * @param {number} ty - Tile y coordinate
 * @returns {Object} Result with canPlace boolean and reason
 */
export function verifyAssetPlacement(scene, type, tx, ty) {
  // Check if asset type is valid
  const size = ASSETS[type];
  if (!size) {
    return { 
      canPlace: false, 
      reason: `Onbekend type: ${type}` 
    };
  }

  // Check if within map bounds
  if (tx < 0 || ty < 0 
      || tx + size.width > scene.map.width 
      || ty + size.height > scene.map.height) {
    return {
      canPlace: false,
      reason: `Plaats je ${type.toLowerCase()} binnen de kaartgrenzen`
    };
  }

  // Check if space is already occupied
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
 * Draws a highlight showing if an asset can be placed
 * 
 * @function highlightPlacementArea
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Asset type
 * @param {number} tx - Tile x coordinate
 * @param {number} ty - Tile y coordinate
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 */
export function highlightPlacementArea(scene, type, tx, ty, graphics) {
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
 * Calculates updated currency after placing an asset
 * 
 * @function calculateUpdatedCurrency
 * @memberof game.utils.assetPlacer
 * @param {Object} currentCurrency - Current currency values
 * @param {string} assetType - Type of asset being placed
 * @param {number} cost - Cost of the asset
 * @returns {Object} Updated currency values
 */
export function calculateUpdatedCurrency(currentCurrency, assetType, cost) {
  // Make a copy to avoid modifying the original
  const updatedCurrency = { ...currentCurrency };
  
  // Deduct cost
  updatedCurrency.coins -= cost;
  
  // Add energy based on asset type
  if (assetType === "Kerncentrale") {
    updatedCurrency.greyEnergy += 100;
  } else if (["Windmolen", "Waterrad", "Zonnepaneel"].includes(assetType)) {
    updatedCurrency.greenEnergy += 50;
  }
  
  return updatedCurrency;
}


/**
 * Adds the asset's image on the map to visually represent it
 * 
 * @function createAssetSprite
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Asset type
 * @param {number} tx - Tile x coordinate
 * @param {number} ty - Tile y coordinate
 * @param {Object} size - Asset size
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
  const assetData = { 
    id: assetId, 
    image: sprite, 
    tx, 
    ty, 
    size, 
    type 
  };
  
  return assetData;
}


/**
 * Places an asset after backend confirmation
 * 
 * @function placeAsset
 * @memberof game.utils.assetPlacer
 * @param {Object} scene - The Phaser scene
 * @param {string} type - Asset type
 * @param {number} tx - Tile x coordinate
 * @param {number} ty - Tile y coordinate
 * @param {string} successMessage - Message to show on success
 * @returns {Promise<Object>} Result of the placement operation
 */
export async function placeAsset(scene, type, tx, ty, successMessage = null) {
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
        const { gameStatisticsId, token, currencyId } = scene.sys.game;
        const currentCurrency = await getCurrencyById(currencyId, token);

        // Update energy based on asset type
        const updatedCurrency = calculateUpdatedCurrency(currentCurrency, type, cost);

        // Call API to add asset
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
        
        // Update currency
        await updateCurrency(currencyId, updatedCurrency, token);
        
        // Show success message
        if (successMessage || successMessage === null) {
          scene.showError(successMessage || `${type} succesvol geplaatst!`);
        }
        
        resolve({ success: true, asset: response.asset, assetData });
      } catch (err) {
        console.error("Error placing asset:", err);
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
 */
export function setupAssetDragAndDrop(scene) {
  const canvas = scene.game.canvas;
  let currentType = null;

  canvas.addEventListener("dragenter", e => {
    e.preventDefault();
    try {
      currentType = e.dataTransfer.getData("text/plain");
      scene.draggedAssetType = currentType;
    } catch {}
  });

  canvas.addEventListener("dragover", e => {
    e.preventDefault();
    const type = scene.draggedAssetType || currentType;
    if (!type) return;

    const [tx, ty] = getTileFromEvent(scene, e);
    highlightPlacementArea(scene, type, tx, ty, scene.dragHighlight);
  });

  canvas.addEventListener("dragleave", () => {
    scene.dragHighlight.clear();
  });

  canvas.addEventListener("drop", async e => {
    e.preventDefault();
  
    try {
      const type = e.dataTransfer.getData("text/plain");
      if (!type) {
        scene.showError("Kon het object niet herkennen. Probeer het opnieuw of herlaad de pagina.");
        return;
      }
      
      const [tx, ty] = getTileFromEvent(scene, e);
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
 * @param {Event} e - Mouse event
 * @returns {number[]} Array with [tx, ty] coordinates
 */
function getTileFromEvent(scene, e) {
  const rect   = scene.game.canvas.getBoundingClientRect();
  const scaleX = scene.game.config.width  / rect.width;
  const scaleY = scene.game.config.height / rect.height;
  const x      = (e.clientX - rect.left) * scaleX;
  const y      = (e.clientY - rect.top)  * scaleY;
  const world  = scene.cameras.main.getWorldPoint(x, y);
  return [
    Math.floor(world.x / scene.map.tileWidth),
    Math.floor(world.y / scene.map.tileHeight)
  ];
}
