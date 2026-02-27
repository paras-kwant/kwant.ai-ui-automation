/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import "../../support/commands";

describe("Worker Module - Personal Details Page", () => {
  before(() => {
    cy.viewport(1440, 900);
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
    });
    workerHelper.visitWorkersPage();
  });
  beforeEach(() => {
    cy.cleanUI();
  });

  it("should verify all UI elements and labels in the Personal Details drawer", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.personalDetailsPage).click();

    // Verify the drawer header
    cy.get("p").contains("Personal Details").should("be.visible");

    // Verify tooltip visibility on hover
    cy.get(".hover-hoc-container__label").eq(7).find("svg").realHover();
    cy.get(".tooltip-content")
      .contains("Minority/Women owned Business Enterprise")
      .should("be.visible");

    const expectedTexts = [
      "Phone",
      "Email",
      "Address",
      "Zip Code",
      "Date of Birth",
      "Race",
      "Sex",
      "MWBE",
      "Ethnicity",
      "Emergency Contact Name",
      "Emergency Contact Phone",
      "Emergency Contact Address",
    ];

    expectedTexts.forEach((text) => {
      cy.get('.hover-hoc-container__label')
        .contains(text)
        .should('exist');
    })

    cy.get(".hover-hoc-container__input__display-value")
      .realHover()
      .find("svg")
      .should("be.visible");
    cy.get("button p").contains("Cancel").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
  });

  it("should allow editing and saving all editable fields in the Personal Details section", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.personalDetailsPage).click();

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="phone"]').click().clear().type("9779868765456");

    cy.get(".hover-hoc-container__input__display-value")
      .eq(1)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="email"]').click().clear().type("paras@gmail.com");

    cy.get(".hover-hoc-container__input__display-value")
    .eq(2)
    .realHover()
    .find(".edit-icon > svg")
    .first()
    .should("be.visible")
    .click();
  cy.get('[name="address"]').click().clear().type("Nepal");


    // select sex
    cy.get(".hover-hoc-container__input__display-value")
      .eq(6)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });

    cy.get('[placeholder="Select Sex"]').click({ force: true }).clear();
    cy.get('.select_item_container [role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew);
      cy.wrap($randomButton).click({ force: true });
    });

    // MWBE
    cy.get(".hover-hoc-container__input__display-value")
      .eq(7)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select MWBE"]').click({ force: true }).clear();
    cy.get('.select_item_container [role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew);
      cy.wrap($randomButton).click({ force: true });
    });

    // select Ethnicity
    cy.get(".hover-hoc-container__input__display-value")
      .eq(8)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select Ethnicity"]').click({ force: true }).clear();
    cy.get('.select_item_container [role="button"]').then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      cy.wrap($randomButton).click({ force: true });
    });


    cy.contains('button p', 'Update').click();
    cy.get(workforceSelector.toastMessage).should("contain", "Successfully updated worker");
    cy.wait(1000);

    cy.get(".hover-hoc-container__input__display-value").invoke("text").then((filledInfo) => {
      cy.log(filledInfo);

      cy.get("button p").contains("Cancel").click();
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(workforceSelector.personalDetailsPage).click();
      cy.wait(1000);

      cy.get(".hover-hoc-container__input__display-value").should("have.text", filledInfo);
    });
  });

  it("should display the correct tooltip information on clicking the info icon in Personal Details", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .within(() => {
        cy.get(".personal-info-content__title")
          .invoke("text")
          .then((text) => {
            cy.wrap(text.trim()).as("workerName"); // save alias
          });

        // Step 2: click the worker name
        cy.get(".personal-info-content__title").click({ force: true });
      });

    // Step 3: open Personal Details
    cy.get(workforceSelector.personalDetailsPage).click({ force: true });

    cy.get("header button").eq(0).click({ force: true });

    cy.get("@workerName").then((name) => {
      cy.get("p")
        .contains(name)
        .should("be.visible");
    });
  });

  it("should show toast message for invalid phone number input", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.personalDetailsPage).click();
  
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
  
    cy.get('[name="phone"]').clear().type("00000");
    cy.get("button p").contains("Update").click();

    cy.get(workforceSelector.toastMessage)
      .contains("Invalid Phone Number")
      .should("be.visible");
  });

  it("should show toast message for invalid email input", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.personalDetailsPage).click();
  
    cy.get(".hover-hoc-container__input__display-value")
      .eq(1)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
  
    cy.get('[name="email"]').clear().type("paras");
    cy.get("button p").contains("Update").click();
    cy.get(workforceSelector.toastMessage)
      .contains("Invalid email")
      .should("be.visible");
  });
  

  
});
