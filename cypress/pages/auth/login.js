class LoginPage {

	emailInput = () => cy.get('[name="email"]');
	passwordInput = () => cy.get('[name="password"]')
	loginButton = () =>  cy.get('button p').contains('Login');
	errorMessage = () => cy.get('.error-message');


	enterEmail(email) {
		this.emailInput().should('be.visible').type(email);
	}

	enterPassword(password) {
		this.passwordInput().should('be.visible').type(password);
	}
	clickLogin() {
		this.loginButton().should('be.visible').click();
	}


	login(email, password) {
		this.enterEmail(email);
		this.enterPassword(password);
		this.clickLogin();
	}




	getErrorMessage() {
		return this.errorMessage().invoke('text');
	}
}

export const loginPage = new LoginPage();