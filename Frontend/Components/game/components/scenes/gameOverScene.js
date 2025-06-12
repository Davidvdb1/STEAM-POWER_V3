// components/game/scenes/gameOverScene.js

export function createGameOverScene(herstartButton) {
  /**
   * Phaser Scene for displaying the game over screen.
   * @class GameOverScene
   * @extends Phaser.Scene
   */
  return class GameOverScene extends Phaser.Scene {
    /**
     * Creates a new GameOverScene instance.
     * @constructor
     * @memberof GameOverScene
     */
    constructor() {
      super("GameOverScene");
    }

    /**
     * Preloads the game over image.
     * @memberof GameOverScene
     */
    preload() {
      this.load.image("gameOver", "Assets/images/game_over.png");
    }

    /**
     * Initializes the scene and displays the image and restart button.
     * @memberof GameOverScene
     */
    create() {
      const { width, height } = this.sys.game.config;

      this.add
        .image(width / 2, height / 2, "gameOver")
        .setDisplaySize(width, height)
        .setOrigin(0.5);

      herstartButton.classList.remove("hidden");
      Object.assign(herstartButton.style, {
        position: "absolute",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "green",
        color: "white",
        fontFamily: "PixelFont",
        fontSize: "1.1em",
        padding: "0.5em 1.5em",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
        transition: "transform 0.1s ease-in-out",
      });

      const msg =
        "Je hebt te veel schulden gemaakt en er is te weinig stroom. " +
        "Probeer opnieuw! Houd goed je energie en coins in de gaten. " +
        "Een stad omschakelen naar groene energie vraagt goede planning en budgetbeheer.";

      const wrapper = herstartButton.parentElement;
      const msgEl = document.createElement("div");
      msgEl.textContent = msg;

      Object.assign(msgEl.style, {
        position: "absolute",
        bottom: "150px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        fontFamily: "PixelFont",
        fontSize: "1.6em",
        padding: "0.5em 1.5em",
        border: "none",
        textAlign: "center",
        width: "80%",
        maxWidth: "800px",
      });
      wrapper.appendChild(msgEl);
    }
  };
}
