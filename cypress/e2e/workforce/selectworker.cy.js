/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - select", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
  });

  
  it('Validate total worker count matches displayed label after selecting all workers', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.wait(3000);
    cy.get('.sc-kMkxaj.eTAOVM')
      .invoke('text')
      .then((text) => {
        const totalworker = text.trim().match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[2];
        cy.log(`Total number of workers: ${totalworker}`);
        cy.get('.header-checkbox-container [type="checkbox"]').eq(0).check({ force: true });
        cy.get('.label.default__label')
          .should('contain', totalworker);
      });
  });

  it('Validate one worker count matches displayed label after selecting all workers', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.wait(3000);
    cy.get('[type="checkbox"]').eq(1).check({force:true})
    cy.get('.label.default__label')
    .should('contain', "1");

  });
})
  