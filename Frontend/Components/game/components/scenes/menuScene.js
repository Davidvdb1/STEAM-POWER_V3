import { createButton } from '../../utils/phaserSceneUtils.js';

export function createMenuScene() {
  return class MenuScene extends Phaser.Scene {
    constructor() {
      super('MenuScene');
      this.previousScene = null;
      this.width = null;
      this.height = null;
      this.centerX = null;
      this.centerY = null;
    }


    init(data) {
      // Store the scene we came from so we can return to it
      this.previousScene = data.previousScene || 'CityScene';

      // Get the center coordinates and dimensions
      // Phaser calculates width and height based on the center,
      // so 40 width = 20 pixels left and 20 pixels right of the center
      const { width, height } = this.sys.game.config;
      this.width = width;
      this.height = height;
      this.centerX = width / 2;
      this.centerY = height / 2;
    }


    create() {
      // Set background color
      this.cameras.main.setBackgroundColor('#9bd5e4');
    
      this.createMenuButtons();
      this.createBackButton();
    }


    toggleFullscreen() {
      // To be implemented
    }


    showGameInstructions() {
      // To be implemented
    }


    showObjectives() {
      // Create a modal or overlay with objectives
      const { width, height } = this.sys.game.config;
      
      // Semi-transparent background
      const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
        .setOrigin(0)
        .setInteractive()
        .on('pointerdown', () => {
          overlay.destroy();
          objectivesBox.destroy();
          objectivesText.destroy();
          closeText.destroy();
        });
      
      // Objectives box
      const objectivesBox = this.add.rectangle(width/2, height/2, width*0.7, height*0.7, 0xffffff)
        .setOrigin(0.5);
        
      // Objectives text
      const objectivesText = this.add.text(width/2, height/2 - 20, 
        'Doelstellingen:\n\n' +
        '• Bereik een luchtkwaliteitsscore van 50+\n' +
        '• Plaats minstens 5 zonnepanelen\n' +
        '• Plaats minstens 3 windmolens\n' +
        '• Schakel alle gebouwen over naar groene energie\n' +
        '• Verdien 1000+ munten\n' +
        '• Bereik een score van 80+ voor extra bonussen', 
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#000',
          align: 'left',
          wordWrap: { width: width*0.65 }
        }).setOrigin(0.5, 0.5);
      
      // Close text
      const closeText = this.add.text(width/2, height/2 + height*0.3, 
        'Klik om te sluiten', 
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#000'
        }).setOrigin(0.5, 0.5);
    }


    /**
     * Switches back to the previous scene in the game.
     *
     * @returns {void}
     */
    returnToGame() {
      this.scene.switch(this.previousScene);
    }


    /**
     * Creates the main menu buttons for the menu scene, including
     * "Volledig scherm", "Speluitleg", and "Doelstellingen". 
     * Each button is centered horizontally and vertically aligned with the others
     * and assigned its respective callback for handling user interactions.
     *
     * @returns {void}
     */
    createMenuButtons() {
      // Create menu buttons and configure their callbacks
      const buttonTexts = ['Volledig scherm', 'Speluitleg', 'Doelstellingen'];
      const buttonCallbacks = [
        () => this.toggleFullscreen(),
        () => this.showGameInstructions(),
        () => this.showObjectives()
      ];

      // Calculate button dimensions relative to screen size
      const buttonWidth = Math.max(this.width * 0.3, 250);    // 30% of width or min 250px
      const buttonHeight = Math.max(this.height * 0.07, 50);  // 7% of height or min 50px
      const buttonSpacing = this.height * 0.1;                // 10% of height for spacing
      const borderRadius = Math.max(buttonHeight * 0.4, 20);  // 40% of button height, min 20px

      // Create the three main menu buttons
      buttonTexts.forEach((text, index) => {
        const y = this.centerY - buttonSpacing + (index * buttonSpacing);

        createButton(
          this,                         // scene reference
          this.centerX,                // x (center position)
          y,                           // y (calculated based on index)
          buttonWidth,                 // width
          buttonHeight,                // height
          borderRadius,                // border radius
          text,                        // button text
          0x008000,                    // background color
          buttonCallbacks[index]       // callback function
        );
      });
    }


    /**
     * Creates a "Back" button in the top-right corner.
     * When clicked, it triggers the `returnToGame` method.
     *
     * @returns {void}
     */
    createBackButton() {      
      // Calculate dimensions relative to screen size
      const buttonWidth = Math.max(this.width * 0.15, 180);  // 15% of width or min 180px
      const buttonHeight = Math.max(this.height * 0.07, 40); // 7% of height or min 40px
      const borderRadius = Math.max(buttonHeight * 0.3, 10); // 30% of button height or min 10px

      // Position the button in the top-right corner with some margin
      const buttonX = this.width - (buttonWidth / 2) - 20;  // 20px margin from right edge
      const buttonY = (buttonHeight / 2) + 20;  // 40px margin from the top

      // Create the button using the reusable createButton method
      createButton(
        this,                      // scene reference
        buttonX,                  // x position (from right)
        buttonY,                  // y position (from top)
        buttonWidth,              // width
        buttonHeight,             // height
        borderRadius,             // border radius
        'Terug naar het spel →',  // button text
        0x008000,                 // background color (green)
        () => this.returnToGame() // callback function
      );
    }
  };
}
