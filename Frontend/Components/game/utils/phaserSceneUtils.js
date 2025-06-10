/**
 * Utility functions for managing Phaser scenes, camera bounds, zoom, and movement.
 * @module phaserSceneUtils
 * @description Contains functions to set camera bounds, handle zoom, manage movement keys,
 * and create buttons for the Phaser game engine.
 */

import { createMenuScene } from "../components/scenes/menuScene.js";

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
  // handler reference for removal
  const zoomHandler = (pointer, gameObjects, dx, dy) => {
    let newZoom = scene.cameras.main.zoom - dy * 0.001;
    newZoom = Phaser.Math.Clamp(newZoom, 1, maxZoom);
    scene.cameras.main.setZoom(newZoom);
  };

  scene.input.on("wheel", zoomHandler);
  scene.events.once("shutdown", () => {
    scene.input.off("wheel", zoomHandler);
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
    cam.width / cam.zoom - scene.map.widthInPixels,
    scene.map.widthInPixels - cam.width / cam.zoom
  );

  cam.scrollY = Phaser.Math.Clamp(
    cam.scrollY,
    cam.height / cam.zoom - scene.map.heightInPixels,
    scene.map.heightInPixels - cam.height / cam.zoom
  );
}

/**
 * Handles dragging the map using the right mouse button.
 * Allows the user to click and drag to move the camera view.
 *
 * @param {Phaser.Scene} scene - The Phaser scene to enable dragging in.
 */
export function handleMapDragging(scene) {
  // Enable camera dragging with right mouse button only
  scene.isDragging = false;

  // handler references for removal
  const pointerDownHandler = (pointer) => {
    // Only start dragging with left mouse button
    if (pointer.leftButtonDown()) {
      scene.isDragging = true;
      scene.dragStartX = pointer.x;
      scene.dragStartY = pointer.y;
      scene.startScrollX = scene.cameras.main.scrollX;
      scene.startScrollY = scene.cameras.main.scrollY;
    }
  };
  const pointerMoveHandler = (pointer) => {
    if (scene.isDragging) {
      const deltaX = scene.dragStartX - pointer.x;
      const deltaY = scene.dragStartY - pointer.y;
      scene.cameras.main.scrollX = scene.startScrollX + deltaX;
      scene.cameras.main.scrollY = scene.startScrollY + deltaY;
    }
  };
  const pointerUpHandler = () => {
    scene.isDragging = false;
  };

  scene.input.on("pointerdown", pointerDownHandler);
  scene.input.on("pointermove", pointerMoveHandler);
  scene.input.on("pointerup", pointerUpHandler);

  scene.events.once("shutdown", () => {
    scene.input.off("pointerdown", pointerDownHandler);
    scene.input.off("pointermove", pointerMoveHandler);
    scene.input.off("pointerup", pointerUpHandler);
  });
}

/**
 * Creates a button with rounded corners and text
 *
 * @function createButton
 * @param {Phaser.Scene} scene - The scene to add the button to
 * @param {number} x - The x coordinate (center of button)
 * @param {number} y - The y coordinate (center of button)
 * @param {number} width - The width of the button
 * @param {number} height - The height of the button
 * @param {number} borderRadius - The corner radius
 * @param {string} text - The text to display
 * @param {number} [fontSize] - The font size of the text (default: 16px or 40% of height)
 * @param {number} bgColor - The background color (hex)
 * @param {Function} callback - The function to call when clicked
 * @returns {void}
 */
export function createButton(
  scene,
  x,
  y,
  width,
  height,
  borderRadius,
  text,
  fontSize = Math.max(height * 0.4, 16),
  bgColor,
  callback
) {
  // Create a graphics object for the button
  const buttonGraphics = scene.add.graphics();

  // Set the background color
  buttonGraphics.fillStyle(bgColor, 1);

  // Draw a rounded rectangle (x, y, width, height, radius)
  // x and y are for the top-left corner, so we offset from center
  buttonGraphics.fillRoundedRect(
    x - width / 2,
    y - height / 2,
    width,
    height,
    borderRadius
  );

  // Make the graphics object interactive
  const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
  buttonGraphics
    .setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
    .on("pointerdown", callback);

  // Center the hit area on the button
  buttonGraphics.input.hitArea.x = x - width / 2;
  buttonGraphics.input.hitArea.y = y - height / 2;

  // Button text
  scene.add
    .text(x, y, text, {
      fontSize: `${fontSize}px`,
      fontFamily: "PixelFont",
      color: "#fff",
    })
    .setOrigin(0.5);
}

/**
 * Creates a menu button in the top right corner of the scene
 *
 * @function createMenuButton
 * @param {Phaser.Scene} scene - The scene to add the button to
 * @param {Function} callback - The function to call when the button is clicked
 */
export function createMenuButton(scene, callback) {
  // Now we pass scene as the first parameter
  createButton(
    scene, // scene
    scene.sys.game.config.width - 60, // x
    60, // y
    90, // width
    50, // height
    15, // border radius
    "Menu", // button text
    Math.max(50 * 0.6, 16), // font size (40% of height or min 16px)
    0x008000, // background color
    callback // callback function
  );
}

/**
 * Sets up a menu button in the top right corner that transitions to the MenuScene
 *
 * @function setupMenuButton
 * @param {Phaser.Scene} scene - The scene to add the menu button to
 */
export function setupMenuButton(scene) {
  createMenuButton(scene, () => {
    // Dispatch an event to hide navigation buttons and the detail container
    scene.game.canvas.dispatchEvent(
      new CustomEvent("menu-opened", {
        bubbles: true,
        composed: true,
      })
    );

    // Switch to menu scene
    scene.scene.pause();

    if (scene.scene.get("MenuScene")) {
      scene.scene.stop("MenuScene");
      scene.scene.remove("MenuScene");
    }

    scene.scene.add("MenuScene", createMenuScene(), false);
    scene.scene.run("MenuScene", { sourceScene: scene.scene.key });
  });
}
