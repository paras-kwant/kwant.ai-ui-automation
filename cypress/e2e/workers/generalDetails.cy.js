/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import "../../support/commands";

describe("Worker Module - General Details Page", () => {
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
    cy.wait(1500)
    cy.get('body').click('bottomLeft')
  });
  
  it("Verify the UI of the General Details drawer", () => {
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
    cy.get(workforceSelector.tableRow).eq(2).click({force: true});
    cy.wait(2000)
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find("svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="firstName"]').click().clear().type("paras");



    cy.get(".hover-hoc-container__input__display-value")
    .eq(1)
    .realHover()
    .find("svg")
    .should("be.visible")
    .click();
  cy.get('[name="lastName"]').click().clear().type("paras");


  cy.get(".hover-hoc-container__input__display-value")
  .eq(2)
  .realHover()
  .find('svg')
  .should('be.visible')
  .click({ force: true });

  cy.get('[name="company"]').click({ force: true }).clear()

  cy.get('.select_item_container [role="button"]').then(($buttons) => {
    const randomIndex = Cypress._.random(0, $buttons.length - 1);
    const $randomButton = $buttons.eq(randomIndex);
    cy.wrap($randomButton).click({ force: true });
  }); 



  cy.get(".hover-hoc-container__input__display-value").invoke("text").then((filledInfo) => {
    cy.log(filledInfo);


    cy.get("button p").contains("Update").click();
    cy.get(workforceSelector.toastMessage).contains( "Successfully updated worker.").should('be.visible')
    cy.wait(1000);

      cy.get(".hover-hoc-container__input__display-value").should("have.text", filledInfo);
    });
  });

  it("should display correct tooltip information when clicking the Worker Role info icon in general page", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .within(() => {
        cy.get(".personal-info-content__title")
          .invoke("text")
          .then((text) => {
            cy.wrap(text.trim()).as("workerName"); 
          });

        cy.get(".personal-info-content__title").click({ force: true });
      });


    cy.get("header button").eq(0).click({ force: true });

    cy.get("@workerName").then((name) => {
      cy.get("p")
        .contains(name)
        .should("be.visible");
    });
  });
});

