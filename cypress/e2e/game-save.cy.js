describe("Game Save and Load Checkpoint Test", () => {
  const backendUrl = "http://localhost:3000";
  const groupCode = "2a8fa5";
  let gameStatisticsId;

  beforeEach(() => {
    cy.session("groep-login-session", () => {
      cy.loginViaUI(backendUrl, groupCode);
    });

    cy.on("uncaught:exception", (err) => {
      if (
        err.message.includes("addEventListener") ||
        err.message.includes("removeEventListener") ||
        err.message.includes("Script error") ||
        err.message.includes("cross origin")
      ) {
        return false;
      }
    });

    // Intercept gameStats call om gameStatisticsId te krijgen
    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.headers["pragma"] = "no-cache";
    }).as("gameStats");

    // Dynamische intercept voor save checkpoint met echte gameStatisticsId
    cy.intercept("POST", "**/gameStatistics/*/checkpoints", (req) => {
      // Extract gameStatisticsId from URL
      const urlParts = req.url.split("/");
      const gameStatsIndex = urlParts.findIndex(
        (part) => part === "gameStatistics"
      );
      if (gameStatsIndex !== -1 && gameStatsIndex + 1 < urlParts.length) {
        gameStatisticsId = urlParts[gameStatsIndex + 1];
      }

      console.log("Save checkpoint request:", {
        url: req.url,
        gameStatisticsId: gameStatisticsId,
        body: req.body,
      });
    }).as("saveCheckpoint");

    cy.visit("http://localhost:5500/Frontend/?tab=campoverviewpage");
  });

it("should save checkpoint with real game data", () => {
    // Stap 1: Start game
    cy.startGameToSaveableState();

    // Stap 2: Klik op save button
    cy.clickSaveCheckpoint();

    // Stap 3: Combineer popup check en button click in één step
    cy.window().then((win) => {
      const game = win.phaserGame;
      const scene = game.scene
        .getScenes(true)
        .find((s) => typeof s.showConfirmation === "function");

      // Snel controleren of confirmation tekst bestaat
      const confirmationText = scene.children.list.find(
        (el) => el.text === "Wil je je voortgang opslaan?" && el.visible
      );
      
      if (confirmationText) {
        console.log("✅ Confirmation popup found");
      }

      // Direct "Ja" button zoeken en klikken zonder uitgebreide logging
      const centerX = scene.cameras.main.width / 2;
      
      const yesButton = scene.children.list.find(
        (child) =>
          child.type === "Graphics" &&
          child.visible &&
          child.input &&
          child.input.enabled &&
          child.depth === 1999 &&
          child.x < centerX
      );

      if (yesButton) {
        console.log("✅ Yes button found, clicking...");
        yesButton.emit("pointerdown");
      } else {
        // Snelle fallback zonder uitgebreide logging
        const confirmationButtons = scene.children.list.filter(
          (child) =>
            child.type === "Graphics" &&
            child.visible &&
            child.input &&
            child.input.enabled &&
            child.depth === 1999
        );
        
        if (confirmationButtons.length > 0) {
          console.log("✅ Using fallback button");
          confirmationButtons[0].emit("pointerdown");
        }
      }
    });

    // Stap 4: Wacht op save POST request met kortere timeout
    cy.wait("@saveCheckpoint", { timeout: 5000 })
      .its("response.statusCode")
      .should("eq", 201);

    // Stap 5: Snelle check voor success message
    cy.window().then((win) => {
      cy.wrap(null, { timeout: 3000 }).should(() => {
        const game = win.phaserGame;
        const scene = game.scene
          .getScenes(true)
          .find((s) => typeof s.showSavedConfirmation === "function");

        expect(scene, "Scene with showSavedConfirmation should exist").to.exist;

        const confirmText = scene.children.list.find(
          (el) =>
            el.text === "Checkpoint opgeslagen!" && el.visible && el.alpha === 1
        );

        expect(confirmText, "Success message should be visible").to.exist;
      });
    });
  });
});
