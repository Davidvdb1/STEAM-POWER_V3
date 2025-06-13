/**
 * Creates a popup for loading checkpoints in a Phaser game scene.
 * Displays a list of checkpoints fetched from the server, allowing the player to select one to load.
 * Includes a close button, title, dropdown for checkpoint selection, and handles user interactions.
 * @module checkpointLoadPopup
 * @description
 * This module provides a function to create a checkpoint load popup in a Phaser scene.
 */

import {
  fetchGameStatistics,
  getCheckpointsByGameStatisticsId,
} from "../service/gameService.js";

/**
 * Creates a checkpoint load popup in the given Phaser scene.
 * This popup allows players to select a checkpoint to load from a list fetched from the server.
 * It includes a close button, title, dropdown for checkpoint selection,
 * and handles user interactions to load the selected checkpoint.
 * @param {Phaser.Scene} scene - The Phaser scene where the popup will be created.
 */
export function createCheckpointLoadPopup(scene) {
  const { width, height } = scene.cameras.main;
  const popupWidth = 700,
    popupHeight = 300;
  const centerX = width / 2,
    centerY = height / 2;
  // background
  const bg = scene.add
    .graphics()
    .fillStyle(0x000000, 0.9)
    .fillRoundedRect(
      centerX - popupWidth / 2,
      centerY - popupHeight / 2,
      popupWidth,
      popupHeight,
      20
    )
    .setDepth(1000)
    .setScrollFactor(0)
    .setVisible(false);
  // close button
  const popupTop = centerY - popupHeight / 2;

  const btnSize = 36;
  const btnRadius = 6;
  const btnX = centerX + popupWidth / 2 - btnSize - 10;
  const btnY = popupTop + 10;

  const closeBtnBg = scene.add
    .graphics()
    .fillStyle(0x444444, 1)
    .fillRoundedRect(btnX, btnY, btnSize, btnSize, btnRadius)
    .setDepth(1001)
    .setScrollFactor(0)
    .setInteractive(
      new Phaser.Geom.Rectangle(btnX, btnY, btnSize, btnSize),
      Phaser.Geom.Rectangle.Contains
    )
    .setVisible(false)
    .on("pointerdown", hideAll);

  const closeBtnText = scene.add
    .text(btnX + btnSize / 2, btnY + btnSize / 2, "✖", {
      fontSize: "24px",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setDepth(1002)
    .setScrollFactor(0)
    .setVisible(false);

  // title
  const titleY = popupTop + btnSize + 40;
  const title = scene.add
    .text(centerX, titleY, "Selecteer een checkpoint om te laden:", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: popupWidth - 40 },
    })
    .setOrigin(0.5)
    .setDepth(1001)
    .setScrollFactor(0)
    .setVisible(false);

  // Dropdown config
  const dropdownWidth = 500,
    dropdownHeight = 50;
  const dropdownX = centerX - dropdownWidth / 2;
  const dropdownY = centerY - 20;

  const dropdownBg = scene.add
    .graphics()
    .fillStyle(0x444444, 1)
    .fillRoundedRect(dropdownX, dropdownY, dropdownWidth, dropdownHeight, 10)
    .setDepth(1002)
    .setScrollFactor(0)
    .setInteractive(
      new Phaser.Geom.Rectangle(
        dropdownX,
        dropdownY,
        dropdownWidth,
        dropdownHeight
      ),
      Phaser.Geom.Rectangle.Contains
    )
    .setVisible(false);

  const selectedText = scene.add
    .text(centerX, dropdownY + dropdownHeight / 2, "Kies checkpoint", {
      fontSize: "26px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(1003)
    .setScrollFactor(0)
    .setVisible(false);

  const dropdownArrow = createDropdownArrow();

  const optionItems = [];
  let isDropdownOpen = false;

  // Collect all persistent elements for cleanup
  const popupChildren = [
    bg,
    closeBtnBg,
    closeBtnText,
    title,
    dropdownBg,
    selectedText,
    dropdownArrow,
  ];

  // Cleanup on scene shutdown
  scene.events.once("shutdown", () => {
    // Hide and destroy all option items
    optionItems.forEach((item) => {
      if (item.off) item.off("pointerdown");
      item.destroy();
    });
    optionItems.length = 0;
    // Destroy persistent elements
    popupChildren.forEach((child) => child.destroy());
    // Remove helper method
    delete scene.showCheckpointList;
  });

  // Close-button handler
  closeBtnBg.on("pointerdown", hideAll);

  /**
   * Shows the checkpoint list popup.
   * Fetches game stats and checkpoint list, then renders options.
   * @param {Function} callback - Called with (checkpointId, label) on selection.
   */
  scene.showCheckpointList = async (callback) => {
    // Reset state so the popup works correctly on multiple calls
    dropdownBg.removeAllListeners("pointerdown");
    hideAll();

    const raw = sessionStorage.getItem("loggedInUser");
    if (!raw) return showMessage("Niet ingelogd");

    let creds;
    try {
      creds = JSON.parse(raw);
    } catch {
      return showMessage("Fout bij inlezen gebruiker");
    }

    const { groupId, token } = creds;

    let stats;
    try {
      stats = await fetchGameStatistics(groupId, token);
    } catch {
      return showMessage("Fout bij ophalen gameStats");
    }

    let checkpoints;
    try {
      checkpoints = await getCheckpointsByGameStatisticsId(stats.id, token);
    } catch {
      return showMessage("Fout bij laden van checkpoints");
    }

    if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
      return showMessage("Geen checkpoints gevonden");
    }

    // show all UI
    bg.setVisible(true);
    title.setVisible(true);
    closeBtnBg.setVisible(true);
    closeBtnText.setVisible(true);
    dropdownBg.setVisible(true);
    selectedText.setVisible(true);
    dropdownArrow.setVisible(true);
    updateArrowDirection(false);

    // toggle dropdown
    dropdownBg.on("pointerdown", () => {
      isDropdownOpen = !isDropdownOpen;
      optionItems.forEach((opt) => opt.setVisible(isDropdownOpen));
      updateArrowDirection(isDropdownOpen);
    });

    // build options
    let startY = dropdownY + dropdownHeight + 10;
    const optionH = 40;

    checkpoints.forEach((cp, index) => {
      const optBg = scene.add
        .graphics()
        .fillStyle(0x666666, 1)
        .fillRoundedRect(dropdownX, startY, dropdownWidth, optionH, 5)
        .setDepth(1002)
        .setScrollFactor(0)
        .setInteractive(
          new Phaser.Geom.Rectangle(dropdownX, startY, dropdownWidth, optionH),
          Phaser.Geom.Rectangle.Contains
        )
        .setVisible(false);

      const optText = scene.add
        .text(centerX, startY + optionH / 2, `Checkpoint ${index + 1}`, {
          fontSize: "30px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1003)
        .setScrollFactor(0)
        .setVisible(false);

      optBg.on("pointerdown", () => {
        optionItems.forEach((opt) => opt.setVisible(false));
        isDropdownOpen = false;
        hideAll();
        callback(cp.id, `Checkpoint ${index + 1}`);
      });

      optionItems.push(optBg, optText);
      startY += optionH + 4;
    });
  };

  function showMessage(text) {
    hideAll();
    title.setText(text).setVisible(true);
    bg.setVisible(true);
    closeBtnBg.setVisible(true);
    closeBtnText.setVisible(true);
  }

  function hideAll() {
    bg.setVisible(false);
    title.setVisible(false);
    closeBtnBg.setVisible(false);
    closeBtnText.setVisible(false);
    dropdownBg.setVisible(false);
    selectedText.setVisible(false);
    dropdownArrow.setVisible(false);
    optionItems.forEach((item) => {
      item.removeInteractive();
      item.destroy();
    });
    optionItems.length = 0;
    isDropdownOpen = false;
  }

  /**
   * Creates a dropdown arrow graphic using Phaser's graphics API.
   *
   * The arrow is positioned relative to the center X coordinate and dropdown Y/height,
   * styled as a white filled triangle, and configured with a high depth, no scroll factor,
   * and initially hidden.
   * @inner
   * @memberof module:checkpointLoadPopup
   * @returns {Phaser.GameObjects.Graphics} The created dropdown arrow graphic object.
   */
  function createDropdownArrow() {
    const dropdownArrow = scene.add
      .graphics()
      .fillStyle(0xffffff, 1)
      .fillTriangle(
        centerX + 200,
        dropdownY + dropdownHeight / 2 - 5, // Top left
        centerX + 210,
        dropdownY + dropdownHeight / 2 - 5, // Top right
        centerX + 205,
        dropdownY + dropdownHeight / 2 + 5 // Bottom center
      )
      .setDepth(1003)
      .setScrollFactor(0)
      .setVisible(false);

    return dropdownArrow;
  }

  /**
   * Updates the direction of the dropdown arrow based on the open/closed state.
   * Draws an upward-pointing arrow when open, and a downward-pointing arrow when closed.
   * @inner
   * @memberof module:checkpointLoadPopup
   * @param {boolean} isOpen - Indicates whether the dropdown is open (true) or closed (false).
   */
  function updateArrowDirection(isOpen) {
    dropdownArrow.clear();
    dropdownArrow.fillStyle(0xffffff, 1);

    if (isOpen) {
      // Up arrow when open
      dropdownArrow.fillTriangle(
        centerX + 200,
        dropdownY + dropdownHeight / 2 + 5, // Bottom left
        centerX + 210,
        dropdownY + dropdownHeight / 2 + 5, // Bottom right
        centerX + 205,
        dropdownY + dropdownHeight / 2 - 5 // Top center
      );
    } else {
      // Down arrow when closed
      dropdownArrow.fillTriangle(
        centerX + 200,
        dropdownY + dropdownHeight / 2 - 5, // Top left
        centerX + 210,
        dropdownY + dropdownHeight / 2 - 5, // Top right
        centerX + 205,
        dropdownY + dropdownHeight / 2 + 5 // Bottom center
      );
    }
  }
}
