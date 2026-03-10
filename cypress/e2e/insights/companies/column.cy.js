/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../../support/helper/companiesHelper';
import { workforceSelector } from '../../../support/workforceSelector';

describe("WorkForce Companies Module - column", { tags: ["Epic:WorkForce", "Feature:Companies Module"] }, () => {

  beforeEach(() => {
	cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));
  });
  
  it('WorkForce-Company - Validate drag and drop column syncs with table headers', () => {

    cy.get(workforceSelector.tableRow).should('exist');
  
    // Open column drawer
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  
    // Capture initial drawer order
    cy.get('.columns-drawer-content__column-option__left')
      .then($els => $els.map((i, el) => el.innerText.trim()).get())
      .then(initialOrder => {
  
        cy.log('Initial Drawer Order:', initialOrder);
  
        const sourceIndex = 1; // column to drag
        const targetIndex = 2; // drop target
        const draggedColumn = initialOrder[sourceIndex];
  
        // Expected drawer order after drag
        const expectedOrder = [...initialOrder];
        expectedOrder.splice(sourceIndex, 1);
        expectedOrder.splice(targetIndex, 0, draggedColumn);
  
        cy.log('Expected Drawer Order:', expectedOrder);
  
        // Perform drag & drop
        cy.get('[data-rbd-draggable-id]').eq(sourceIndex).then($draggable => {
          cy.get('.columns-drawer-content__column-option').eq(targetIndex).then($target => {
            const s = $draggable[0].getBoundingClientRect();
            const t = $target[0].getBoundingClientRect();
            const startX = s.left + s.width / 2;
            const startY = s.top + s.height / 2;
            const endX = t.left + t.width / 2;
            const endY = t.top + t.height / 2;
  
            cy.wrap($draggable)
              .trigger('touchstart', { touches: [{ clientX: startX, clientY: startY }], force: true })
              .wait(200);
  
            for (let i = 1; i <= 8; i++) {
              const currentX = startX + ((endX - startX) * i / 8);
              const currentY = startY + ((endY - startY) * i / 8);
              cy.wrap($draggable)
                .trigger('touchmove', { touches: [{ clientX: currentX, clientY: currentY }], force: true })
                .wait(100);
            }
  
            cy.wrap($draggable).trigger('touchend', { touches: [], force: true });
          });
        });
  
        cy.wait(1000);
  
        cy.get(workforceSelector.saveButton).click();
        cy.wait(1000);
        cy.get('body').click(0, 0);
  
        // Validate table headers exist in the same order as drawer
        cy.get(workforceSelector.tableColumn)
          .should('exist')
          .then($cols => {
            const tableColumns = [...$cols]
              .map(col => col.innerText.trim())
              .filter(text => text !== '');
  
            cy.log('Table Columns:', tableColumns);
  
            // Only compare the columns that actually exist in table
            const filteredExpected = expectedOrder.filter(col => tableColumns.includes(col));
  
            // Check table columns are in the same order as expected
            let lastIndex = -1;
            filteredExpected.forEach(col => {
              const index = tableColumns.indexOf(col);
              expect(index, `${col} should exist in table`).to.be.greaterThan(-1);
              expect(index, `${col} should maintain order`).to.be.greaterThan(lastIndex);
              lastIndex = index;
            });
          });
  
      });
  
  });
it('WorkForce-Company - Verify horizontal scroll availability based on number of table columns', { tags: ["Story:Horizontal Scroll Validation", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
    cy.get(workforceSelector.tableColumn).then($columns => {
      const columnCount = $columns.length;

      cy.get('.table-wrapper').then($wrapper => {
        const el = $wrapper[0];

        if (columnCount > 6) {
          expect(el.scrollWidth, 'scrollWidth').to.be.greaterThan(el.clientWidth);

          cy.wrap($wrapper)
            .scrollTo('right', { duration: 300 });

          cy.wrap($wrapper)
            .invoke('scrollLeft')
            .should('be.gt', 0);

        } else {
          expect(el.scrollWidth, 'scrollWidth')
            .to.equal(el.clientWidth);
        }
      });
    });
  }
);

it('save button should be disable when their is no chnage ', ()=>{
  cy.get(workforceSelector.tableRow).should('be.visible');
	  cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  cy.wait(1000);
  cy.get('[label="Save"] button').should('be.disabled')
})

it('reset the column setting', ()=>{
  cy.get(workforceSelector.tableRow).should('be.visible');
  cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  cy.get('[label="Reset to default"] button').should('be.visible').click()
  cy.get(workforceSelector.toastMessage)
      .contains('Column settings reset successfully').should('be.visible')
      cy.get('[data-rbd-draggable-id="actualHours"]').find('input[type="checkbox"]').should('not.be.checked')
      cy.get('[data-rbd-draggable-id="avgActualHours"]').find('input[type="checkbox"]').should('not.be.checked')
      cy.get('[data-rbd-draggable-id="varianceHours"]').find('input[type="checkbox"]').should('not.be.checked')
})

it('save button should be enabled when their is chnage', ()=>{
  cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.get('[label="Reset to default"] button').should('be.visible').click()
  cy.get('[data-rbd-draggable-id="varianceHours"]').find('input[type="checkbox"]').check({force: true})
  cy.get('[label="Save"] button').should('be.enabled')
})

it('WorkForce-Company - Validate checked columns appear in table in same pattern', () => {

  cy.get(workforceSelector.tableRow).should('exist');

  // open column drawer
  cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });

  const checkedColumns = [];

  cy.get('[data-rbd-draggable-id]').each($col => {

    const checkbox = $col.find('input[type="checkbox"]');

    if (checkbox.prop('checked')) {    
      const columnName = $col
        .find('.columns-drawer-content__column-option__left')
        .text()
        .trim();

      checkedColumns.push(columnName);
    }

  }).then(() => {

    cy.log('Checked Columns:', checkedColumns);

    // close drawer
    cy.get('body').click(0,0);

    cy.get(workforceSelector.tableColumn)
      .should('exist')
      .then($cols => {

        const tableColumns = [...$cols]
          .map(col => col.innerText.trim())
          .filter(text => text !== ""); // removes shell/empty columns

        cy.log('Table Columns:', tableColumns);

        let lastIndex = -1;

        checkedColumns.forEach(col => {

          const index = tableColumns.indexOf(col);

          expect(index, `${col} should exist in table`).to.be.greaterThan(-1);
          expect(index, `${col} should maintain order`).to.be.greaterThan(lastIndex);

          lastIndex = index;

        });

      });

  });

});

it('clicking on the x icon should close the column setting drawer', () => {
  cy.get(workforceSelector.tableRow).should('exist');
  cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
  cy.get('header button svg').click();

cy.contains('.columns-drawer-header', 'Column Settings').should('not.exist');
})
it('clicking outside the drawer should close the column setting drawer', () => {
  cy.get(workforceSelector.tableRow).should('exist');
  cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
  cy.get('body').click(0,0);
  cy.contains('.columns-drawer-header', 'Column Settings').should('not.exist');
})

})
