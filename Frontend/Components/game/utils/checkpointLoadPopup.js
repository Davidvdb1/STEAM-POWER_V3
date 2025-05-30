import {
  fetchGameStatistics,
  getCheckpointsByGameStatisticsId,
} from "../service/gameService.js";

export function createCheckpointLoadPopup(scene) {
  const { width, height } = scene.cameras.main;
  const popupWidth = 700,
    popupHeight = 300;
  const centerX = width / 2,
    centerY = height / 2;

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

  const title = scene.add
    .text(centerX, centerY - 100, "Selecteer een checkpoint om te laden:", {
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

  // Dropdown
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
    .setVisible(false)
    .setInteractive(
      new Phaser.Geom.Rectangle(
        dropdownX,
        dropdownY,
        dropdownWidth,
        dropdownHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

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

  scene.showCheckpointList = async (callback) => {
    // Reset state so the popup works correctly on multiple calls
    dropdownBg.removeAllListeners('pointerdown');
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

    if (!Array.isArray(checkpoints) || checkpoints.length === 0)
      return showMessage("Geen checkpoints gevonden");

    // Show UI
    bg.setVisible(true);
    title.setVisible(true);
    dropdownBg.setVisible(true);
    selectedText.setVisible(true);
    dropdownArrow.setVisible(true);
    updateArrowDirection(false); 

    // Toggle dropdown
    dropdownBg.on("pointerdown", () => {
      isDropdownOpen = !isDropdownOpen;
      optionItems.forEach((opt) => opt.setVisible(isDropdownOpen));
      updateArrowDirection(isDropdownOpen);
    });

    // Create dropdown options
    let startY = dropdownY + dropdownHeight + 10;
    const optionH = 40;

    checkpoints.forEach((cp, index) => {
      const optBg = scene.add
        .graphics()
        .fillStyle(0x666666, 1)
        .fillRoundedRect(dropdownX, startY, dropdownWidth, optionH, 5)
        .setDepth(1002)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive(
          new Phaser.Geom.Rectangle(dropdownX, startY, dropdownWidth, optionH),
          Phaser.Geom.Rectangle.Contains
        );

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
  }

  function hideAll() {
    bg.setVisible(false);
    title.setVisible(false);
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
   *
   * @returns {Phaser.GameObjects.Graphics} The created dropdown arrow graphic object.
   */
  function createDropdownArrow() {
    const dropdownArrow = scene.add
    .graphics()
    .fillStyle(0xFFFFFF, 1)
    .fillTriangle(
      centerX + 200, dropdownY + dropdownHeight/2 - 5,  // Top left
      centerX + 210, dropdownY + dropdownHeight/2 - 5,  // Top right
      centerX + 205, dropdownY + dropdownHeight/2 + 5   // Bottom center
    )
    .setDepth(1003)
    .setScrollFactor(0)
    .setVisible(false);

    return dropdownArrow;
  }


  /**
   * Updates the direction of the dropdown arrow based on the open/closed state.
   * Draws an upward-pointing arrow when open, and a downward-pointing arrow when closed.
   *
   * @param {boolean} isOpen - Indicates whether the dropdown is open (true) or closed (false).
   */
  function updateArrowDirection(isOpen) {
    dropdownArrow.clear();
    dropdownArrow.fillStyle(0xFFFFFF, 1);
    
    if (isOpen) {
      // Up arrow when open
      dropdownArrow.fillTriangle(
        centerX + 200, dropdownY + dropdownHeight/2 + 5,  // Bottom left
        centerX + 210, dropdownY + dropdownHeight/2 + 5,  // Bottom right
        centerX + 205, dropdownY + dropdownHeight/2 - 5   // Top center
      );
    } else {
      // Down arrow when closed
      dropdownArrow.fillTriangle(
        centerX + 200, dropdownY + dropdownHeight/2 - 5,  // Top left
        centerX + 210, dropdownY + dropdownHeight/2 - 5,  // Top right
        centerX + 205, dropdownY + dropdownHeight/2 + 5   // Bottom center
      );
    }
  }
}
