/**
 * Utility functions for drawing hover markers on a game map.
 * These functions are used to visually indicate the area of interest when hovering over tiles.
 * @module hoverUtils
 * @description Contains functions to draw hover markers on a Phaser graphics object.
 */

/** * Draws a hover marker on the specified tile in the game map.
 * This function creates a visual indicator around the tile to highlight it.
 * @param {Phaser.GameObjects.Graphics} graphics - The Phaser graphics object to draw on.
 * @param {Object} tile - The tile object containing x and y coordinates.
 * @param {Object} map - The game map object containing tile dimensions.
 * @param {number} [color=0x0000ff] - The color of the hover marker (default is blue).
 * @param {number} [alpha=0.3] - The alpha transparency of the hover marker (default is 0.3).
 */
export function drawHoverMarker(
  graphics,
  tile,
  map,
  color = 0x0000ff,
  alpha = 0.3
) {
  const tileW = map.tileWidth;
  const tileH = map.tileHeight;
  const startX = tile.x - 1;
  const startY = tile.y - 1;

  graphics.clear();
  graphics.lineStyle(1, color, 1);
  graphics.fillStyle(color, alpha);
  graphics.strokeRect(startX * tileW, startY * tileH, tileW * 3, tileH * 3);
  graphics.fillRect(startX * tileW, startY * tileH, tileW * 3, tileH * 3);
}
