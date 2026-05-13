import { logoutPage } from "../../pages/auth/logout";
import { loginPage } from "../../pages/auth/login";

describe("Authentication - Logout Functionality", { tags: ["Epic:Authentication", "Feature:Logout"] }, () => {
	
  beforeEach(() => {
	cy.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
	cy.visit('/projects');
  });

  it('Authentication - should successfully log out and redirect to login page', { tags: ["Story:Successful Logout", "Severity:critical", "UI", "@smoke"] }, () => {
	logoutPage.logoutUser();
	cy.location('origin').should('eq', Cypress.config('baseUrl'));
  });
})