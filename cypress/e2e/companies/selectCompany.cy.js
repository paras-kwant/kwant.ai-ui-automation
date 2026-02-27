/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import companiesHelper from '../../support/helper/companiesHelper';

describe("companies Module - Selection Functionality", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });

    companiesHelper.visitCompaniesPage();
  });

  beforeEach(() => {
    cy.get("body").then(($body) => {
      if ($body.find(".secondary svg").length > 0) {
        cy.get(".secondary svg")
          .should("be.visible")
          .click({ force: true });
      }
    });
  });

  it('should display correct total worker count when selecting all workers via header checkbox', () => {
    cy.get('.workforce-footer')
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
    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');
  });

  it('should clear selection when clear selection icon is clicked after selecting a worker', () => {
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

    cy.get('.workforce-footer')
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/);
        const totalWorker = match[3];

        cy.log(`Total number of workers: ${totalWorker}`);

       cy.get(workforceSelector.tableColumn).eq(2).click()
       cy.get('body').should('be.visible')

        cy.get('p')
          .contains('Select All')
          .click();

        cy.get('.label.default__label')
          .should('contain', totalWorker);
      });
  });

  it('should select only workers on the current page when using Select On This Page option', () => {
    cy.get(workforceSelector.tableColumn).eq(2).click()

    cy.get('p')
      .contains('Select On This Page')
      .click();

    cy.get('.label.default__label')
      .contains('100 Selected')
      .should('be.visible');
  });

});
