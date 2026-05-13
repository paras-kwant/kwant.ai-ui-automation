/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../../support/helper/workerHelper.js';
import "../../../support/commands";
const PROJECT_ID = Cypress.env('PROJECT_ID');

describe(
  "Worker Module - General Details Page",
  { tags: ["Epic:WorkForce", "Feature:GeneralDetails", "Module:Workforce-Worker"] },
  () => {
    before(()=>{
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject(PROJECT_ID));
      cy.get(workforceSelector.tableRow).first().should('be.visible').click({force: true});
      cy.get(workforceSelector.fieldSettingPage).click();
      cy.get('[type="checkbox"]').then(($checkboxes) => {
        const anyChecked = [...$checkboxes].some(cb => cb.checked);
      
        if (anyChecked) {
          cy.wrap($checkboxes).uncheck({ force: true });
        }
      });
      cy.wait(1000);
      cy.get('button p').contains('Update').click({force: true});
    })

    beforeEach(() => {
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject(PROJECT_ID));
    });

    it(
      "Verify the UI of the General Details drawer",
      { tags: ["Story:General Details Drawer UI Verification", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).should("be.visible");
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
          .find("svg")
          .should("exist");

        cy.contains("button p", "Cancel").should("be.visible");
        cy.get(workforceSelector.updateButton).should("be.visible");
      }
    );

    it.only(
      "should allow editing and saving of all editable general Details fields",
      { tags: ["Story:General Details Edit And Save Fields", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(2).click({ force: true });
        cy.contains('General Details').should('be.visible');
      

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

        cy.get('[name="company"]').click({ force: true }).clear();

        cy.get('.select_item_container [role="button"]').then(($buttons) => {
          const randomIndex = Cypress._.random(0, $buttons.length - 1);
          const $randomButton = $buttons.eq(randomIndex);
          cy.wrap($randomButton).click({ force: true });
        });

        cy.get(".hover-hoc-container__input__display-value").invoke("text").then((filledInfo) => {
          cy.log(filledInfo);

          cy.get("button p").contains("Update").click();
          cy.get(workforceSelector.toastMessage).contains("Successfully updated worker.").should('be.visible');
          cy.wait(1000);

          cy.get(".hover-hoc-container__input__display-value").should("have.text", filledInfo);
        });
      }
    );

    it(
      "should display correct tooltip information when clicking the Worker Role info icon in general page",
      { tags: ["Story:General Details Worker Role Tooltip Info", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
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
          cy.get("p").contains(name).should("be.visible");
        });
      }
    );

  }
);