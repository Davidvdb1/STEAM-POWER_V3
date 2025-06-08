describe("Group Login and Game Navigation Test", () => {
  const backendUrl = "http://localhost:3000";
  const testData = {
    validGroupCode: "2a8fa5", // wel nog aanpassen als je de database verwijdert
    invalidGroupCode: "INVALID999",
  };

  beforeEach(() => {
    cy.visit("http://localhost:5500/Frontend/?tab=grouploginpage", {
      onBeforeLoad(win) {
        win.env = { BACKEND_URL: backendUrl };
      },
    });
  });

  it("should show error message for invalid group code", () => {
    cy.getLoginForm().within(() => {
      cy.get('[data-cy="group-code-input"]').type(testData.invalidGroupCode);
      cy.get('[data-cy="group-login-btn"]').click();
      cy.get('[data-cy="login-error-message"]').should("be.visible");
    });

    cy.url().should("include", "tab=grouploginpage");
  });

  it("should require a group code to be entered", () => {
    cy.getLoginForm().within(() => {
      cy.get('[data-cy="group-login-btn"]').click();
      cy.get('[data-cy="group-code-input"]').should("have.attr", "required");
    });

    cy.url().should("include", "tab=grouploginpage");
  });

  it("should login with correct credential", () => {
    cy.getLoginForm().within(() => {
      cy.get('[data-cy="group-code-input"]').type(testData.validGroupCode);
      cy.get('[data-cy="group-login-btn"]').click();
    });

    cy.url().should("include", "tab=campoverviewpage");
  });
});
