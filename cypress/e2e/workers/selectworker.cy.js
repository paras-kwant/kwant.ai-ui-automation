/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper.js';


describe("Worker Module - Selection Functionality", () => {

  beforeEach(() => {
    cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject('500526306'));
  })

  it('should display correct total worker count when selecting all workers via header checkbox', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');

    cy.get('[data-testid="table-pagination"]')                          // was '.sc-kMkxaj.eTAOVM'
      .invoke('text')
      .then((text) => {
        const totalWorker = text
          .trim()
          .match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/)[2];

        cy.log(`Total number of workers: ${totalWorker}`);

        cy.get('.header-checkbox-container [type="checkbox"]')
          .eq(0)
          .check({ force: true });

        cy.get('.label.default__label')
          .contains(totalWorker)
          .should('be.visible');
      });
  });

  it('should display correct count when a single worker is selected', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');
  });

  it('should clear selection when clear selection icon is clicked after selecting a worker', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');

    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');

    cy.get('.secondary svg')
      .click({ force: true });

    cy.get('.label.default__label')
      .should('not.exist');
  });

  it('should display correct total worker count when selecting all workers from action menu', () => {
    cy.get(workforceSelector.tableRow)
      .should('be.visible');

    cy.get('[data-testid="table-pagination"]')                          // was '.sc-kMkxaj.eTAOVM'
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/);
        const totalWorker = match[3];

        cy.log(`Total number of workers: ${totalWorker}`);

        cy.get(workforceSelector.tableColumn).eq(2).click()  // was '.sc-heIBml svg'.eq(0).click()
        cy.get('body').should('be.visible')

        cy.get('p')
          .contains('Select All')
          .click();

        cy.get('.label.default__label')
          .should('contain', totalWorker);
      });
  });

  it('should select only workers on the current page when using Select On This Page option', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');

    cy.get(workforceSelector.tableColumn).eq(2).click()  // was '.sc-heIBml svg'.eq(0).click()

    cy.get('p')
      .contains('Select On This Page')
      .click();

    cy.get('.label.default__label')
      .contains('100 Selected')
      .should('be.visible');
  });

});