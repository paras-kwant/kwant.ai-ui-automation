/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Field Settings", () => {
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains("Regression test").click();
    });
  });

  it("Validates the UI of the Field Settings drawer", () => {
    cy.visit("/projects/94049707/workers");

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
    cy.visit("/projects/94049707/workers");
  
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
        // Filter only unchecked options
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

  it("Verifies that newly checked fields appear at the bottom of checked items or at top if none exist", () => {
    cy.visit("/projects/94049707/workers");
  
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
  
        // Pick a random unchecked field
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
          // Should be at the very top (position 0)
          cy.get(".columns-drawer-content__column-option")
            .eq(0)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .should("include", newlyToggledField);
          
          cy.log(`✓ "${newlyToggledField}" is at top (no previous checked items)`);
        } else {
          // Should be at the bottom of checked items (position = initialCheckedCount)
          cy.get(".columns-drawer-content__column-option")
            .eq(initialCheckedCount)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .should("include", newlyToggledField);
          
          cy.log(`✓ "${newlyToggledField}" is at position ${initialCheckedCount} (bottom of checked items)`);
        }
  
        // Also verify it's actually checked
        cy.get(".columns-drawer-content__column-option").each(($option) => {
          cy.wrap($option)
            .find(".columns-drawer-content__column-option__left")
            .invoke("text")
            .then((text) => {
              if (text.trim() === newlyToggledField) {
                cy.wrap($option)
                  .find('input[type="checkbox"]')
                  .should('be.checked');
                return false; // Break loop
              }
            });
        });
      });
    });
  });
});
