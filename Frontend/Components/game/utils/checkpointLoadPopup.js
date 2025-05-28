export async function createCheckpointLoadPopup(scene, gameStatsId, token) {
  const { width, height } = scene.cameras.main;
  const popupWidth = 700, popupHeight = 380; // Verhoogde hoogte voor dropdown
  const centerX = width / 2;
  const centerY = height / 2;

  const buttonW = 180, buttonH = 60, pad = 20;

  const confirmBg = scene.add.graphics()
    .fillStyle(0x222222, 0.9)
    .fillRoundedRect(centerX - popupWidth / 2, centerY - popupHeight / 2, popupWidth, popupHeight, 20)
    .setDepth(299).setScrollFactor(0).setVisible(false);

  const confirmText = scene.add.text(centerX, centerY - 100, '', {
    fontSize: '32px',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold',
    wordWrap: { width: popupWidth - 50 }
  }).setOrigin(0.5).setDepth(300).setScrollFactor(0).setVisible(false);

  // 🔽 Dropdown container
  const dropdown = document.createElement('select');
  dropdown.style.position = 'absolute';
  dropdown.style.zIndex = 1000;
  dropdown.style.display = 'none';
  dropdown.style.fontSize = '18px';
  dropdown.style.padding = '10px';
  dropdown.style.width = '400px';
  document.body.appendChild(dropdown);

  // Buttons
  const confirmYesButton = scene.add.graphics()
    .fillStyle(0x4caf50, 1)
    .fillRoundedRect(centerX - buttonW - pad, centerY + 40, buttonW, buttonH, 10)
    .setDepth(300).setScrollFactor(0).setVisible(false)
    .setInteractive(
      new Phaser.Geom.Rectangle(centerX - buttonW - pad, centerY + 40, buttonW, buttonH),
      Phaser.Geom.Rectangle.Contains
    );

  const confirmYesText = scene.add.text(centerX - buttonW / 2 - pad, centerY + 40 + buttonH / 2, 'Ja', {
    fontSize: '28px',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(301).setScrollFactor(0).setVisible(false);

  const confirmNoButton = scene.add.graphics()
    .fillStyle(0xf44336, 1)
    .fillRoundedRect(centerX + pad, centerY + 40, buttonW, buttonH, 10)
    .setDepth(300).setScrollFactor(0).setVisible(false)
    .setInteractive(
      new Phaser.Geom.Rectangle(centerX + pad, centerY + 40, buttonW, buttonH),
      Phaser.Geom.Rectangle.Contains
    );

  const confirmNoText = scene.add.text(centerX + buttonW / 2 + pad, centerY + 40 + buttonH / 2, 'Nee', {
    fontSize: '28px',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(301).setScrollFactor(0).setVisible(false);

  scene.showCheckpointList = async (msg, callback) => {
    confirmBg.setVisible(true);
    confirmText.setText(msg).setVisible(true);
    confirmYesButton.setVisible(true);
    confirmYesText.setVisible(true);
    confirmNoButton.setVisible(true);
    confirmNoText.setVisible(true);
    scene.input.keyboard.enabled = false;

    // Position dropdown on screen
    dropdown.style.left = `${scene.game.canvas.offsetLeft + centerX - 200}px`;
    dropdown.style.top = `${scene.game.canvas.offsetTop + centerY - 30}px`;
    dropdown.style.display = 'block';

    // Fetch and fill dropdown
    try {
      const checkpoints = await getCheckpointsByGameStatisticsId("1064996f-87d4-4c9a-b860-a12b56de52de", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliN2VkN2Q2LTZiMWUtNDE0Ny04ZDBhLTRiMTIxOWIyNWI1YiIsIm5hbWUiOiJHcm9lcCAxIiwiZW1haWwiOiJHUk9VUCIsImlhdCI6MTc0ODM0MDM3MCwiZXhwIjoxNzQ4MzY5MTcwfQ.1ZpNdXm5lBUC-8qpraoizVyusNFH2cgd_-p-VthfFVo");
      dropdown.innerHTML = '';
      for (const cp of checkpoints) {
        const option = document.createElement('option');
        option.value = cp.id;
        option.textContent = cp.name || `Checkpoint ${cp.id}`;
        dropdown.appendChild(option);
      }
    } catch (err) {
      console.error('Error fetching checkpoints:', err);
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Fout bij laden van checkpoints';
      dropdown.appendChild(option);
    }

    const onYes = () => {
      const selectedId = dropdown.value;
      hide();
      callback(true, selectedId);
    };

    const onNo = () => {
      hide();
      callback(false, null);
    };

    confirmYesButton.off('pointerdown').on('pointerdown', onYes);
    confirmNoButton.off('pointerdown').on('pointerdown', onNo);
  };

  function hide() {
    confirmBg.setVisible(false);
    confirmText.setVisible(false);
    confirmYesButton.setVisible(false);
    confirmYesText.setVisible(false);
    confirmNoButton.setVisible(false);
    confirmNoText.setVisible(false);
    dropdown.style.display = 'none';
    scene.input.keyboard.enabled = true;
  }
}
