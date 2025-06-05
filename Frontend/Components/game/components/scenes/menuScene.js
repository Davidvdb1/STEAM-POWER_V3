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
   * @returns {void}
   */
  showObjectives() {
    // Create a container to hold all achievement elements
    const achievementsContainer = this.createAchievementsContainer();
    
    // Show loading indicator while fetching achievements
    const loadingText = this.createLoadingText(achievementsContainer);
    
    // Fetch achievements data from API
    this.fetchAndDisplayAchievements(achievementsContainer, loadingText);
  }
  
  /**
   * Creates a container with background for the achievements display
   * 
   * @returns {Phaser.GameObjects.Container} The achievements container
   */
  createAchievementsContainer() {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, this.width, this.height, 0x000000, 0.7)
      .setOrigin(0)
      .setInteractive()
      .setDepth(100);
    
    // Create white container box for achievements
    const containerBox = this.add.rectangle(
      this.centerX, 
      this.centerY, 
      this.width * 0.8, 
      this.height * 0.8, 
      0xffffff
    )
      .setOrigin(0.5)
      .setDepth(101);
    
    // Create title for the achievements panel
    const titleText = this.add.text(
      this.centerX, 
      this.centerY - (this.height * 0.8 / 2) + 30, 
      'DOELSTELLINGEN', 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#000000'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);
    
    // Add close button at the bottom
    const closeText = this.add.text(
      this.centerX,
      this.centerY + (this.height * 0.8 / 2) - 30,
      'Klik om te sluiten',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#000000'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);
    
    // Create scrollable area for achievements
    const scrollArea = this.add.container(0, 0)
      .setDepth(102);
    
    // Make the overlay close everything when clicked
    overlay.on('pointerdown', () => {
      overlay.destroy();
      containerBox.destroy();
      titleText.destroy();
      closeText.destroy();
      scrollArea.destroy();
    });
    
    // Return an object with all elements for later reference
    return {
      overlay,
      containerBox,
      titleText,
      closeText,
      scrollArea
    };
  }
  
  /**
   * Creates a loading text indicator
   * 
   * @param {Object} container - The achievements container
   * @returns {Phaser.GameObjects.Text} The loading text object
   */
  createLoadingText(container) {
    const loadingText = this.add.text(
      this.centerX,
      this.centerY,
      'Doelstellingen laden...',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#000000'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);
    
    return loadingText;
  }
  
  /**
   * Fetches achievements data and displays them in the container
   * 
   * @param {Object} container - The achievements container
   * @param {Phaser.GameObjects.Text} loadingText - The loading text to remove after fetch
   * @returns {void}
   */
  fetchAndDisplayAchievements(container, loadingText) {
    // Get authentication data from game
    const token = this.game.token;
    const groupId = this.game.groupId;
    
    if (!token || !groupId) {
      loadingText.setText('Kan doelstellingen niet laden: niet ingelogd');
      return;
    }
    
    // Import required service at runtime (to avoid circular dependencies)
    import('../../service/gameService.js').then(async ({ getAchievementsOverviewByGroupId }) => {
      try {
        // Fetch achievements data
        const achievements = await getAchievementsOverviewByGroupId(groupId, token);
        
        // Remove loading text
        loadingText.destroy();
        
        // Display achievements
        this.displayAchievements(container, achievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        loadingText.setText('Fout bij het laden van doelstellingen');
      }
    });
  }
  
  /**
   * Creates and displays achievement items in the container
   * 
   * @param {Object} container - The achievements container
   * @param {Array} achievements - The achievements data from API
   * @returns {void}
   */
  displayAchievements(container, achievements) {
    if (!achievements || achievements.length === 0) {
      this.add.text(
        this.centerX,
        this.centerY,
        'Geen doelstellingen gevonden',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#000000'
        }
      )
        .setOrigin(0.5)
        .setDepth(102);
      return;
    }
    
    // Constants for layout
    const startY = this.centerY - (this.height * 0.8 / 2) + 70;
    const itemHeight = 80;
    const itemWidth = this.width * 0.7;
    const padding = 10;
    const spacing = itemHeight + 10;
    
    // Create achievement items
    achievements.forEach((achievement, index) => {
      this.createAchievementItem(
        container.scrollArea,
        achievement,
        this.centerX,
        startY + (spacing * index),
        itemWidth,
        itemHeight,
        padding
      );
    });
  }
  
  /**
   * Creates a single achievement item
   * 
   * @param {Phaser.GameObjects.Container} scrollArea - The scroll area container
   * @param {Object} achievement - The achievement data
   * @param {number} x - The x position
   * @param {number} y - The y position
   * @param {number} width - The width of the item
   * @param {number} height - The height of the item
   * @param {number} padding - The internal padding
   * @returns {void}
   */
  createAchievementItem(scrollArea, achievement, x, y, width, height, padding) {
    // Choose background color based on completion status
    const bgColor = achievement.isReached ? 0x4CAF50 : 0xDDDDDD;
    
    // Create background for the achievement
    const background = this.add.rectangle(
      x,
      y,
      width,
      height,
      bgColor,
      achievement.isReached ? 1 : 0.7
    )
      .setOrigin(0.5, 0.5)
      .setDepth(103);
    
    // Create title and reward text
    const headerText = `${achievement.title} (+${achievement.reward} coins)`;
    const titleText = this.add.text(
      x - (width / 2) + padding,
      y - (height / 2) + padding,
      headerText,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: achievement.isReached ? '#FFFFFF' : '#000000'
      }
    )
      .setOrigin(0, 0)
      .setDepth(104);
    
    // Create description text
    const descriptionText = this.add.text(
      x - (width / 2) + padding,
      y - (height / 2) + padding + 30,
      achievement.description,
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: achievement.isReached ? '#FFFFFF' : '#000000',
        wordWrap: { width: width - (padding * 2) }
      }
    )
      .setOrigin(0, 0)
      .setDepth(104);
    
    // Add check mark icon for completed achievements
    if (achievement.isReached) {
      const checkmark = this.add.text(
        x + (width / 2) - padding,
        y - (height / 2) + padding,
        '✓',
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          color: '#FFFFFF'
        }
      )
        .setOrigin(1, 0)
        .setDepth(104);
      
      scrollArea.add(checkmark);
    }
    
    // Add all elements to the scroll area
    scrollArea.add(background);
    scrollArea.add(titleText);
    scrollArea.add(descriptionText);
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
