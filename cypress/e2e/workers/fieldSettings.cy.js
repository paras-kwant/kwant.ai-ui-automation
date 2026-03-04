/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper.js';

describe(
  "Worker Module - Field Settings",
  { tags: ["Epic:WorkForce", "Feature:Field Settings", "Module:Workforce-Worker"] },
  () => {

    beforeEach(() => {
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject('500526306'));
    });

    it(
      "Validates the UI of the Field Settings drawer",
      { tags: ["Story:Field Settings UI", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

          cy.get(workforceSelector.fieldSettingPage).click()
          cy.contains("p", "Field Settings").should("be.visible");
          cy.contains("button", "Update").should("be.disabled");
          cy.contains("button", "Add New Field").should("be.visible");
          cy.get("header button svg").should("be.visible");
        });
      }
    );

    it(
      "Applies a random field setting and verifies it in Personal Details",
      { tags: ["Story:Apply Random Field", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;
          let selectedText = "";

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()
          cy.contains("p", "Field Settings").should("be.visible");
          cy.contains("button", "Update").should("be.disabled");

          cy.get(".columns-drawer-content__column-option").then(($options) => {
            const uncheckedOptions = $options.filter((i, el) => {
              return !Cypress.$(el).find('input[type="checkbox"]').is(':checked');
            });

            const randomIndex = Math.floor(Math.random() * uncheckedOptions.length);
            const randomOption = uncheckedOptions.eq(randomIndex);

            cy.wrap(randomOption)
              .find(".columns-drawer-content__column-option__left")
              .invoke("text")
              .then((text) => {
                selectedText = text.trim();
                cy.log(`Selected field: ${selectedText}`);
              });

            cy.wrap(randomOption).find('input[type="checkbox"]').check({ force: true });
          });

          cy.contains("button", "Update").click();
          cy.get(workforceSelector.toastMessage)
            .contains("Field settings updated successfully!")
            .should("be.visible");

          cy.get("header button svg").click();
          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

          cy.then(() => {
            cy.contains(".hover-hoc-container__label,.toggle-label", selectedText)
              .scrollIntoView()
              .should("be.visible");
          });
        });
      }
    );

    it(
      "Shows a warning when adding a new field with an existing field name",
      { tags: ["Story:Add Existing Field", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;
          let selectedText = "";

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()

          cy.get(".columns-drawer-content__column-option").then(($options) => {
            const uncheckedOptions = $options.filter((i, el) => {
              return !Cypress.$(el).find('input[type="checkbox"]').is(':checked');
            });

            const randomIndex = Cypress._.random(0, uncheckedOptions.length - 1);
            const randomOption = uncheckedOptions.eq(randomIndex);

            cy.wrap(randomOption)
              .find(".columns-drawer-content__column-option__left")
              .invoke("text")
              .then((text) => {
                selectedText = text.trim();
                cy.log(`Selected field to reuse: ${selectedText}`);

                cy.contains("button", "Add New Field").click();

                cy.get('input[placeholder="Add Field Name"]').type(selectedText);

                cy.wait(500)
                cy.get('[placeholder="Select"]').eq(0).click();
                cy.get('.select_item_container [role="button"]').then(($dropdownOptions1) => {
                  const randomDropdownIndex1 = Cypress._.random(0, $dropdownOptions1.length - 1);
                  const $randomDropdownOption1 = $dropdownOptions1.eq(randomDropdownIndex1);
                  cy.wrap($randomDropdownOption1).click({ force: true });
                  cy.log(`Selected first dropdown: ${$randomDropdownOption1.text().trim()}`);
                });

                cy.get('[placeholder="Select"]').eq(1).click();
                cy.get('.select_item_container [role="button"]').then(($dropdownOptions2) => {
                  const randomDropdownIndex2 = Cypress._.random(0, $dropdownOptions2.length - 1);
                  const $randomDropdownOption2 = $dropdownOptions2.eq(randomDropdownIndex2);
                  cy.wrap($randomDropdownOption2).click({ force: true });
                  cy.log(`Selected second dropdown: ${$randomDropdownOption2.text().trim()}`);
                });

                cy.get('[label="Add"]').contains('Add').click({force:true});
                cy.get(workforceSelector.toastMessage).contains('The field already exists.').should('be.visible')
              });
          });
        });
      }
    );

    it(
      "Drag and drop a row to reorder the Field Settings",
      { tags: ["Story:Reorder Fields", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()
          cy.contains("p", "Field Settings").should("be.visible");

          cy.get(".columns-drawer-content__column-option")
            .then(($rows) => {
              if ($rows.length < 2) {
                cy.log("Not enough rows to reorder");
                return;
              }

              const source = $rows.eq(0);
              const target = $rows.eq(1);

              cy.wrap(source).trigger("mousedown", { which: 1 });
              cy.wrap(target).trigger("mousemove").trigger("mouseup", { force: true });
            });

          cy.get(".columns-drawer-content__column-option")
            .eq(0)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .then((text) => {
              cy.log("Row now at position 0: " + text.trim());
            });
        });
      }
    );

    it(
      "Verifies that newly checked fields appear at the bottom of checked items or at top if none exist",
      { tags: ["Story:New Checked Fields", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;
          let newlyToggledField = "";
          let initialCheckedCount = 0;

          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()
          cy.contains("p", "Field Settings").should("be.visible");

          cy.get(".columns-drawer-content__column-option").then(($options) => {
            const checkedOptions = $options.filter((i, el) => {
              return Cypress.$(el).find('input[type="checkbox"]').is(':checked');
            });

            initialCheckedCount = checkedOptions.length;
            cy.log(`Initially checked items: ${initialCheckedCount}`);

            const uncheckedOptions = $options.filter((i, el) => {
              return !Cypress.$(el).find('input[type="checkbox"]').is(':checked');
            });

            const randomIndex = Math.floor(Math.random() * uncheckedOptions.length);
            const randomOption = uncheckedOptions.eq(randomIndex);

            cy.wrap(randomOption)
              .find(".columns-drawer-content__column-option__left")
              .invoke("text")
              .then((text) => {
                newlyToggledField = text.trim();
                cy.log(`Toggling field: ${newlyToggledField}`);
              });

            cy.wrap(randomOption).find('input[type="checkbox"]').check({ force: true });
          });

          cy.wait(500);

          cy.get(".columns-drawer-content__column-option")
            .should('have.length.at.least', initialCheckedCount + 1);

          cy.then(() => {
            const expectedPosition = initialCheckedCount === 0 ? 0 : initialCheckedCount;

            cy.get(".columns-drawer-content__column-option")
              .eq(expectedPosition)
              .find(".columns-drawer-content__column-option__left")
              .invoke("text")
              .should("include", newlyToggledField);

            cy.get(".columns-drawer-content__column-option")
              .eq(expectedPosition)
              .find('input[type="checkbox"]')
              .should('be.checked');
          });
        });
      }
    );

    it(
      "X clicking should collapse the Field Settings drawer",
      { tags: ["Story:Close Drawer", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()

          cy.get("header button svg").click();
          cy.contains("p", "Field Settings").should("not.exist");
        });
      }
    );

    it(
      "Verifies that all fields can be turned off and saved successfully",
      { tags: ["Story:Uncheck All Fields", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
          const fullName = `${firstName} ${lastName}`;

          cy.get(workforceSelector.searchInput).clear().type(fullName);
          cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
          cy.get(workforceSelector.fieldSettingPage).click()
          cy.contains("p", "Field Settings").should("be.visible");

          cy.get(".columns-drawer-content__column-option").then(($options) => {
            const checkedCount = $options.filter((i, el) =>
              Cypress.$(el).find('input[type="checkbox"]').is(':checked')
            ).length;

            cy.log(`Initially checked items: ${checkedCount}`);

            for (let i = 0; i < checkedCount; i++) {
              cy.get(".columns-drawer-content__column-option")
                .find('input[type="checkbox"]:checked')
                .first()
                .uncheck({ force: true });
              cy.wait(200);
            }
          });

          cy.get(".columns-drawer-content__column-option").each(($option) => {
            cy.wrap($option).find('input[type="checkbox"]').should('not.be.checked');
          });

          cy.contains("button", "Update").click();
          cy.wait(1000);

          cy.get(".columns-drawer-content__column-option").each(($option) => {
            cy.wrap($option).find('input[type="checkbox"]').should('not.be.checked');
          });
        });
      }
    );

  }
);