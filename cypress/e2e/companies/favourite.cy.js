/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("WorkForce Companies Module - Favourite Page", { tags: ["Epic:WorkForce", "Feature:Favorites", "Module:WorkForce-Company"] }, () => {

	beforeEach(() => {
		cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
		cy.cleanUI();
		cy.get(workforceSelector.tableRow).should('be.visible');

		// Check if already in favorites
		cy.get('body').then(($body) => {
			const favoriteExists = $body.find('[title="Workforce Companies"]').length > 0;
			if (favoriteExists) {
				cy.log('Already in favorites');
			} else {
				cy.log('Adding to favorites');
				cy.get('.top-nav-left-section [role="button"]')
					.should('be.visible')
					.click({ force: true });
				cy.get(workforceSelector.toastMessage).contains('Added to favorite');
				cy.get('[title="Workforce Companies"]', { timeout: 10000 }).should('exist');
			}
		});
	});

	it("WorkForce-Company - Verify remove company from Favorite", { tags: ["Story:Remove Favorite Company", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/companies`);
		cy.get('.top-nav-left-section [role="button"]')
			.should('be.visible')
			.click();
		cy.get(workforceSelector.toastMessage)
			.contains('Removed from favorite')
			.should('be.visible');
		cy.get('.top-nav-left-section [role="button"][fill="#FACC15"]').should('not.exist');
		cy.get('[title="Workforce Companies"]').should('not.exist');
	});

	it("WorkForce-Company - Verify adding company as favourite", { tags: ["Story:Add Favorite Company", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('.top-nav-left-section [role="button"]').click();
		cy.get(workforceSelector.toastMessage).contains('Added to favorite');
		cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]').should('be.visible');
	});

	it('WorkForce-Company - Verify Company Page Accessibility from Favorites', { tags: ["Story:Access Favorite Company Page", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('[title="Workforce Companies"]')
			.should('be.visible')
			.click();

		cy.url().should(
			'include',
			`/projects/${Cypress.env('PROJECT_ID')}/companies`
		);
	});

	it('WorkForce-Company - Verify Favorite Status Persistence', { tags: ["Story:Favorite Status Persistence", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/companies`);
		cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]').should('be.visible');
	});

	it('WorkForce-Company - Verify that the latest company added to favorites is displayed at the top of the favorites list.', { tags: ["Story:Favorite List Order", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('.top-nav-left-section [role="button"]', { timeout: 10000 })
			.find('[fill="#FACC15"]')
			.then(($icon) => {
				if ($icon.length === 0) {
					cy.get('.top-nav-left-section [role="button"]').click();
					cy.get('[title]')
						.eq(0)
						.should('have.attr', 'title', 'Workforce Companies');
				} else {
					cy.get('[title]')
						.eq(0)
						.should('have.attr', 'title', 'Workforce Companies');
				}
			});
	});

});