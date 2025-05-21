import { TileSelection } from './tileSelection.js';

/**
 * Registry for managing multiple building selections
 */
export class BuildingRegistry {
  constructor() {
    this.buildings = new Map();
  }


  /**
   * Register a new building in the registry
   * @param {TileSelection} tileSelection - The tile selection representing the building
   */
  registerBuilding(tileSelection) {
    this.buildings.set(tileSelection.name, tileSelection);
    return tileSelection;
  }


  /**
   * Create and register a new building
   * @param {string} name - Building identifier
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap
   * @param {number} startX - Starting X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {number} endX - Ending X coordinate 
   * @param {number} endY - Ending Y coordinate
   * @param {number[]} [layerIndices] - Optional specific layers to include
   * @returns {TileSelection} The created building
   */
  createBuilding(name, map, startX, startY, endX, endY, layerIndices) {
    const building = new TileSelection(name, map, startX, startY, endX, endY, layerIndices);
    return this.registerBuilding(building);
  }


  /**
   * Get a building by name
   * @param {string} name - Building identifier
   * @returns {TileSelection|undefined}
   */
  getBuilding(name) {
    return this.buildings.get(name);
  }


  /**
   * Applies a grayscale effect to the specified building.
   *
   * @param {string} name - The name of the building to grayout.
   * @param {number} opacity - The opacity of the grayscale overlay (0 to 1.0).
   */
  grayoutBuilding(name, opacity) {
    const building = this.getBuilding(name);
    if (building) {
      building.applyGrayscale(opacity);
    }
  }


  /**
   * Remove grayscale from a specific building
   * @param {string} name - Building identifier
   */
  restoreBuilding(name) {
    const building = this.getBuilding(name);
    if (building) {
      building.removeGrayscale();
    }
  }
  
  
  /**
   * Apply grayscale to all buildings in the registry
   * 
   * @param {number} opacity - The opacity of the grayscale overlay (0 to 1.0).
   */
  grayoutAllBuildings(opacity) {
    for (const building of this.buildings.values()) {
      building.applyGrayscale(opacity);
    }
  }
}
