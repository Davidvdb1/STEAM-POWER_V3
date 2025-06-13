Cypress.Commands.add("getLoginForm", () => {
  return cy
    .get("main-ɮ")
    .shadow()
    .find("home-ɮ")
    .shadow()
    .find("tabhandler-れ")
    .shadow()
    .find("content-れ")
    .shadow()
    .find("grouploginpage-れ")
    .shadow()
    .find("grouploginform-れ")
    .shadow();
});

Cypress.Commands.add("getHeaderNavigation", () => {
  return cy
    .get("main-ɮ")
    .shadow()
    .find("home-ɮ")
    .shadow()
    .find("tabhandler-れ")
    .shadow()
    .find("header-れ")
    .shadow()
    .find("navigationlist-れ")
    .shadow();
});

Cypress.Commands.add("getGameControlPanel", () => {
  return cy
    .get("main-ɮ")
    .shadow()
    .find("home-ɮ")
    .shadow()
    .find("tabhandler-れ")
    .shadow()
    .find("content-れ")
    .shadow()
    .find("gamepage-れ")
    .shadow()
    .find("gamecontrolpanel-れ");
});

Cypress.Commands.add("loginViaUI", (backendUrl, groupCode) => {
  cy.visit("http://localhost:5500/Frontend/?tab=grouploginpage", {
    onBeforeLoad(win) {
      win.env = { BACKEND_URL: backendUrl };
    },
  });

  cy.getLoginForm().within(() => {
    cy.get('[data-cy="group-code-input"]').type(groupCode);
    cy.get('[data-cy="group-login-btn"]').click();
  });

  cy.url().should("include", "tab=campoverviewpage");

  cy.window().then((win) => {
    const user = win.sessionStorage.getItem("loggedInUser");
    expect(user).to.exist;
  });
});

// Game starten tot save/load beschikbaar is
Cypress.Commands.add("startGameToSaveableState", () => {
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
    .should("exist")
    .and("be.visible");
});

Cypress.Commands.add("clickSaveCheckpoint", () => {
  return cy
    .getGameControlPanel()
    .shadow()
    .find('[data-cy="currency-display"]')
    .shadow()
    .find("#saveBtn")
    .click({ force: true });
});

// Simpele load command
Cypress.Commands.add("clickLoadCheckpoint", () => {
  return cy
    .getGameControlPanel()
    .shadow()
    .find('[data-cy="currency-display"]')
    .shadow()
    .find("#loadBtn")
    .click({ force: true });
});
