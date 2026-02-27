/// <reference types="cypress" />

import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Module - Favorites", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
  });

  beforeEach(() => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });

  it('Verify remove worker page from Favorite', () => {
    cy.get('body').then(($body) => {
      const isFavorited =
        $body.find('.top-nav-left-section [role="button"] [fill="#FACC15"]').length > 0;

      if (!isFavorited) {
        cy.get('.top-nav-left-section [role="button"]').click();
        cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
      }

      cy.wait(2000);
      cy.get('.top-nav-left-section [role="button"]').click();

      cy.get(workforceSelector.toastMessage).should('contain.text', 'Removed from favorite');

      cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
        .should('not.exist');

      cy.get('[title="Workforce Workers"]').should('not.exist');
    });
  });

  it('Verify adding worker page as favourite', () => {
    cy.get('.top-nav-left-section [role="button"]').click();

    cy.get(workforceSelector.toastMessage, { timeout: 10000 })
      .should('contain.text', 'Added to favorite');

    cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
      .should('be.visible');

    cy.get('[title="Workforce Workers"]').should('exist');
  });

  it('Verify Worker Page Accessibility from Favorites', () => {
    cy.get('[title="Workforce Workers"]')
      .should('be.visible')
      .click();

    cy.url().should(
      'include',
      `/projects/${Cypress.env('PROJECT_ID')}/workers`
    );
  });

  it('Verify Favorite Status Persistence', () => {
    cy.reload();

    cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
      .should('be.visible');
  });

  it('Verify latest worker page added appears at top of favorites list', () => {
    cy.get('.top-nav-left-section [role="button"]').then(($btn) => {
      if ($btn.find('[fill="#FACC15"]').length === 0) {
        cy.wrap($btn).click();
        cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
      }

      cy.get('[title]')
        .eq(0)
        .should('have.attr', 'title', 'Workforce Workers');
    });
  });

});