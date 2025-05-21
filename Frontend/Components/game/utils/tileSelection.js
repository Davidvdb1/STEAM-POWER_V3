export class TileSelection {
  /**
   * Constructs a named tile selection representing a specific building or area
   * @param {string} name - Identifier for this selection (e.g., "hospital", "park")
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap containing the layers and tiles
   * @param {number} startX - The starting X coordinate (inclusive) of the selection area
   * @param {number} startY - The starting Y coordinate (inclusive) of the selection area
   * @param {number} endX - The ending X coordinate (inclusive) of the selection area
   * @param {number} endY - The ending Y coordinate (inclusive) of the selection area
   */
  constructor(name, map, startX, startY, endX, endY) {
    this.name = name;
    this.map = map;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.scene = map.scene;
    this.grayOverlay = null;
  }


  /**
   * Applies a semi-transparent grayscale (black) overlay to the selected tile area.
   * Removes any existing grayscale overlay before applying a new one.
   *
   * @param {number} opacity - The opacity of the grayscale overlay (0 to 1.0).
   */
  applyGrayscale(opacity) {
    // Remove any existing overlay
    this.removeGrayscale();
    
    // Calculate pixel coordinates
    const tileWidth = this.map.tileWidth;
    const tileHeight = this.map.tileHeight;
    const x = this.startX * tileWidth;
    const y = this.startY * tileHeight;
    const width = this.width * tileWidth;
    const height = this.height * tileHeight;
    
    // Create a semi-transparent gray rectangle
    this.grayOverlay = this.scene.add.rectangle(
      x + width/2, 
      y + height/2, 
      width, 
      height, 
      0x000000, // Black overlay
      opacity // Opacity
    );
    
    // Set depth to be above all map layers
    this.grayOverlay.setDepth(1000); // Using a high value to ensure it's above everything
  }


  /**
   * Removes grayscale effect from this tile selection
   */
  removeGrayscale() {
    if (this.grayOverlay) {
      this.grayOverlay.destroy();
      this.grayOverlay = null;
    }
  }


  /**
   * Get the width of the selection in tiles
   */
  get width() {
    return this.endX - this.startX + 1;
  }


  /**
   * Get the height of the selection in tiles
   */
  get height() {
    return this.endY - this.startY + 1;
  }
}