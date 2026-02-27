import { workforceSelector } from "../../support/workforceSelector";

const SafetyAuditPage = {

  /**
   * Applies all safety alert column filters (excluding 'None').
   * Call ONCE in before() — not in every test.
   */
  applyAllSafetyAlertFilters: () => {
    cy.contains(workforceSelector.tableColumn, 'Safety Alert')
      .find('.table-header-filter-btn')
      .click();

    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const indicesToClick = [];

        $labels.each((index, label) => {
          const text = Cypress.$(label)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();

          if (text !== 'None') {
            indicesToClick.push(index);
          }
        });

        indicesToClick.forEach((index) => {
          cy.get('label[for^=":r"]').eq(index).click();
        });
      });
    });
	cy.get('p').contains('Filters:').click()
  cy.contains(workforceSelector.tableColumn, 'Safety Alert')
  .trigger('mouseover')   // simulate hover
  .find('.sorting-icon')
  .click({force:true});

  cy.get('.loader-image').should('not.exist');

  },

  openSafetyAuditDrawer: () => {
    cy.get(workforceSelector.tableRow)
      .eq(1)
      .click({ force: true });

    cy.get(workforceSelector.SafetyAuditPage).click();
  },

  /**
   * Adds a random comment. If a comment already exists, skips adding.
   */
  addRandomComment: (commentPrefix = 'Auto comment') => {
    const randomComment = `${commentPrefix} - ${Cypress._.random(1000, 9999)}`;

    cy.get('body').then(($body) => {
      if ($body.find('.comment-item-body__content').length === 0) {
        cy.get('textarea').clear().type(randomComment);
        cy.contains('button p', 'Add Comment').click();
        cy.get('.comment-item-body__content').eq(0).should('contain.text', randomComment);
      }
    });

    return cy.wrap(randomComment);
  },
};

export default SafetyAuditPage;