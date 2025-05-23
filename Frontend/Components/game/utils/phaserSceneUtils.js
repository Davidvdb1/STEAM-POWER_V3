/**
 * Sets the camera bounds to match the size of the tilemap in the given Phaser scene.
 *
 * @param {Phaser.Scene} scene - The current Phaser scene containing the camera and tilemap.
 */
export function setCameraBounds(scene) {
  scene.cameras.main.setBounds(
    0,
    0,
    scene.map.widthInPixels, // widthInPixels = amount of tiles on x-axis * tileWidth
    scene.map.heightInPixels // heightInPixels = amount of tiles on y-axis * tileHeight
  );
}


/**
 * Adds mouse wheel zoom functionality to a Phaser scene.
 *
 * @param {Phaser.Scene} scene - The Phaser scene to attach the zoom handler to.
 * @param {number} maxZoom - The maximum zoom level allowed (default = 5).
 */
export function handleZoom(scene, maxZoom = 5) {
  scene.input.on("wheel", (pointer, gameObjects, dx, dy) => {
    let newZoom = scene.cameras.main.zoom - dy * 0.001;
    newZoom = Phaser.Math.Clamp(newZoom, 1, maxZoom);
    scene.cameras.main.setZoom(newZoom);
  });
}


/**
 * Sets up movement keys for the given Phaser scene.
 * 
 * @param {Phaser.Scene} scene - The Phaser scene to which movement keys will be added.
 */
export function setMovementKeys(scene) {
  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.WASD = scene.input.keyboard.addKeys("Z,S,Q,D");
}


/**
 * Handles camera movement in response to the keys set in setMovementKeys().
 * Moves the camera horizontally and vertically based on user input,
 * and constrains the camera's position within the map boundaries.
 *
 * @param {Phaser.Scene} scene - The scene containing the camera and input
 * @param {number} delta - The time elapsed since the last frame in milliseconds.
 * @param {number} speed - Movement speed in pixels per second (default: 300).
 */
export function handleMovementKeys(scene, delta, speed = 750) {
  const cam = scene.cameras.main;

  // Handle movement when using arrow keys or WASD
  if (scene.cursors.left.isDown || scene.WASD.Q.isDown) {
    cam.scrollX -= speed * (delta / 1000);
  } else if (scene.cursors.right.isDown || scene.WASD.D.isDown) {
    cam.scrollX += speed * (delta / 1000);
  }

  if (scene.cursors.up.isDown || scene.WASD.Z.isDown) {
    cam.scrollY -= speed * (delta / 1000);
  } else if (scene.cursors.down.isDown || scene.WASD.S.isDown) {
    cam.scrollY += speed * (delta / 1000);
  }

  // Constrain camera to map boundaries so you can't use the arrow keys or WASD to move outside the map
  cam.scrollX = Phaser.Math.Clamp(
    cam.scrollX,
    (cam.width / cam.zoom) - scene.map.widthInPixels,
    scene.map.widthInPixels - (cam.width / cam.zoom)
  );

  cam.scrollY = Phaser.Math.Clamp(
    cam.scrollY,
    (cam.height / cam.zoom) - scene.map.heightInPixels,
    scene.map.heightInPixels - (cam.height / cam.zoom)
  );
}


export function handleMapDragging(scene) {
  // Enable camera dragging with right mouse button only
  scene.isDragging = false;
  
  scene.input.on('pointerdown', (pointer) => {
    // Only start dragging with right mouse button (button 2)
    if (pointer.leftButtonDown()) {
      scene.isDragging = true;
      scene.dragStartX = pointer.x;
      scene.dragStartY = pointer.y;
      scene.startScrollX = scene.cameras.main.scrollX;
      scene.startScrollY = scene.cameras.main.scrollY;
    }
  });
  
  scene.input.on('pointermove', (pointer) => {
    if (scene.isDragging) {
      const deltaX = scene.dragStartX - pointer.x;
      const deltaY = scene.dragStartY - pointer.y;
      scene.cameras.main.scrollX = scene.startScrollX + deltaX;
      scene.cameras.main.scrollY = scene.startScrollY + deltaY;
    }
  });
  
  scene.input.on('pointerup', () => {
    scene.isDragging = false;
  });
}