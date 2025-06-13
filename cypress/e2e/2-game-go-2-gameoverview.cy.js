describe("Direct Game Overview Navigation Test with sessionStorage", () => {
  const backendUrl = "http://localhost:3000";
  const groupCode = "bdce0a";

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

    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.headers["pragma"] = "no-cache";
    }).as("gameStats");

    cy.visit("http://localhost:5500/Frontend/?tab=campoverviewpage");
  });

  it("should navigate to game page and start the game", () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });

    cy.url().should("include", "tab=gamepage");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });

    cy.wait("@gameStats");

    cy.getGameControlPanel()
      .shadow()
      .find("#startSpinner")
      .should("exist")
      .and("be.visible");
    cy.getGameControlPanel().shadow().find("#startSpinner").should("not.exist");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="currency-display"]')
      .should("exist")
      .and("be.visible");
  });

  it("should display all currency values correctly", () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });
    cy.getGameControlPanel()
      .shadow()
      .find("#startSpinner")
      .should("exist")
      .and("be.visible");
    cy.getGameControlPanel().shadow().find("#startSpinner").should("not.exist");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="currency-display"]')
      .then(($el) => {
        const shadow = $el[0].shadowRoot;
        const score = shadow.querySelector("#score");
        const coins = shadow.querySelector("#coins");
        const green = shadow.querySelector("#greenEnergy");
        const grey = shadow.querySelector("#greyEnergy");

        expect(score?.textContent).to.match(/^\d*$/);
        expect(coins?.textContent).to.match(/^-?\d+$/);
        expect(green?.textContent).to.not.be.empty;
        expect(grey?.textContent).to.not.be.empty;
      });
  });

  it("should toggle between inner and outer city views correctly", () => {
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
      .find('[data-cy="currency-display"]')
      .should("be.visible");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .should("be.visible");
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="inner-city-btn"]')
      .should("exist")
      .and("not.be.visible");

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .click();

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .should("not.be.visible");
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="inner-city-btn"]')
      .should("be.visible");

    cy.window().should((win) => {
      const game = win.phaserGame;
      expect(game).to.exist;

      const outer = game.scene.getScene("OuterCityScene");
      const city = game.scene.getScene("CityScene");

      expect(outer.scene.isActive()).to.be.true;
      expect(city.scene.isActive()).to.be.false;
    });

    cy.getGameControlPanel().shadow().find('[data-cy="inner-city-btn"]').click({ force: true });

    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .should("be.visible");
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="inner-city-btn"]')
      .should("not.be.visible");

    cy.window().should((win) => {
      const game = win.phaserGame;
      const outer = game.scene.getScene("OuterCityScene");
      const city = game.scene.getScene("CityScene");

      expect(city.scene.isActive()).to.be.true;
      expect(outer.scene.isActive()).to.be.false;
    });
  });
});
