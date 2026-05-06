/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../../support/workforceSelector';
import companiesHelper from '../../../support/helper/companiesHelper';

describe("Insights Companies Module - Selection Functionality", { tags: ["Epic:Insights", "Feature:Selection", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5795237201'));
  });


  it('Insights-Company | Verify selected worker count updates when a single worker is selected', { 
    tags: ["Story:Single Worker Selection Count", "Severity:critical", "UI", "@smoke"] 
  }, () => {

    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');
  });


  it('Insights-Company | Verify selected worker count is cleared when clear selection icon is clicked', { 
    tags: ["Story:Clear Selection After Select", "Severity:critical", "UI", "Module:Insights-Company"] 
  }, () => {

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


  it('Insights-Company | Verify selected worker count label disappears when the worker is unchecked', { 
    tags: ["Story:Unselect Worker Removes Count", "Severity:critical", "UI", "@smoke"] 
  }, () => {

    cy.get(workforceSelector.tableRow)
      .should('be.visible');

    cy.get('[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.label.default__label')
      .should('contain', '1');

    cy.get('[type="checkbox"]')
      .eq(1)
      .uncheck({ force: true });

    cy.get('.label.default__label')
      .should('not.exist');
  });

});