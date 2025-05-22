import { TileSelection } from './tileSelection.js';

/**
 * Registry for managing multiple tile selections representing buildings.
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
   * Create and register a building defined by layer-specific selections
   * @param {string} name - Building identifier
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap
   * @param {...Array|Object} selections - Layer selections in various formats
   * @returns {TileSelection} The created building
   */
  createBuilding(name, map, ...selections) {
    // If we only got one argument and it's an object (advanced format)
    if (selections.length === 1 && !Array.isArray(selections[0]) && typeof selections[0] === 'object') {
      const options = selections[0];
      const layerSelections = [];
      
      // Convert object format to array format
      for (const layerName in options) {
        if (Array.isArray(options[layerName])) {
          options[layerName].forEach(area => {
            if (Array.isArray(area) && area.length === 2) {
              layerSelections.push([layerName, area[0], area[1]]);
            }
          });
        }
      }
      
      const building = new TileSelection(name, map, layerSelections);
      return this.registerBuilding(building);
    }
    
    // Handle the standard format with multiple layer selections
    const building = new TileSelection(name, map, selections);
    return this.registerBuilding(building);
  }

  
  /**
   * Get a building by name
   * @param {string} name - Building identifier
   * @returns {TileSelection}
   */
  getBuilding(name) {
    return this.buildings.get(name);
  }


  /**
   * Applies a grayscale effect to the specified building.
   * @param {string} name - The name of the building to grayout.
   * @param {number} intensity - The intensity of the grayscale effect, from 0 to 1 (default is 1).
   */
  grayoutBuilding(name, intensity = 1) {
    const building = this.getBuilding(name);
    if (building) {
      building.applyGrayscale(intensity);
    }
  }


  /**
   * Applies a grayscale effect to a list of buildings by their names.
   *
   * @param {string[]} names - An array of building names to apply the grayscale effect to.
   * @param {number} [intensity=1] - The intensity of the grayscale effect, from 0 to 1 (default is 1).
   */
  grayoutBuildings(names, intensity = 1) {
    for (const name of names) {
      const building = this.getBuilding(name);
      if (building) {
        building.applyGrayscale(intensity);
      }
    }
  }
  

  /**
   * Apply grayscale to all buildings in the registry
   * @param {number} intensity - The intensity of the grayscale effect, from 0 to 1 (default is 1).
   */
  grayoutAllBuildings(intensity = 1) {
    for (const building of this.buildings.values()) {
      building.applyGrayscale(intensity);
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
   * Restores the visual state of buildings by removing grayscale effect for each building name provided.
   *
   * @param {string[]} names - An array of building names to restore.
   */
  restoreBuildings(names) {
    for (const name of names) {
      const building = this.getBuilding(name);
      if (building) {
        building.removeGrayscale();
      }
    }
  }
  

  /**
   * Remove grayscale from all buildings
   */
  restoreAllBuildings() {
    for (const building of this.buildings.values()) {
      building.removeGrayscale();
    }
  }
}
