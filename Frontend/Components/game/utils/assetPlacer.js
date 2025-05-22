export function canPlaceAsset(tileAssetMap, tx, ty, size) {
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      if (tileAssetMap[`${tx + dx},${ty + dy}`]) return false;
    }
  }
  return true;
}

export function reserveTiles(tileAssetMap, tx, ty, size) {
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      tileAssetMap[`${tx + dx},${ty + dy}`] = true;
    }
  }
}

export function releaseTiles(tileAssetMap, tx, ty, size) {
  for (let dx = 0; dx < size.width; dx++) {
    for (let dy = 0; dy < size.height; dy++) {
      delete tileAssetMap[`${tx + dx},${ty + dy}`];
    }
  }
}