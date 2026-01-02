// cypress/pages/workforce/filterPage.js
import { addWorkerSelector } from '../../selector/addWorker.js';
import { workforceSelector } from '../../support/workforceSelector';

class filterPage {
  selectedOption = ""; // store the selected filter option

  // Apply a filter and select a random valid option
  applyFilter(filterType) {
    cy.contains(".sc-fremEr", filterType)
      .find("svg")
      .click({ force: true });

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const filtered = $parents.filter((i, el) => {
        const filterText = Cypress.$(el)
          .find(".sc-eldPxv.bVwlNE")
          .text()
          .trim();
        return filterText && filterText !== "None";
      });

      if (filtered.length === 0) {
        cy.log(`⚠️ No valid ${filterType} options found`);
        return;
      }

      const randomIndex = Cypress._.random(0, filtered.length - 1);
      const $randomParent = filtered.eq(randomIndex);
      this.selectedOption = $randomParent
        .find(".sc-eldPxv.bVwlNE")
        .text()
        .trim();

      cy.log(`Selected ${filterType}: ${this.selectedOption}`);
      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.contains("Filters:").click();
      cy.wait(1000); 
    });
  }

  verifyFilteredRows(actionButtonSelector, labelSelector) {
    cy.get("body").then(($body) => {
      const rowCount = $body.find(workforceSelector.tableRow).length;
      cy.log(`Total rows found: ${rowCount}`);
  
      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          cy.get(workforceSelector.tableRow)
            .eq(i)
            .scrollIntoView()
            .click({ force: true });
  
          // Click action button (drawer / menu / details)
          cy.get(actionButtonSelector).click({ force: true });
  
          // Verify selected filter label
          cy.get(labelSelector)
            .should("be.visible")
            .and("contain.text", this.selectedOption);
  
          // Close drawer / overlay
          cy.get("body").click(0, 0, { force: true });
  
          cy.log(`✅ Verified row ${i + 1}`);
        }
      } else {
        // ✅ Proper empty-state handling
        cy.get(".empty-body")
          .should("be.visible")
          .and(
            "have.text",
            "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
          );
      }
    });
  }
  
  
  
  
}

export default new filterPage();