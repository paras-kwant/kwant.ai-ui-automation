/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - column", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Verify Filter of the diffrent column for name', () => {
    cy.visit('/projects/94049707/workers');
    cy.log("Testing for name filter")
    cy.intercept('POST', '/api/filterProjectWorker*').as('workersApi');
    cy.reload();
  
    cy.wait('@workersApi').then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map(worker => worker.firstName).filter(Boolean);
      cy.log(`First names: ${firstNames.join(', ')}`);
  
      const randomNames = Cypress._.sampleSize(firstNames, 2);
    cy.get('.table-header-filter-btn').eq(0).click();
    cy.get('input.sc-fHjqPf.fCepZC').type(randomNames[0]);
    cy.get('p').contains('Filters:').click()
    cy.get('.sc-cRmqLi .personal-info-content__title').contains(randomNames[0]).should('be.visible');
    cy.get('.label.default__label').contains('Clear All').click()
})
  })

  it('Verify Filter of the different column for company', () => {
    cy.visit('/projects/94049707/workers');
    cy.log("Testing for company filter");
  
    cy.get('.table-header-filter-btn').eq(1).click();
  
    // Find all parent elements
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      // Pick one parent randomly
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
  
      // Get the name inside the chosen parent
      const name = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      cy.log(`Randomly selected company name: ${name}`);
  
      // Click the checkbox inside the same parent
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
  
      // Apply filter
      cy.get('p').contains('Filters:').click();
      cy.wait(3000)

      cy.get('body').then(($body) => {
        if ($body.find('.table_td:nth-child(6) .cell-content').length > 0) {
          cy.get('.table_td:nth-child(6) .cell-content')
            .contains(name)
            .should('be.visible');
        } else {
            cy.get('.empty-body').should(
                'have.text',
                'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
              );
        }
      });
    })
  })


})
