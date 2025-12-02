/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - select", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.wait(3000)

  });
  beforeEach(() => {
    cy.get("body").then(($body) => {
      if ($body.find(".secondary  svg").length > 0) {
        cy.get(".secondary  svg")
          .should("be.visible")
          .click({ force: true });
      }
    });
  });

  
  it('Validate total worker count matches displayed label after selecting all workers', () => {
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
    cy.get('[type="checkbox"]').eq(1).check({force:true})
    cy.get('.label.default__label')
    .should('contain', "1");
  });


  it('Validate clicking x removes all selected workers', () => {
    cy.get('[type="checkbox"]').eq(1).check({force:true})
    cy.get('.label.default__label')
    .should('contain', "1");
    cy.get('.secondary  svg').click({force:true});
    cy.get('.label.default__label').should('not.exist')




  })
})
  