export function drawHoverMarker(graphics, tile, map, color = 0x0000ff, alpha = 0.3) {
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
