/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Job Details Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
  });

  it("Verify the UI of the Job Details drawer", () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.jobDetails().click();

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
    // Step 1: Visit workers page and open Job Details tab
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.jobDetails().click();
    cy.wait(1000);
  
    // Step 2: Edit Job Title
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
  
    cy.get('[placeholder="Select Worker Role"]').click();
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
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
        workforceSelector.toastMessage().should('contain', 'Successfully updated employee.');
  
        cy.wait(1500);
  
        // Step 7: Reopen Job Details drawer to verify update persisted
        cy.contains('button p', 'Cancel').click();
        cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
        workforceSelector.jobDetails().click();
        cy.wait(1000);
  
        // Step 8: Assert the value was correctly saved
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
    cy.visit("/projects/94049707/workers");
  
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .within(() => {
        // Step 1: get worker name text
        cy.get('.personal-info-content__title')
          .invoke('text')
          .then((text) => {
            cy.wrap(text.trim()).as('workerName'); // save alias
          });
  
        // Step 2: click the worker name
        cy.get('.personal-info-content__title').click({ force: true });
      });
  
    workforceSelector.jobDetails().click({ force: true });
  
    // Step 4: click info icon
    cy.get('.sc-kSRfVL.htHbwd button').click({ force: true });
  

    cy.get('@workerName').then((name) => {
      cy.get('.sc-dhKdcB.iJWWrH')
        .contains(name)
        .should('be.visible');
    });
  });
  
  
});