class LogoutPage {

	profileDropdown = () => cy.get('[data-testid="profile-dropdown"]');
	logoutButton = () => cy.get('.icon-label').contains('Logout');

	logoutUser() {
		this.profileDropdown().click();
		this.logoutButton().click();
	}
}

export const logoutPage = new LogoutPage();