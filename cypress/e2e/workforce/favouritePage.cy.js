/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - Favorites", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it.only('Validate adding and removing a worker page from favorites.', () => {
    cy.wait(2000)
        cy.get('body').then(($body) => {
          if ($body.find('[title="Workforce Workers"]').length > 0) {
            cy.get('[title="Workforce Workers"]').should('be.visible').click();
            cy.url().should('include', '/projects/94049707/workers');
            cy.get('[role="button"] [fill="#FACC15"]').should('be.visible').click()
            cy.wait(2000) 
        
            cy.get('.sc-kOPcWz').should('contain.text', 'Removed from favorite');
            cy.get('[role="button"] [fill="#FACC15"]').should('not.exist');
            cy.get('[title="Workforce Workers"]').should('not.exist');
          } else {
            cy.visit('/projects/94049707/workers');
            cy.get('[role="button"]').click();
            cy.wait(2000)
            cy.get('.sc-kOPcWz', { timeout: 10000 })
            .should('contain.text', 'Added to favorite');
            cy.get('[title="Workforce Workers"]').should('be.visible').click();
            cy.url().should('include', '/projects/94049707/workers');
            cy.get('[role="button"] [fill="#FACC15"]').should('be.visible');
          }
        });
      });

      it('Verify that the latest page added to favorites is displayed at the top of the favorites list.', ()=>{
        cy.visit('/projects/94049707/workers');
        cy.get('body').then(($body) => {
            if ($body.find('[role="button"] [fill="#FACC15"]').length > 0) {
              cy.get('[role="button"] [fill="#FACC15"]').click()
              cy.wait(2000)
              cy.get('[role="button"]').click()
              cy.get('.sc-fatcLD.ismSbL').eq(0).parents('a').should('have.attr', 'href', '/projects/94049707/workers');
            } else {
                cy.get('[role="button"]').click()
                cy.get('.sc-fatcLD.ismSbL').eq(0).parents('a').should('have.attr', 'href', '/projects/94049707/workers');
            }
        })
    })        
  
})
  