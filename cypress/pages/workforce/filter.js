// cypress/pages/workforce/filterPage.js
import { addWorkerSelector } from '../../selector/addWorker.js';
import { workforceSelector } from '../../support/workforceSelector';

class filterPage {

  applyFilter(filterType) {
    cy.contains(workforceSelector.tableColumn, filterType)
      .find('.table-header-filter-btn')
      .click({ force: true });
  
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        expect(validLabels.length, `Non-None ${filterType} options available`)
          .to.be.greaterThan(0);
  
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        const $randomLabel = validLabels.eq(randomIndex);
  
        const selectedOption = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Selected ${filterType}: ${selectedOption}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        // Store as alias for later use
        cy.wrap(selectedOption).as('selectedFilterValue');
      });
    });
  
    cy.contains("Filters:").click();
    cy.wait(1000);
  }
  

verifyFilteredRows(actionButtonSelector, fieldLabel, expectedValue) {
  cy.wait(1000)
  cy.get("body").then(($body) => {
    const rowCount = $body.find(workforceSelector.tableRow).length;
    cy.log(`Total rows found: ${rowCount}`);

    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        cy.get(workforceSelector.tableRow)
          .eq(i)
          .scrollIntoView()
          .click({ force: true });

        cy.get(actionButtonSelector).click();

        cy.getWorkerField(fieldLabel)
          .should("exist")
          .and("contain.text", expectedValue);

        cy.get("body").click(0, 0, { force: true });

        cy.log(`✅ Verified row ${i + 1}: ${fieldLabel} = ${expectedValue}`);
      }
    } else {
      cy.get(".empty-body")
        .should("be.visible");
      cy.log('No results found - empty state displayed');
    }
  });
}
  
  
}

export default new filterPage();