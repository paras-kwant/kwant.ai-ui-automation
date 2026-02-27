/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import "../../support/commands";

describe("Worker Module - Personal Details Page", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    workerHelper.visitWorkersPage();
  });
  beforeEach(() => {
    cy.cleanUI();
  });

  it("Verify the UI of the Job Details drawer", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
       cy.get(workforceSelector.jobDetailsPage).click();

    cy.get("p").contains("Job Details").should("be.visible");

    cy.get('.hover-hoc-container__label')
    .eq(1)
    .find('svg').realHover()
    cy.get('.tooltip-content').contains('Role of worker defined in onboarding process').should('be.visible')
    
    const expectedTexts = [
      "Job Title",
      "Worker Role",
      "Worker ID",
      "Crew",
      "$/MH",
      "Union",
      "Added On",
      "Motion Mode"
    ];
  
    // Check that each expected text exists among label elements
    expectedTexts.forEach((text) => {
      cy.get('.hover-hoc-container__label')
        .contains(text)
        .should('exist');
    })

      const indicesToHover = [0, 1, 2, 3, 4, 5, 7,8,9];
indicesToHover.forEach((i) => {
  cy.get(".hover-hoc-container__input__display-value")
    .eq(i)
    .realHover()
    .find('svg')
    .invoke('show')
    .should('be.visible');
});


      cy.get('button p').contains('Cancel').should('be.visible')
      cy.get(workforceSelector.updateButton).should('be.visible')
  });
  it("should allow editing and saving of all editable Job Details fields", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
       cy.get(workforceSelector.jobDetailsPage).click();
    cy.wait(1000);
  

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find('.edit-icon > svg')
      .first()
      .should('be.visible')
      .click({ force: true });
  
    cy.get('[placeholder="Enter Job Title"]').clear().type('QA');
  
    // Step 3: Edit Worker Role
    cy.get(".hover-hoc-container__input__display-value")
      .eq(1)
      .realHover()
      .find('.edit-icon > svg')
      .first()
      .should('be.visible')
      .click({ force: true });
  
    cy.get('[placeholder="Select Worker Role"]').first().click();
  
    cy.get('.select_item_container [role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const workerRole = $randomButton.text().trim();
      cy.log(`Selected Worker Role: ${workerRole}`);
      cy.wrap($randomButton).click({ force: true });
    });
  
    // Step 4: Edit Worker ID
    cy.get(".hover-hoc-container__input__display-value")
      .eq(2)
      .realHover()
      .find('.edit-icon > svg')
      .should('be.visible')
      .click({ force: true });
  
    cy.get('[placeholder="Enter Worker ID"]').clear().type('9839893333');
  
    // Step 5: Capture current Job Details text (for later verification)
    cy.get('.hover-hoc-container__input__display-value')
      .eq(0)
      .invoke('text')
      .then((jobData) => {
        const filledInfo = jobData.trim();
        cy.log(`Captured Job Title before update: ${filledInfo}`);
  
        // Step 6: Save updates
        cy.contains('button p', 'Update').click();
        cy.get(workforceSelector.toastMessage).contains('Successfully updated worker.');
  
        cy.wait(1500);
  
        cy.contains('button p', 'Cancel').click();
        cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
           cy.get(workforceSelector.jobDetailsPage).click();
        cy.wait(1000);
  
        cy.get('.hover-hoc-container__input__display-value')
          .eq(0)
          .invoke('text')
          .then((updatedInfo) => {
            cy.log(`Reopened Job Title: ${updatedInfo.trim()}`);
            expect(updatedInfo.trim()).to.eq(filledInfo);
          });
      });
  });
  

  
  it("should display correct tooltip information when clicking the Worker Role info icon", () => {
  
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .within(() => {
        cy.get('.personal-info-content__title')
          .invoke('text')
          .then((text) => {
            cy.wrap(text.trim()).as('workerName'); // save alias
          });
  
        // Step 2: click the worker name
        cy.get('.personal-info-content__title').click({ force: true });
      });
  
    cy.get(workforceSelector.jobDetailsPage).click({ force: true });
  
    cy.get("header button").eq(0).click({ force: true });
  

    cy.get('@workerName').then((name) => {
      cy.get('p')
        .contains(name)
        .should('be.visible');
    });
  });
  
  
});