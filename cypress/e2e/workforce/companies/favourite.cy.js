/// <reference types="cypress" />

import companiesHelper from '../../../support/helper/companiesHelper';
import { workforceSelector } from '../../../support/workforceSelector';

describe("WorkForce Companies Module - Favourite Page", { tags: ["Epic:WorkForce", "Feature:Favorites", "Module:WorkForce-Company"] }, () => {

	beforeEach(() => {
		cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
		cy.get(workforceSelector.tableRow).should('be.visible');
	});

	it("WorkForce-Company - Verify remove company from Favorite", { tags: ["Story:Remove Favorite Company", "Severity:critical", "UI", "@smoke"] }, () => {
		cy.get('body').then(($body) => {
			const isFavorited = $body.find('.top-nav-left-section [role="button"] [fill="#FACC15"]').length > 0;

			if (!isFavorited) {
				cy.get('.top-nav-left-section [role="button"]').click();
				cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
			}

			cy.wait(2000);
			cy.get('.top-nav-left-section [role="button"]').click();
			cy.get(workforceSelector.toastMessage).should('contain.text', 'Removed from favorite');
			cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]').should('not.exist');
			cy.get('[title="Workforce Companies"]').should('not.exist');
		});
	});

	it("WorkForce-Company - Verify adding company as favourite", { tags: ["Story:Add Favorite Company", "Severity:critical", "UI", "@smoke"] }, () => {
		cy.get('body').then(($body) => {
			const isFavorited = $body.find('.top-nav-left-section [role="button"] [fill="#FACC15"]').length > 0;

			if (isFavorited) {
				cy.get('.top-nav-left-section [role="button"]').click();
				cy.get(workforceSelector.toastMessage).should('contain.text', 'Removed from favorite');
				cy.wait(1000);
			}

			cy.get('.top-nav-left-section [role="button"]').click();
			cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
			cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]').should('be.visible');
			cy.get('[title="Workforce Companies"]').should('exist');
		});
	});

	it('WorkForce-Company - Verify Company Page Accessibility from Favorites', { tags: ["Story:Access Favorite Company Page", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('.top-nav-left-section [role="button"]').then(($btn) => {
			if ($btn.find('[fill="#FACC15"]').length === 0) {
				cy.wrap($btn).click();
				cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
			}
		});

		cy.get('[title="Workforce Companies"]')
			.should('be.visible')
			.click();

		cy.url().should('include', `/projects/500526306/companies`);
	});

	it('WorkForce-Company - Verify Favorite Status Persistence', { tags: ["Story:Favorite Status Persistence", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('.top-nav-left-section [role="button"]').then(($btn) => {
			if ($btn.find('[fill="#FACC15"]').length === 0) {
				cy.wrap($btn).click();
				cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
			}
		});

		cy.reload();
		cy.get(workforceSelector.tableRow).should('be.visible');
		cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]').should('be.visible');
	});

	it('WorkForce-Company - Verify that the latest company added to favorites is displayed at the top of the favorites list.', { tags: ["Story:Favorite List Order", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
		cy.get('.top-nav-left-section [role="button"]').then(($btn) => {
			if ($btn.find('[fill="#FACC15"]').length === 0) {
				cy.wrap($btn).click();
				cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
			}

			cy.get('[title]')
				.eq(0)
				.should('have.attr', 'title', 'Workforce Companies');
		});
	});

});
