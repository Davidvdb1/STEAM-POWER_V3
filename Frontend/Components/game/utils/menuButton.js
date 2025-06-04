// /**
//  * Creates a menu button in the top right corner of the scene
//  * 
//  * @param {Phaser.Scene} scene - The scene to add the button to
//  * @param {Function} callback - The function to call when the button is clicked
//  */
// export function createMenuButton(scene, callback) {
//   // Create button background
//   const buttonBg = scene.add.rectangle(0, 0, 80, 80, 0x008000)
//     .setInteractive({ useHandCursor: true })
//     .on('pointerdown', callback)
  
//   // Create button text
//   const buttonText = scene.add.text(0, 0, 'Menu', {
//     fontSize: '24px',
//     fontFamily: 'Arial',
//     color: '#fff'
//   }).setOrigin(0.5);
  
//   // Create a container for the button in the top right corner
//   const container = scene.add.container(
//     scene.sys.game.config.width - 60, 
//     60, 
//     [buttonBg, buttonText]
//   );
  
//   // Set the container to a high depth so it's always on top
//   container.setDepth(1100);
  
//   return container;
// }



