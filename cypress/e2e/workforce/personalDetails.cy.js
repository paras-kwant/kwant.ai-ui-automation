/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Personal Details Page", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains("Regression test").click();
    });
  });

  it("should verify all UI elements and labels in the Personal Details drawer", () => {
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.personalDetails().click();

    // Verify the drawer header
    cy.get("p").contains("Personal Details").should("be.visible");

    // Verify tooltip visibility on hover
    cy.get(".hover-hoc-container__label").eq(5).find("svg").realHover();
    cy.get(".tooltip-content")
      .contains("Minority/Women owned Business Enterprise")
      .should("be.visible");

    const expectedTexts = [
      "Phone",
      "Email",
      "Date of Birth",
      "Race",
      "Sex",
      "MWBE",
      "Ethnicity",
      "Emergency Contact Name",
      "Emergency Contact Phone",
      "Emergency Contact Address",
    ];

    // Validate all expected labels exist
    cy.get(".hover-hoc-container__label").each(($el, index) => {
      if (index < expectedTexts.length) {
        cy.wrap($el)
          .invoke("text")
          .then((text) => {
            expect(text.trim()).to.contain(expectedTexts[index]);
            cy.log(`✅ Label ${index}: ${text}`);
          });
      }
    });

    cy.get(".hover-hoc-container__input__display-value")
      .realHover()
      .find("svg")
      .should("be.visible");
    cy.get("button p").contains("Cancel").should("be.visible");
    cy.get(workforceSelector.updateButton).should("be.visible");
  });

  it("should allow editing and saving all editable fields in the Personal Details section", () => {
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.personalDetails().click();

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="phone"]').click().clear().type("9868765456");

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
    cy.get('[placeholder="Select Date of Birth"]').click().clear().type("11/07/2000");

    // select race
    cy.get(".hover-hoc-container__input__display-value")
      .eq(3)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select Race"]').click({ force: true }).clear();
    cy.get(".sc-tagGq[role='button']").then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew);
      cy.wrap($randomButton).click({ force: true });
    });

    // select sex
    cy.get(".hover-hoc-container__input__display-value")
      .eq(4)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select Sex"]').click({ force: true }).clear();
    cy.get(".sc-tagGq[role='button']").then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew);
      cy.wrap($randomButton).click({ force: true });
    });

    // MWBE
    cy.get(".hover-hoc-container__input__display-value")
      .eq(5)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select MWBE"]').click({ force: true }).clear();
    cy.get(".sc-tagGq[role='button']").then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      const randomCrew = $randomButton.text().trim();
      cy.log(randomCrew);
      cy.wrap($randomButton).click({ force: true });
    });

    // select Ethnicity
    cy.get(".hover-hoc-container__input__display-value")
      .eq(6)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Select Ethnicity"]').click({ force: true }).clear();
    cy.get(".sc-tagGq[role='button']").then(($buttons) => {
      const randomIndex = Cypress._.random(0, $buttons.length - 1);
      const $randomButton = $buttons.eq(randomIndex);
      cy.wrap($randomButton).click({ force: true });
    });

    // emergency contact name
    cy.get(".hover-hoc-container__input__display-value")
      .eq(7)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Enter Emergency Contact Name"]').clear().type("rabindra ojha");

    // emergency contact phone
    cy.get(".hover-hoc-container__input__display-value")
      .eq(8)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Enter Emergency Contact Phone"]').clear().type("9878765645");

    // emergency contact address
    cy.get(".hover-hoc-container__input__display-value")
      .eq(9)
      .realHover()
      .find(".edit-icon > svg")
      .should("be.visible")
      .click({ force: true });
    cy.get('[placeholder="Enter Emergency Contact Address"]').clear().type("London");

    cy.get("button p").contains("Update").click();
    workforceSelector.toastMessage().should("contain", "Successfully updated employee.");
    cy.wait(1000);

    cy.get(".hover-hoc-container__input__display-value").invoke("text").then((filledInfo) => {
      cy.log(filledInfo);

      cy.get("button p").contains("Cancel").click();
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      workforceSelector.personalDetails().click();
      cy.wait(1000);

      cy.get(".hover-hoc-container__input__display-value").should("have.text", filledInfo);
    });
  });

  it("should display the correct tooltip information on clicking the info icon in Personal Details", () => {
    cy.visit("/projects/94049707/workers");

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
    workforceSelector.personalDetails().click({ force: true });

    // Step 4: click info icon
    cy.get(".sc-kSRfVL.htHbwd button").click({ force: true });

    cy.get("@workerName").then((name) => {
      cy.get(".sc-dhKdcB.iJWWrH")
        .contains(name)
        .should("be.visible");
    });
  });

  it("should show appropriate toast messages for invalid email and phone number input", () => {
    cy.visit("/projects/94049707/workers");
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.personalDetails().click();

    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="phone"]').click().clear().type("00000");

    cy.get("button p").contains("Update").click();
    workforceSelector.toastMessage().contains("Invalid Phone Number").should("be.visible");

    cy.get(".hover-hoc-container__input__display-value")
      .eq(1)
      .realHover()
      .find(".edit-icon > svg")
      .first()
      .should("be.visible")
      .click();
    cy.get('[name="email"]').click().clear().type("paras");
    cy.get("button p").contains("Update").click();
    workforceSelector.toastMessage().contains("Invalid email").should("be.visible");
  });
});
