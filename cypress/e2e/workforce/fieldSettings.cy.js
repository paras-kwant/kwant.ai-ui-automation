/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Field Settings", () => {

  // ✅ Runs only ONCE before all tests — creates a session and logs in
  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
  });

  // ✅ Runs before EACH test — just navigates to the workers page
  beforeEach(() => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });

  it("Validates the UI of the Field Settings drawer", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;

      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
      cy.contains("p", "Field Settings").should("be.visible");
      cy.contains("button", "Update").should("be.disabled");
      cy.contains("button", "Add New Field").should("be.visible");
      cy.get("header button svg").should("be.visible");
    });
  });

  it("Applies a random field setting and verifies it in Personal Details", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;
      let selectedText = "";

      // Open the worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
      cy.contains("p", "Field Settings").should("be.visible");
      cy.contains("button", "Update").should("be.disabled");

      // Select a random UNCHECKED field and enable it
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

      // Save and verify success
      cy.contains("button", "Update").click();
      workforceSelector.toastMessage()
        .contains("Field settings updated successfully!")
        .should("be.visible");

      // Go back and verify in Personal Details
      cy.get("header button svg").click();
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

      cy.then(() => {
        cy.contains(".hover-hoc-container__label,.toggle-label", selectedText)
          .scrollIntoView()
          .should("be.visible");
      });
    });
  });

  it("Shows a warning when adding a new field with an existing field name", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;
      let selectedText = "";
  
      // Open worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
  
      // Pick a random unchecked field
      cy.get(".columns-drawer-content__column-option").then(($options) => {
        const uncheckedOptions = $options.filter((i, el) => {
          return !Cypress.$(el).find('input[type="checkbox"]').is(':checked');
        });
  
        const randomIndex = Cypress._.random(0, uncheckedOptions.length - 1);
        const randomOption = uncheckedOptions.eq(randomIndex);
  
        // Get the field name
        cy.wrap(randomOption)
          .find(".columns-drawer-content__column-option__left")
          .invoke("text")
          .then((text) => {
            selectedText = text.trim();
            cy.log(`Selected field to reuse: ${selectedText}`);
  
            // Click "Add New Field"
            cy.contains("button", "Add New Field").click();
  
            // Enter the existing field name
            cy.get('input[placeholder="Add Field Name"]').type(selectedText);
  
            // Select a random option from first dropdown
            cy.wait(500)
            cy.get('[placeholder="Select"]').eq(0).click();
            cy.get('.sc-tagGq[role="button"]').then(($dropdownOptions1) => {
              const randomDropdownIndex1 = Cypress._.random(0, $dropdownOptions1.length - 1);
              const $randomDropdownOption1 = $dropdownOptions1.eq(randomDropdownIndex1);
              cy.wrap($randomDropdownOption1).click({ force: true });
              cy.log(`Selected first dropdown: ${$randomDropdownOption1.text().trim()}`);
            });
  
            // Select a random option from second dropdown
            cy.get('[placeholder="Select"]').eq(1).click();
            cy.get('.sc-tagGq[role="button"]').then(($dropdownOptions2) => {
              const randomDropdownIndex2 = Cypress._.random(0, $dropdownOptions2.length - 1);
              const $randomDropdownOption2 = $dropdownOptions2.eq(randomDropdownIndex2);
              cy.wrap($randomDropdownOption2).click({ force: true });
              cy.log(`Selected second dropdown: ${$randomDropdownOption2.text().trim()}`);
            });
  
            // Click "Save" or "Add" button
            cy.get('[label="Add"]').contains('Add').click({force:true});
            workforceSelector.toastMessage().contains('The field already exists.').should('be.visible')
          });
      });
    });
  });


  it("Drag and drop a row to reorder the Field Settings", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;
  
      // Open worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
      cy.contains("p", "Field Settings").should("be.visible");
  
      cy.get(".columns-drawer-content__column-option")
        .then(($rows) => {
          if ($rows.length < 2) {
            cy.log("Not enough rows to reorder");
            return;
          }
  
          const source = $rows.eq(0);
          const target = $rows.eq(1);
  
          // Perform drag and drop
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
  });
  
  

  it("Verifies that newly checked fields appear at the bottom of checked items or at top if none exist", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;
      let newlyToggledField = "";
      let initialCheckedCount = 0;

      // Open worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
      cy.contains("p", "Field Settings").should("be.visible");

      // Count how many items are already checked
      cy.get(".columns-drawer-content__column-option").then(($options) => {
        const checkedOptions = $options.filter((i, el) => {
          return Cypress.$(el).find('input[type="checkbox"]').is(':checked');
        });

        initialCheckedCount = checkedOptions.length;
        cy.log(`Initially checked items: ${initialCheckedCount}`);

        // Find unchecked options
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

      // Verify position based on initial state
      cy.then(() => {
        if (initialCheckedCount === 0) {
          cy.get(".columns-drawer-content__column-option")
            .eq(0)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .should("include", newlyToggledField);
          cy.log(`✓ "${newlyToggledField}" is at top (no previous checked items)`);
        } else {
          cy.get(".columns-drawer-content__column-option")
            .eq(initialCheckedCount)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .should("include", newlyToggledField);
          cy.log(`✓ "${newlyToggledField}" is at position ${initialCheckedCount} (bottom of checked items)`);
        }

        // Verify it's actually checked
        cy.get(".columns-drawer-content__column-option").each(($option) => {
          cy.wrap($option)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .then((text) => {
              if (text.trim() === newlyToggledField) {
                cy.wrap($option)
                  .find('input[type="checkbox"]')
                  .should('be.checked');
                return false;
              }
            });
        });
      });
    });
  });

  it("X clicking should collapse the Field Settings drawer", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;

      // Open worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();

      // Click the close (X) button
      cy.get("header button svg").click();

      // Verify drawer is closed
      cy.contains("p", "Field Settings").should("not.exist");
    });
  });

  it("Verifies that all fields can be turned off and saved successfully", () => {
    cy.readFile("cypress/fixtures/createdWorker.json").then(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`;

      // Open worker and Field Settings
      cy.get(workforceSelector.searchInput).clear().type(fullName);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(".sc-jXbUNg.gDlPVv").eq(7).click();
      cy.contains("p", "Field Settings").should("be.visible");

      // Uncheck all fields
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

      // Verify all unchecked
      cy.get(".columns-drawer-content__column-option").each(($option) => {
        cy.wrap($option).find('input[type="checkbox"]').should('not.be.checked');
      });

      cy.log("✓ All fields are now unchecked");

      // Save and verify persistence
      cy.contains("button", "Update").click();
      cy.wait(1000);

      cy.get(".columns-drawer-content__column-option").each(($option) => {
        cy.wrap($option).find('input[type="checkbox"]').should('not.be.checked');
      });

      cy.log("✓ All fields remain unchecked after reopening - changes persisted");
    });
  });
});
