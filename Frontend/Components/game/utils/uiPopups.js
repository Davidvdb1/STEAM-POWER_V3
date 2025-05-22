export function createErrorPopup(scene) {
  const { width, height } = scene.cameras.main;
  const popupWidth = 700, popupHeight = 300;

  const errorBg = scene.add.graphics()
    .fillStyle(0x000000, 1)
    .fillRoundedRect(width / 2 - popupWidth / 2, height / 2 - popupHeight / 2, popupWidth, popupHeight, 20)
    .setDepth(199)
    .setScrollFactor(0)
    .setVisible(false);

  const errorText = scene.add.text(width / 2, height / 2, '', {
    fontSize: '40px',
    color: '#ffffff',
    align: 'center',
    wordWrap: { width: popupWidth - 32 },
    fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(200).setScrollFactor(0).setVisible(false);

  scene.showError = msg => {
    errorBg.setVisible(true).setAlpha(1);
    errorText.setText(msg).setVisible(true).setAlpha(1);
    scene.tweens.killTweensOf([errorBg, errorText]);
    scene.tweens.add({
      targets: [errorBg, errorText],
      alpha: { from: 1, to: 0 },
      delay: 2000,
      duration: 600,
      onComplete: () => {
        errorBg.setVisible(false).setAlpha(1);
        errorText.setVisible(false).setAlpha(1);
      }
    });
  };
}

export function createConfirmationPopup(scene) {
  const { width, height } = scene.cameras.main;
  const popupWidth = 700, popupHeight = 300;
  const centerX = width / 2;
  const centerY = height / 2;

  const buttonW = 180, buttonH = 60, pad = 20;

  const confirmBg = scene.add.graphics()
    .fillStyle(0x222222, 0.9)
    .fillRoundedRect(centerX - popupWidth / 2, centerY - popupHeight / 2, popupWidth, popupHeight, 20)
    .setDepth(299).setScrollFactor(0).setVisible(false);

  const confirmText = scene.add.text(centerX, centerY - 40, '', {
    fontSize: '32px',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold',
    wordWrap: { width: popupWidth - 50 }
  }).setOrigin(0.5).setDepth(300).setScrollFactor(0).setVisible(false);

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

  scene.showConfirmation = (msg, callback) => {
    confirmBg.setVisible(true);
    confirmText.setText(msg).setVisible(true);
    confirmYesButton.setVisible(true);
    confirmYesText.setVisible(true);
    confirmNoButton.setVisible(true);
    confirmNoText.setVisible(true);
    scene.input.keyboard.enabled = false;

    const onYes = () => { hide(); callback(true); };
    const onNo  = () => { hide(); callback(false); };

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
    scene.input.keyboard.enabled = true;
  }
}