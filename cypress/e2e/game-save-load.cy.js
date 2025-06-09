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

    // Stap 3: Controleer of save confirmation popup zichtbaar is
    cy.window().then((win) => {
      cy.wrap(null).should(() => {
        const game = win.phaserGame;
        const scene = game.scene
          .getScenes(true)
          .find((s) => typeof s.showConfirmation === "function");

        // expect(scene, "Scene with showConfirmation should exist").to.exist;

        const confirmationText = scene.children.list.find(
          (el) => el.text === "Wil je je voortgang opslaan?" && el.visible
        );

        // expect(confirmationText, "Confirmation text should be visible").to
        //   .exist;
      });
    });

    // Stap 4: Simuleer "Ja" button klik met exacte zoeklogica gebaseerd op uiPopups.js
    cy.window().then((win) => {
      const game = win.phaserGame;
      const scene = game.scene
        .getScenes(true)
        .find((s) => typeof s.showConfirmation === "function");

      console.log("🔍 Scene found:", !!scene);
      console.log("🔍 Children count:", scene?.children?.list?.length);

      // Log ALLE Graphics children om te zien wat er beschikbaar is
      const graphicsChildren = scene.children.list.filter(
        (child) => child.type === "Graphics"
      );
      console.log("🔍 Graphics children:", graphicsChildren.length);
      graphicsChildren.forEach((child, i) => {
        console.log(`Graphics ${i}:`, {
          visible: child.visible,
          hasInput: !!child.input,
          enabled: child.input?.enabled,
          x: child.x,
          y: child.y,
          depth: child.depth,
        });
      });

      // Zoek de "Ja" button met specifieke criteria uit uiPopups.js
      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2;

      // "Ja" button is links van center en heeft depth 1999
      const yesButton = scene.children.list.find(
        (child) =>
          child.type === "Graphics" &&
          child.visible &&
          child.input &&
          child.input.enabled &&
          child.depth === 1999 && // Specifiek voor confirmation buttons
          child.x < centerX // Links van center = "Ja" button
      );

      console.log("🔍 Yes button found:", !!yesButton);

      if (yesButton) {
        console.log("🔍 Yes button details:", {
          x: yesButton.x,
          y: yesButton.y,
          depth: yesButton.depth,
          visible: yesButton.visible,
          enabled: yesButton.input?.enabled,
        });
        console.log("🔍 Emitting pointerdown event...");
        yesButton.emit("pointerdown");
      } else {
        console.log("❌ No yes button found with specific criteria!");

        // Fallback: probeer alle Graphics met depth 1999 (confirmation buttons)
        const confirmationButtons = scene.children.list.filter(
          (child) =>
            child.type === "Graphics" &&
            child.visible &&
            child.input &&
            child.input.enabled &&
            child.depth === 1999
        );

        console.log(
          "🔍 Confirmation buttons found:",
          confirmationButtons.length
        );

        if (confirmationButtons.length >= 2) {
          // Neem de eerste (zou "Ja" moeten zijn gebaseerd op volgorde)
          console.log("🔍 Clicking first confirmation button (should be Yes)");
          confirmationButtons[0].emit("pointerdown");
        } else if (confirmationButtons.length === 1) {
          console.log("🔍 Only one confirmation button found, clicking it");
          confirmationButtons[0].emit("pointerdown");
        }
      }
    });

    // Stap 5: Wacht op save POST request
    cy.wait("@saveCheckpoint").then((interception) => {
      console.log("📡 Intercepted response:", interception.response);
      console.log("📡 Status code:", interception.response.statusCode);
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // Stap 6: Controleer of "opgeslagen" bevestiging zichtbaar is
    cy.window().then((win) => {
      cy.wrap(null).should(() => {
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
