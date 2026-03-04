/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import companiesHelper from '../../support/helper/companiesHelper';

describe("WorkForce Companies Module - Selection Functionality", { tags: ["Epic:WorkForce", "Feature:Selection", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
    cy.cleanUI();
  });

  it('WorkForce-Company - should display correct total worker count when selecting all workers via header checkbox', { tags: ["Story:Select All Via Header Checkbox", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
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

  it('WorkForce-Company - should display correct count when a single worker is selected', { tags: ["Story:Single Worker Selection Count", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');
  });

  it('WorkForce-Company - should clear selection when clear selection icon is clicked after selecting a worker', { tags: ["Story:Clear Selection After Select", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
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

  it('WorkForce-Company - should display correct total worker count when selecting all workers from action menu', { tags: ["Story:Select All Via Action Menu", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    cy.get(workforceSelector.tableRow)
      .should('be.visible');

    cy.get('.workforce-footer')
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/);
        const totalWorker = match[3];

        cy.log(`Total number of workers: ${totalWorker}`);

        cy.get(workforceSelector.tableColumn).eq(2).click();
        cy.get('body').should('be.visible');

        cy.get('p')
          .contains('Select All')
          .click();

        cy.get('.label.default__label')
          .should('contain', totalWorker);
      });
  });

  it('WorkForce-Company - should select only workers on the current page when using Select On This Page option', { tags: ["Story:Select On This Page Only", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
    cy.get(workforceSelector.tableColumn).eq(2).click();

    cy.get('p')
      .contains('Select On This Page')
      .click();

    cy.get('.label.default__label')
      .contains('100 Selected')
      .should('be.visible');
  });

});