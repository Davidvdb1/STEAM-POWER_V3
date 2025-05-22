export class TileSelection {
  /**
   * Constructs a named tile selection representing a specific building or area
   * @param {string} name - Identifier for this selection (e.g., "hospital", "park")
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap containing the layers and tiles
   * @param {Array|Array[]} layerSelections - Array of layer selections in format [layerName, [startX, startY], [endX, endY]]
   */
  constructor(name, map, layerSelections) {
    this.name = name;
    this.map = map;
    this.scene = map.scene;
    this.buildingLayers = [];
    this.originalTiles = new Map();
    
    // Handle different input formats for selections
    let normalizedSelections = [];
    
    // Case 1: Single array of selections (passed as one argument)
    if (Array.isArray(layerSelections) && layerSelections.length > 0) {
      // Check if it's a multi-dimensional array (array of selection arrays)
      if (Array.isArray(layerSelections[0])) {
        normalizedSelections = layerSelections;
      } 
      // It's a single selection array
      else if (typeof layerSelections[0] === 'string') {
        normalizedSelections = [layerSelections];
      }
    } 
    // Case 2: Multiple selection arrays passed as separate arguments
    else if (arguments.length > 3) {
      normalizedSelections = Array.from(arguments).slice(2);
    }
    
    // Group selections by layer
    const selectionsByLayer = new Map();
    
    // Process each layer selection and group by layer name
    normalizedSelections.forEach(selection => {
      try {
        if (!Array.isArray(selection) || selection.length < 3) {
          console.warn(`Invalid selection format for building ${name}:`, selection);
          return;
        }
        
        const [layerName, startCoords, endCoords] = selection;
        
        if (!Array.isArray(startCoords) || startCoords.length !== 2 || 
            !Array.isArray(endCoords) || endCoords.length !== 2) {
          console.warn(`Invalid coordinates for building ${name}:`, selection);
          return;
        }
        
        const startX = startCoords[0];
        const startY = startCoords[1];
        const endX = endCoords[0];
        const endY = endCoords[1];
        
        if (!selectionsByLayer.has(layerName)) {
          selectionsByLayer.set(layerName, []);
        }
        
        selectionsByLayer.get(layerName).push({ startX, startY, endX, endY });
      } catch (error) {
        console.error(`Error processing selection for building ${name}:`, selection, error);
      }
    });
    
    // Process each layer
    let layerIndex = 0;
    for (const [layerName, selections] of selectionsByLayer.entries()) {
      // Get the original layer
      const originalLayer = this.map.getLayer(layerName).tilemapLayer;
      if (!originalLayer) {
        console.warn(`Layer ${layerName} not found for building ${name}`);
        continue;
      }
      
      // Create a new layer specific to this building part
      const buildingLayerName = `${name}_${layerName}_${layerIndex++}`;
      const buildingLayer = this.map.createBlankLayer(
        buildingLayerName, 
        originalLayer.tileset
      );
      
      // Set the same depth as the original layer
      buildingLayer.layerIndex = originalLayer.layerIndex;
      
      // Store original tiles and copy them to the building layer
      const tileData = [];
      
      // Process all selections for this layer
      selections.forEach(({ startX, startY, endX, endY }) => {
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const tile = originalLayer.getTileAt(x, y);
            if (tile) {
              tileData.push({
                x: x,
                y: y,
                index: tile.index,
                flipX: tile.flipX,
                flipY: tile.flipY,
                rotation: tile.rotation
              });
              
              // Create a new tile with the same properties
              const newTile = buildingLayer.putTileAt(tile.index, x, y);
                  
              // Try the built-in copy transform method first (Phaser 3.60+)
              if (typeof buildingLayer.copyTileTransform === 'function') {
                buildingLayer.copyTileTransform(tile, newTile);
              } 
              // Fall back to manual property copying for older Phaser versions
              else {
                // Apply transformations manually
                if (tile.flipX) newTile.flipX = true;
                if (tile.flipY) newTile.flipY = true;
                if (tile.rotation) newTile.rotation = tile.rotation;
              }
              
              // Hide in original layer
              originalLayer.putTileAt(-1, x, y);
            }
          }
        }
      });
      
      // Store data for possible restoration
      this.originalTiles.set(layerName, {
        layer: originalLayer,
        tiles: tileData
      });
      
      // Add to building layers
      this.buildingLayers.push(buildingLayer);
    }

    // Fix layer order to ensure correct rendering
    this.fixLayerOrder();
  }


  /**
   * Fixes the rendering order of map and building layers in the scene when a grayscale effect is applied
   */
  fixLayerOrder() {
    const allLayers = [];

    // First, collect all original map layers
    for (let i = 0; i < this.map.layers.length; i++) {
      const layer = this.map.layers[i].tilemapLayer;
      if (layer) {
        allLayers.push({ layer, index: i, isOriginal: true });
      }
    }

    // Then add our building-specific layers
    for (const buildingLayer of this.buildingLayers) {
      allLayers.push({ layer: buildingLayer, index: buildingLayer.layerIndex, isOriginal: false });
    }

    // Sort them by layerIndex (lower indices render first)
    allLayers.sort((a, b) => a.layer.layerIndex - b.layer.layerIndex);

    // Building layers with the same index as an original layer should render first
    for (let i = 0; i < allLayers.length; i++) {
      const current = allLayers[i];

      // If this is a building layer and the next one has the same layerIndex but is original
      if (!current.isOriginal 
          && i < allLayers.length - 1 && 
          allLayers[i + 1].layer.layerIndex === current.layer.layerIndex &&
          allLayers[i + 1].isOriginal) {
          
        // Swap positions so building layer renders first
        const temp = allLayers[i];
        allLayers[i] = allLayers[i + 1];
        allLayers[i + 1] = temp;
      }
    }

    // Now bring each layer to the top in order, which will stack them properly
    for (const item of allLayers) {
      this.scene.children.bringToTop(item.layer);
    }
  }


  /**
   * Applies grayscale effect to the building's layers
   * @param {number} intensity - Grayscale intensity from 0 (no effect) to 1 (full grayscale)
   */
  applyGrayscale(intensity = 1) {   
    this.buildingLayers.forEach(layer => {
      if (layer.postFX) {
        layer.postFX.clear();
        layer.postFX.addColorMatrix().grayscale(intensity);
      } else {
        console.warn(`PostFX not available for layer in "${this.name}"`);
      }
    });
  }


  /**
   * Removes grayscale effect from the building's layers
   */
  removeGrayscale() {
    this.buildingLayers.forEach(layer => {
      if (layer.postFX) {
        layer.postFX.clear();
      }
    });
  }
}
