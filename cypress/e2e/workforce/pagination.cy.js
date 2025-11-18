/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { throttle } from 'rxjs';
import { workforceSelector } from '../../support/workforceSelector';  

describe("Worker Module - Pagination", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
  });

  it('Verify pagination is visible and default page is focused', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    workforceSelector.pageOne()
      .invoke('attr', 'class') 
      .then((classValue) => {
        const classCount = classValue.split(' ').length; 
        expect(classCount).to.eq(6); 
      });
  });

  it('Verify pagination breaks into pages if 100+ workers exist', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  
    cy.getTotalWorkers().then((totalValue) => {
      cy.log('Total workers: ' + totalValue);
  
      if (totalValue > 100) {
        workforceSelector.pageTwo().should('be.visible');
      } else {
        workforceSelector.pageTwo().should('not.exist');
      }
    });
  });
  

  it('Verify Next and previous button navigates to respective page', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.wait(3000);
    
    cy.getTotalWorkers().then((totalValue) => {
      const totalPages = Math.ceil(totalValue / 100);
      
      if (totalPages > 1) {
        cy.log(`Total workers: ${totalValue}, Total pages: ${totalPages}`);
        
        // Page 1: Previous disabled
        workforceSelector.previousButton().should('be.disabled');
        workforceSelector.nextButton().should('not.be.disabled');
        
        // Go to page 2
        workforceSelector.nextButton().click();
        cy.wait(1000);
        
        // Page 2: Both enabled
        workforceSelector.previousButton().should('not.be.disabled');
        workforceSelector.nextButton().should('not.be.disabled');
        
        // Go back to page 1
        workforceSelector.previousButton().click();
        cy.wait(1000);
        
        // Page 1 again: Previous disabled
        workforceSelector.previousButton().should('be.disabled');
        
      } else {
        workforceSelector.previousButton().should('be.disabled');
        workforceSelector.nextButton().should('be.disabled');
      }
    });
});
})
  
  
