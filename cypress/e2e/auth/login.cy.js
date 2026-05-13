import { loginPage } from '../../pages/auth/login';
describe('Authentication - Login Functionality', { tags: ["Epic:Authentication", "Feature:Login" ] }, () => {
	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();
		cy.visit('/');
	});

	it('Authentication - should successfully log in with valid credentials', { tags: ["Story:Valid Login", "Severity:critical", "UI", "@smoke"] }, () => {
		loginPage.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
		cy.url().should('include', '/projects');
	});
});