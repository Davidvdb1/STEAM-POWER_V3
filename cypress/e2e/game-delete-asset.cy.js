describe("Game Asset Delete Tests", () => {
  const BACKEND_URL = "http://localhost:3000";
  const FRONTEND_URL = "http://localhost:5500/Frontend/?tab=campoverviewpage";
  const GROUP_CODE = "2a8fa5";
  const TARGET_ASSET = { tileX: 22, tileY: 11 };

  beforeEach(() => {
    cy.session("groep-login-session", () => {
      cy.loginViaUI(BACKEND_URL, GROUP_CODE);
    });

    cy.on("uncaught:exception", (err) => {
      if (
        err.message.includes("addEventListener") ||
        err.message.includes("Script error") ||
        err.message.includes("cross origin")
      ) {
        return false;
      }
    });

    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.headers["pragma"] = "no-cache";
    }).as("gameStats");

    cy.visit(FRONTEND_URL);
  });

  // Helper function to navigate to game and load outer city
  const navigateToOuterCity = () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });

    cy.url().should("include", "tab=gamepage");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });

    cy.wait("@gameStats");
    cy.getGameControlPanel().shadow().find("#startSpinner").should("not.exist");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .click();

    cy.wait(2000); // Reduced wait time
  };

  // Helper function to find and click asset
  const clickAssetAtTile = (tileX, tileY) => {
    cy.window().then((win) => {
      const outerCityScene = win.phaserGame.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (!outerCityScene) return;

      // Try to find asset in assetObjects first (most reliable)
      let foundAsset = outerCityScene.assetObjects?.find(
        (asset) => asset.tx === tileX && asset.ty === tileY
      );

      // Fallback: search in scene children
      if (!foundAsset) {
        foundAsset = outerCityScene.children.list.find((obj) => {
          if (!obj.texture?.key || obj.texture.key.includes("tileset")) return false;
          
          const objTileX = Math.round(obj.x / 32);
          const objTileY = Math.round(obj.y / 32);
          return objTileX === tileX && objTileY === tileY;
        });
      }

      if (foundAsset) {
        // Click on asset to open detail panel
        if (foundAsset.input) {
          foundAsset.emit("pointerdown");
        } else if (foundAsset.image?.input) {
          foundAsset.image.emit("pointerdown");
        } else {
          // Direct event trigger fallback
          const assetId = foundAsset.id || foundAsset.getData?.("assetId");
          if (assetId) {
            outerCityScene.game.events.emit("assetClicked", assetId);
          }
        }
        console.log(`✅ Clicked asset at tile (${tileX}, ${tileY})`);
      } else {
        console.log(`❌ No asset found at tile (${tileX}, ${tileY})`);
      }
    });
  };

  // Helper function to click destroy button
  const clickDestroyButton = () => {
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden")
      .then(($container) => {
        // Strategy 1: Direct button search
        let button = $container.find("button.destroy")[0];
        
        // Strategy 2: Search in custom elements' shadow DOMs
        if (!button) {
          const customElements = $container.find("*").filter((_, el) => el.tagName.includes("-"));
          for (let element of customElements) {
            if (element.shadowRoot) {
              button = element.shadowRoot.querySelector("button.destroy");
              if (button) break;
            }
          }
        }

        // Strategy 3: Search by text content
        if (!button) {
          button = $container.find("button").filter((_, el) => el.textContent.includes("Sloop"))[0];
        }

        if (button) {
          button.click();
          console.log("✅ Destroy button clicked");
        } else {
          throw new Error("Could not find destroy button");
        }
      });
  };

  // Helper function to handle confirmation popup
  const confirmDeletion = () => {
    cy.window().then((win) => {
      const outerCityScene = win.phaserGame.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (!outerCityScene) return;

      // Find popup objects
      const popupObjects = outerCityScene.children.list.filter(
        (obj) => obj.depth >= 1998 && obj.depth <= 2000 && obj.visible
      );

      if (popupObjects.length > 0) {
        console.log("✅ Confirmation popup found");

        // Find and click "Ja" button
        const buttonObjects = popupObjects.filter(
          (obj) => obj.type === "Graphics" && obj.input
        );

        if (buttonObjects.length >= 2) {
          const jaButton = buttonObjects.find(
            (obj) => obj.fillColor === 0x4caf50 || obj.x < buttonObjects[1]?.x
          ) || buttonObjects[0];

          if (jaButton) {
            jaButton.emit("pointerdown");
            setTimeout(() => jaButton.emit("pointerup"), 50);
            console.log("✅ Confirmed deletion");
          }
        }
      } else {
        console.log("❌ No confirmation popup found");
      }
    });
  };

  it("should delete asset with confirmation", () => {
    // Navigate to outer city
    navigateToOuterCity();

    // Click on target asset
    clickAssetAtTile(TARGET_ASSET.tileX, TARGET_ASSET.tileY);

    // Wait for detail panel to appear
    cy.wait(500);
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden")
      .and("be.visible");

    // Click destroy button
    clickDestroyButton();

    // Handle confirmation popup
    cy.wait(500);
    confirmDeletion();

    // Verify deletion success
    cy.wait(1500);
    
    // Check detail panel is closed
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("have.class", "hidden");

    // Verify asset is removed from scene
    cy.window().then((win) => {
      const outerCityScene = win.phaserGame.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (outerCityScene?.assetObjects) {
        const assetExists = outerCityScene.assetObjects.find(
          (asset) => asset.tx === TARGET_ASSET.tileX && asset.ty === TARGET_ASSET.tileY
        );

        expect(assetExists).to.be.undefined;
        console.log("✅ Asset successfully deleted");
      }
    });

    console.log("🎉 Asset deletion test completed successfully!");
  });
});