/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Job Details Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains("Regression test").click();
    });
  });

  it("Verify the UI of the Job Details drawer", () => {
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.jobDetails().click();

    cy.get("p").contains("Job Details").should("be.visible");

    cy.get('.hover-hoc-container__label')
    .eq(0)
    .find('svg').realHover()
    cy.get('.tooltip-content').contains('Role of worker defined in onboarding process').should('be.visible')
    
    const expectedTexts = [
        "Worker Role",
        "Worker ID",
        "Crew",
        "$/MH",
        "Pay Group",
        "Union",
        "Added On",
        "automation test filter",
        "Job Title",
        "Cost Code"
      ];
      
      cy.get(".hover-hoc-container__label").each(($el, index) => {
        cy.wrap($el).invoke("text").then((text) => {
          expect(text).to.contain(expectedTexts[index]);
      
          cy.log(`Element ${index}: ${text}`);
          console.log(`Element ${index}: ${text}`);
        });
      });

      const indicesToHover = [0, 2, 3, 4, 5, 7, 9];
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
    // Navigate to workers page
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
  
    // Open Job Details tab
    workforceSelector.jobDetails().click();
    cy.wait(1000)
    
    //worker role 
    cy.get(".hover-hoc-container__input__display-value")
    .eq(0)
    .realHover()
    .find('.edit-icon > svg')
    .first()
    .should('be.visible')
    .click({ force: true });
  
  
    cy.get('#select-input').click().clear();
  
    // Select a random option and capture its text
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const workerRole = $randomButton.text().trim();
  
      cy.wrap($randomButton).click({ force: true });
  
      cy.get('.hover-hoc-container__input__display-value')
        .eq(0)
        .should("contain", workerRole);
        cy.wait(500) 
    }); 
  
    // Worker ID section
    cy.get(".hover-hoc-container__input__display-value")
    .eq(1)
    .realHover()
    .find('.edit-icon > svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('#hover-input').clear().type('1', { force: true });
  
    // Crew selection
    cy.wait(500)
    cy.get(".hover-hoc-container__input__display-value")
    .eq(2)
    .realHover()
    .find('.edit-icon > svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select Crew"]').click({ force: true }).clear()
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew)
  
      cy.wrap($randomButton).click({ force: true });
    }); 
  
    cy.get(".hover-hoc-container__input__display-value")
    .eq(3)
    .realHover()
    .find('.edit-icon > svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select $/MH"]').clear().type(10, { force: true });
  
    //pay group
    cy.wait(2000)
    cy.get(".hover-hoc-container__input__display-value")
    .eq(4)
    .realHover()
    .find('.edit-icon > svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select Pay Group"]').click({ force: true }).clear()
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
  
      cy.wrap($randomButton).click({ force: true });
    }); 
  
    //union group
    cy.get(".hover-hoc-container__input__display-value")
    .eq(5)
    .realHover()
    .find('.edit-icon > svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select Union"]').click({ force: true }).clear()
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
  
      cy.wrap($randomButton).click({ force: true });
    }); 
  
    cy.get(".hover-hoc-container__input__display-value")
    .eq(8)
    .realHover()
    .find('.edit-icon svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select Job Title"]').click({ force: true }).clear({force:true})
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
  
      cy.wrap($randomButton).click({ force: true });
    }); 

    cy.get(".hover-hoc-container__input__display-value")
    .eq(9)
    .realHover()
    .find('.edit-icon svg')
    .should('be.visible')
    .click({ force: true });
  
    cy.get('[placeholder="Select Cost Code"]').click({ force: true }).clear({force:true})
  
    cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
  
      cy.wrap($randomButton).click({ force: true });
    }); 

      cy.get('button p').contains('Update').click();
      workforceSelector.toastMessage().should('contain', 'Successfully updated employee.');
      cy.wait(1000)
      cy.get('.hover-hoc-container__input__display-value').eq(0).invoke('text').then((filledInfo)=>{
        cy.log(filledInfo);
    
      cy.get('button p').contains('Cancel').click();
      
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.jobDetails().click();
       cy.wait(1000)
      cy.get('.hover-hoc-container__input__display-value').eq(0)
        .should('have.text', filledInfo);
      


    })
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