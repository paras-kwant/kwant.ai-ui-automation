/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Workforce Company - Favourite page", () => {

	before(() => {
		cy.session('userSession', () => {
		  cy.login();
		  cy.get('.card-title')
			.contains(Cypress.env('PROJECT_NAME'))
			.click();
		});
	  
		companiesHelper.visitCompaniesPage();
		cy.get(workforceSelector.tableRow).should('be.visible')
		cy.get('body').then(($body) => {
			const favoriteExists = $body.find('[title="Workforce Companies"]').length > 0;
			if (favoriteExists) {
			  cy.log('Already in favorites');
			} else {
			  cy.log('Adding to favorites');
			  cy.get('.top-nav-left-section [role="button"]')
				.should('be.visible')
				.click({ force: true });
			  cy.get('.sc-kOPcWz', { timeout: 10000 })
				.should('contain.text', 'Added to favorite');
			  cy.get('[title="Workforce Companies"]', { timeout: 10000 })
				.should('exist');
			}
		  });
	  });
  
  
  
  it("Verify remove company from Favorite", () => {
	cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/companies`);
    cy.get('.top-nav-left-section [role="buttonn"]') //cjhange
      .should('be.visible')
      .click();
    cy.get('.sc-kOPcWz')
      .should('contain.text', 'Removed from favorite ');
     cy.get('.top-nav-left-section [role="button"][fill="#FACC15"]').should('not.exist');
    cy.get('[title="Workforce Companies"]').should('not.exist');
  });

  it("Verify adding company as favourite", () => {
     cy.get('.top-nav-left-section [role="button"]').click();

    cy.get('.sc-kOPcWz', { timeout: 10000 }) //change here
      .should('contain.text', 'Added to favorite');

     cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
      .should('be.visible');
  });

  it('Verify Company Page Accessibility from Favorites', () => {
    cy.get('[title="Workforce Companies"]')
      .should('be.visible')
      .click();

    cy.url().should(
      'include',
      `/projects/${Cypress.env('PROJECT_ID')}/companies`
    );
  });

  it('Verify Favorite Status Persistence', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/companies`);
     cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
      .should('be.visible');
  });

  it('Verify that the latest company added to favorites is displayed at the top of the favorites list.', ()=>{
	cy.get('.top-nav-left-section [role="button"]', { timeout: 10000 })
	  .find('[fill="#FACC15"]')
	  .then(($icon) => {
		if ($icon.length === 0) {
		  cy.get('.top-nav-left-section [role="button"]').click();
		  cy.get('.sc-fatcLD.ismSbL').eq(0).parents('a').should('have.attr', 'href', `/projects/${Cypress.env('PROJECT_ID')}/companies`);
		} else {
			cy.get('.sc-fatcLD.ismSbL').eq(0).parents('a').should('have.attr', 'href', `/projects/${Cypress.env('PROJECT_ID')}/companies`);
		}
	  });
	})

});
