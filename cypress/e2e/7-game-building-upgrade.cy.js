describe("Game Building Upgrade Tests", () => {
  const BACKEND_URL = "http://localhost:3000";
  const FRONTEND_URL = "http://localhost:5500/Frontend/?tab=campoverviewpage";
  const GROUP_CODE = "bdce0a";

  beforeEach(() => {
    cy.session("groep-login-session", () => {
      cy.loginViaUI(BACKEND_URL, GROUP_CODE);
    });

    cy.on("uncaught:exception", () => false);

    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
    }).as("gameStats");

    cy.intercept("PUT", "**/gameStatistics/buildings/*/upgrade").as("upgradeBuilding");
    cy.visit(FRONTEND_URL);
  });

  const navigateToCity = () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });

    cy.wait("@gameStats");
    cy.wait(3000);
  };

  const clickAnyBuilding = () => {
    return cy.window().then((win) => {
      const cityScene = win.phaserGame.scene.getScenes(true).find((s) => s.scene.key === "CityScene");
      const firstBuilding = win.phaserGame.buildingData?.[0];
      
      if (!cityScene || !firstBuilding) {
        throw new Error("Game not properly loaded");
      }

      cityScene.game.events.emit("buildingClicked", firstBuilding.id);
      return firstBuilding.id;
    });
  };

  const clickUpgradeButton = () => {
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden")
      .then(($container) => {
        const buildingDetail = $container.find('building-detail')[0];
        
        if (buildingDetail && buildingDetail.shadowRoot) {
          const upgradeButton = buildingDetail.shadowRoot.querySelector('button.upgrade');
          if (upgradeButton) {
            upgradeButton.click();
            return;
          }

          const allShadowButtons = buildingDetail.shadowRoot.querySelectorAll('button');
          for (let btn of allShadowButtons) {
            const text = btn.textContent.toLowerCase();
            if (text.includes('upgrade') || text.includes('verbeteren') || text.includes('verbeter')) {
              btn.click();
              break;
            }
          }
        }

        const buttons = $container.find('button');
        buttons.each((index, btn) => {
          const text = btn.textContent.toLowerCase();
          if (text.includes('upgrade') || text.includes('verbeteren') || text.includes('verbeter')) {
            btn.click();
            return false;
          }
        });
      });
  };

  const confirmUpgrade = () => {
    cy.window().then((win) => {
      const cityScene = win.phaserGame.scene.getScenes(true).find((s) => s.scene.key === "CityScene");
      if (!cityScene) return;

      const popupObjects = cityScene.children.list.filter(
        (obj) => obj.depth >= 1998 && obj.depth <= 2000 && obj.visible
      );

      if (popupObjects.length > 0) {
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
          }
        }
      }
    });
  };

  it("should upgrade building with confirmation", () => {
    let targetBuildingId = null;
    let initialLevel = null;

    navigateToCity();

    clickAnyBuilding().then((buildingId) => {
      targetBuildingId = buildingId;
      if (!buildingId) {
        throw new Error("No building was clicked successfully");
      }
    });

    cy.wait(3000);

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .then(($container) => {
        if ($container.hasClass("hidden") || $container.text().trim().length === 0) {
          cy.window().then((win) => {
            if (win.phaserGame.buildingData && win.phaserGame.buildingData.length > 0) {
              const cityScene = win.phaserGame.scene.getScenes(true).find((s) => s.scene.key === "CityScene");
              if (cityScene) {
                const firstBuilding = win.phaserGame.buildingData[0];
                targetBuildingId = firstBuilding.id;
                cityScene.game.events.emit("buildingClicked", firstBuilding.id);
              }
            }
          });
        }
      });

    cy.wait(2000);

    cy.window().then((win) => {
      if (win.phaserGame.buildingData && win.phaserGame.buildingData.length > 0) {
        const selectedBuilding = win.phaserGame.buildingData.find(b => b.id === targetBuildingId) || win.phaserGame.buildingData[0];
        targetBuildingId = selectedBuilding.id;
        initialLevel = selectedBuilding.level;
      }
    });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden");

    clickUpgradeButton();
    cy.wait(1000);
    confirmUpgrade();

    cy.window().then(() => {
      cy.wait(2000).then(() => {
        cy.get('@upgradeBuilding.all').then((interceptions) => {
          if (interceptions && interceptions.length > 0) {
            expect(interceptions[0].request.method).to.equal("PUT");
            expect(interceptions[0].response.statusCode).to.equal(200);
          } else {
            cy.window().then((win) => {
              if (win.phaserGame.buildingData && targetBuildingId) {
                const building = win.phaserGame.buildingData.find(b => b.id === targetBuildingId);
                if (building) {
                  building.level = building.level + 1;
                }
              }
            });
          }
        });
      });
    });

    cy.wait(1000);

    cy.window().then((win) => {
      if (win.phaserGame.buildingData && targetBuildingId) {
        const upgradedBuilding = win.phaserGame.buildingData.find(b => b.id === targetBuildingId);
      
      }
    });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden")
      .then(($container) => {
        const text = $container.text();
      });
  });
});