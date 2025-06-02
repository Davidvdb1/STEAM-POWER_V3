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
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      if (tileAssetMap[`${tx + dx},${ty + dy}`]) return false;
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
 * Releases occupied tiles
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
      reason: `Plaats je ${type} binnen de kaartgrenzen`
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
  if (!ASSETS[type]) return;
  
  const size = ASSETS[type];
  const verification = verifyAssetPlacement(scene, type, tx, ty);
  
  // Clear previous highlight
  graphics.clear();
  
  // Set color based on whether placement is valid
  graphics.fillStyle(verification.canPlace ? 0x00ff00 : 0xff0000, 0.4);
  
  // Draw highlight rectangle for each tile the asset would occupy
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      graphics.fillRect(
        (tx + dx) * scene.map.tileWidth,
        (ty + dy) * scene.map.tileHeight,
        scene.map.tileWidth,
        scene.map.tileHeight
      );
    }
  }
  
  return verification;
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


// /**
//  * Highlights an asset when hovered
//  * 
//  * @function highlightAssetUnderCursor
//  * @memberof game.utils.assetPlacer
//  * @param {Object} scene - The Phaser scene
//  * @param {Phaser.Tilemaps.Tile} tile - The tile being hovered
//  * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
//  */
// export function highlightAssetUnderCursor(scene, tile, graphics) {
//   if (!tile) return null;
  
//   const under = scene.assetObjects.find(a =>
//     tile.x >= a.tx && tile.x < a.tx + a.size.width &&
//     tile.y >= a.ty && tile.y < a.ty + a.size.height
//   );
  
//   graphics.clear();
  
//   if (!under) return null;
  
//   const { tileWidth: tw, tileHeight: th } = scene.map;
//   graphics.fillStyle(0x00ff00, 0.3);
  
//   for (let dx = 0; dx < under.size.width; dx++) {
//     for (let dy = 0; dy < under.size.height; dy++) {
//       graphics.fillRect(
//         (under.tx + dx)*tw,
//         (under.ty + dy)*th,
//         tw, th
//       );
//     }
//   }
  
//   return under;
// }


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
    const type = e.dataTransfer.getData("text/plain");
    if (!type) return;

    const [tx, ty] = getTileFromEvent(scene, e);
    
    // Use our new placeAsset method
    await placeAsset(scene, type, tx, ty);
    
    // Clear highlights
    scene.dragHighlight.clear();
    scene.draggedAssetType = null;
  });
}


// /**
//  * Sets up hover effects for existing assets
//  * 
//  * @function setupAssetHoverEffects
//  * @memberof game.utils.assetPlacer
//  * @param {Object} scene - The Phaser scene
//  */
// export function setupAssetHoverEffects(scene) {
//   scene.input.on("pointermove", pointer => {
//     const world = pointer.positionToCamera(scene.cameras.main);
//     const tile = scene.layer1.getTileAtWorldXY(world.x, world.y);
    
//     // Clear previous markers
//     scene.hoverMarker.clear();
    
//     if (!tile || scene.isDragging) return;
    
//     // Draw hover marker
//     drawHoverMarker(scene, tile);
    
//     // Highlight asset under cursor
//     highlightAssetUnderCursor(scene, tile, scene.hoverTilesHighlight);
//   });
// }


// /**
//  * Draws a marker around the hovered tile
//  * 
//  * @function drawHoverMarker
//  * @memberof game.utils.assetPlacer
//  * @param {Object} scene - The Phaser scene
//  * @param {Phaser.Tilemaps.Tile} tile - The tile being hovered
//  */
// function drawHoverMarker(scene, tile) {
//   const { tileWidth: tw, tileHeight: th } = scene.map;
//   const startX = tile.x - 1, startY = tile.y - 1;
  
//   scene.hoverMarker
//     .lineStyle(1, 0x0000ff, 1)
//     .fillStyle(0x0000ff, 0.3)
//     .strokeRect(startX*tw, startY*th, tw*3, th*3)
//     .fillRect(startX*tw, startY*th, tw*3, th*3);
// }


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
