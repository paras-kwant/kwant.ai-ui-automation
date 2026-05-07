/// <reference types="cypress" />
import workerHelper from '../../support/helper/workerHelper.js';
import { workforceSelector } from '../../support/workforceSelector';
const PROJECT_ID = Cypress.env('PROJECT_ID');

describe(
  "Worker Module - Favorites",
  { tags: ["Epic:WorkForce", "Feature:Favorites", "Module:Workforce-Worker"] },
  () => {

    beforeEach(() => {
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject(PROJECT_ID));
    });

    it(
      'Verify remove worker page from Favorite',
      { tags: ["Story:Remove Favorite", "Severity:critical", "UI",   ] },
      () => {
        cy.get(workforceSelector.tableRow).should('be.visible');
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
      }
    );

    it(
      'Verify adding worker page as favourite',
      { tags: ["Story:Add Favorite", "Severity:critical", "UI",   ] },
      () => {

        cy.get(workforceSelector.tableRow).should('be.visible');
        cy.get('.top-nav-left-section [role="button"]').click();

        cy.get(workforceSelector.toastMessage, { timeout: 10000 })
          .should('contain.text', 'Added to favorite');

        cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
          .should('be.visible');

        cy.get('[title="Workforce Workers"]').should('exist');
      }
    );

    it(
      'Verify Worker Page Accessibility from Favorites',
      { tags: ["Story:Favorite Navigation", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get('[title="Workforce Workers"]')
          .should('be.visible')
          .click();

        cy.url().should(
          'include',
          `/projects/${Cypress.env('PROJECT_ID')}/workers`
        );
      }
    );

    it(
      'Verify Favorite Status Persistence',
      { tags: ["Story:Favorite Persistence", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.reload();
        cy.get(workforceSelector.tableRow).should('be.visible');


        cy.get('.top-nav-left-section [role="button"] [fill="#FACC15"]')
          .should('be.visible');
      }
    );

    it(
      'Verify latest worker page added appears at top of favorites list',
      { tags: ["Story:Favorite Ordering", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).should('be.visible');

        cy.get('.top-nav-left-section [role="button"]').then(($btn) => {
          if ($btn.find('[fill="#FACC15"]').length === 0) {
            cy.wrap($btn).click();
            cy.get(workforceSelector.toastMessage).should('contain.text', 'Added to favorite');
          }

          cy.get('[title]')
            .eq(0)
            .should('have.attr', 'title', 'Workforce Workers');
        });
      }
    );

  }
);