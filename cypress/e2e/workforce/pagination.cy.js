/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { throttle } from 'rxjs';
import { workforceSelector } from '../../support/workforceSelector';  

describe("Worker Module - Search", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  it('Verify pagination is visible and default page is focused', () => {
    cy.visit('/projects/94049707/workers');
    workforceSelector.pageOne()
      .invoke('attr', 'class') 
      .then((classValue) => {
        const classCount = classValue.split(' ').length; 
        expect(classCount).to.eq(6); 
      });
  });

  it('Verify pagination breaks into pages if 100+ workers exist', () => {
    cy.visit('/projects/94049707/workers');
  
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
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.getTotalWorkers().then((totalValue) => {
              if (totalValue > 100) {
                workforceSelector.previousButton().should('be.disabled')
                workforceSelector.nextButton().should('be.visible').click()
                cy.contains('button', '2') 
                .invoke('attr', 'class') 
                .then((classValue) => {
                  const classCount = classValue.split(' ').length; 
                  expect(classCount).to.eq(6);
                });
                workforceSelector.previousButton().should('be.visible')
                workforceSelector.nextButton().should('be.disabled')

              } else {
                cy.wait(2000)
                workforceSelector.previousButton().should('be.disabled'); 
                workforceSelector.nextButton().should('be.disabled'); 
                workforceSelector.pageTwo().should('not.exist');
 
              }
            });


  });
})
  
  
