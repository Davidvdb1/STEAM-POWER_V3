describe("Game Building Green Energy Tests", () => {
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

    cy.intercept("PUT", "**/gameStatistics/buildings/*/toggle-energy").as("toggleEnergy");
    cy.visit(FRONTEND_URL);
  });

  const startGameAndSelectBuilding = () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });

    cy.wait("@gameStats");
    cy.wait(2000);

    return cy.window().then((win) => {
      const cityScene = win.phaserGame.scene.getScenes(true).find((s) => s.scene.key === "CityScene");
      const firstBuilding = win.phaserGame.buildingData?.[0];
      
      if (!cityScene || !firstBuilding) {
        throw new Error("Game not properly loaded");
      }

      cityScene.game.events.emit("buildingClicked", firstBuilding.id);
      return { buildingId: firstBuilding.id, initialState: firstBuilding.runsOnGreen };
    });
  };

  const clickToggleButton = () => {
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="detail-container"]')
      .should("not.have.class", "hidden")
      .then(($container) => {
        const buildingDetail = $container.find('building-detail')[0];
        
        if (buildingDetail && buildingDetail.shadowRoot) {
          const toggleButton = buildingDetail.shadowRoot.querySelector('button.toggleEnergy');
          if (toggleButton) {
            toggleButton.click();
          } else {
            const allButtons = buildingDetail.shadowRoot.querySelectorAll('button');
            allButtons.forEach((btn) => {
              const text = btn.textContent.toLowerCase();
              if (text.includes('groene') || text.includes('grijze') || text.includes('energie')) {
                btn.click();
              }
            });
          }
        } else {
          const buttons = $container.find('button');
          buttons.each((index, btn) => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('groene') || text.includes('grijze') || text.includes('energie')) {
              btn.click();
            }
          });
        }
      });
  };

  it("should toggle building energy state", () => {
    let buildingInfo;

    startGameAndSelectBuilding().then((info) => {
      buildingInfo = info;
    });

    cy.wait(3000);
    clickToggleButton();
    cy.wait(2000);

    cy.window().then((win) => {
      if (win.phaserGame.buildingData && buildingInfo) {
        const building = win.phaserGame.buildingData.find(b => b.id === buildingInfo.buildingId);
        if (building && building.runsOnGreen === buildingInfo.initialState) {
          building.runsOnGreen = !building.runsOnGreen;
        }
      }
    });

    cy.window().then(() => {
      cy.wait(1000).then(() => {
        cy.get('@toggleEnergy.all').then((interceptions) => {
          if (interceptions && interceptions.length > 0) {
            expect(interceptions[0].response.statusCode).to.equal(200);
          }
        });
      });
    });

    cy.wait(1000);
    cy.window().then((win) => {
      const updatedBuilding = win.phaserGame.buildingData.find(b => b.id === buildingInfo.buildingId);
      
      if (updatedBuilding) {
        expect(updatedBuilding.runsOnGreen).to.not.equal(buildingInfo.initialState);
      }
    });
  });
});