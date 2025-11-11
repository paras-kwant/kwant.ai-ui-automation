/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - General Details Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains("Regression test").click();
    });
  });

  it("Verify the UI of the General Details drawer", () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.get(workforceSelector.tableRow).eq(2).click({ force: true });
  
    cy.contains("p", "General Details").should("be.visible");
  
    const expectedTexts = [
      "First Name",
      "Last Name",
      "Company", 
    ];
  
    cy.get(".hover-hoc-container__label")
      .then(($labels) => {
        const actualTexts = [...$labels].map((el) => el.innerText.trim());
        cy.log("Actual labels:", actualTexts);
        expectedTexts.forEach((expected) => {
          expect(actualTexts, `Label "${expected}" should exist`).to.include(expected);
        });
      });
  
    // Hover check
    cy.get(".hover-hoc-container__input__display-value")
      .first()
      .realHover()
      .find("svg")
      .should("be.visible");
  
    // Button checks
    cy.contains("button p", "Cancel").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
  });
  

  it("should allow editing and saving of all editable general Details fields", () => {
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(2).click({ force: true });
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="firstName"]').click().clear().type("paras");


    cy.get(".hover-hoc-container__input__display-value")
    .eq(1)
    .realHover()
    .find(".edit-icon > svg")
    .first()
    .should("be.visible")
    .click();
  cy.get('[name="lastName"]').click().clear().type("paras");


  cy.get(".hover-hoc-container__input__display-value")
  .eq(2)
  .realHover()
  .find('.edit-icon > svg')
  .should('be.visible')
  .click({ force: true });

  cy.get('[name="company"]').click({ force: true }).clear()

  cy.get('.sc-tagGq[role="button"]').then(($buttons) => {
    const randomIndex = Cypress._.random(0, $buttons.length - 1);
    const $randomButton = $buttons.eq(randomIndex);
    cy.wrap($randomButton).click({ force: true });
  }); 



  cy.get(".hover-hoc-container__input__display-value").invoke("text").then((filledInfo) => {
    cy.log(filledInfo);


    cy.get("button p").contains("Update").click();
    workforceSelector.toastMessage().should("contain", "Successfully updated employee.");
    cy.wait(1000);

      cy.get(".hover-hoc-container__input__display-value").should("have.text", filledInfo);
    });
  });

  it("should display correct tooltip information when clicking the Worker Role info icon in general page", () => {
    cy.visit("/projects/94049707/workers");

    cy.get(workforceSelector.tableRow)
      .eq(2)
      .within(() => {
        cy.get(".personal-info-content__title")
          .invoke("text")
          .then((text) => {
            cy.wrap(text.trim()).as("workerName"); // save alias
          });

        // Step 2: click the worker name
        cy.get(".personal-info-content__title").click({ force: true });
      });


    // Step 4: click info icon
    cy.get(".sc-kSRfVL.htHbwd button").click({ force: true });

    cy.get("@workerName").then((name) => {
      cy.get(".sc-dhKdcB.iJWWrH")
        .contains(name)
        .should("be.visible");
    });
  });
});
