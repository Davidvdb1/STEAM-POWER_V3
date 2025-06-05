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


    /**
     * Shows an interactive overview of all achievements with completion status
     * 
     * @function showObjectives
     * @memberOf MenuScene
     * @returns {void}
     */
    showObjectives() {
      // Create and dispatch a custom event to the GameControlPanel which will handle showing the achievements
      const event = new CustomEvent('show-achievements', {
        bubbles: true,
        composed: true
      });

      this.game.canvas.dispatchEvent(event);
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
     * @function createMenuButtons
     * @memberOf MenuScene
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
     * @function createBackButton
     * @memberOf MenuScene
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
