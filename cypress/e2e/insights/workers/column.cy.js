/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import WorkerHelper from "../../../support/helper/workerHelper";
import { workforceSelector } from '../../../support/workforceSelector';

describe("Insight-worker Module - column", { tags: ["Epic:insight", "Feature:Companies Module"] }, () => {

  beforeEach(() => {
	cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('5007477836'));
    cy.get('.selector-item.first').click()
    cy.get('.selector-item.first').should('have.class', 'active');
  });
  
  it('Insight-Worker - Validate drag and drop column syncs with table headers', () => {

    cy.get(workforceSelector.tableRow).should('exist');
  
    // Open column drawer
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  
    // Capture initial drawer order
    cy.get('.columns-drawer-content__column-option__left')
      .then($els => $els.map((i, el) => el.innerText.trim()).get())
      .then(initialOrder => {
  
        cy.log('Initial Drawer Order:', initialOrder);
  
        const sourceIndex = 0;
        const targetIndex = 1;
        const draggedColumn = initialOrder[sourceIndex];
  
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
  
            for (let i = 1; i <= 10; i++) {
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
  
        cy.get(workforceSelector.tableColumn)
          .should('exist')
          .then($cols => {
            const tableColumns = [...$cols]
              .map(col => col.innerText.trim())
              .filter(text => text !== '');
            cy.log('Table Columns:', tableColumns);
            const filteredExpected = expectedOrder.filter(col => tableColumns.includes(col));
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

  
  it('Insight-Worker - save button should be disable when their is no chnage', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.wait(1000);
    cy.get('[label="Save"] button').should('be.disabled');
  });

  it('Insight-Worker - reset the column setting', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.get('[label="Reset to default"] button').should('be.visible').click();
    cy.get(workforceSelector.toastMessage)
      .contains('Columns reset successfully.').should('be.visible');
    cy.get('[data-rbd-drag-handle-draggable-id="projectCode"]').find('input[type="checkbox"]').should('not.be.checked');
  });

  it('Insight-WOrker - save button should be enabled when their is chnage', () => {
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.get('[label="Reset to default"] button').should('be.visible').click();
    cy.wait(1000)
    cy.get('[data-rbd-drag-handle-draggable-id="projectCode"]').find('input[type="checkbox"]').check({ force: true });
    cy.get('[data-rbd-drag-handle-draggable-id="projectCode"]').find('input[type="checkbox"]').should('be.checked');
    cy.get('[label="Save"] button').should('be.enabled');
  });

  it('Insight-Worker - Validate checked columns appear in table in same pattern', () => {

    cy.get(workforceSelector.tableRow).should('exist');

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

      cy.get('body').click(0, 0);

      cy.get(workforceSelector.tableColumn)
        .should('exist')
        .then($cols => {

          const tableColumns = [...$cols]
            .map(col => col.innerText.trim())
            .filter(text => text !== "");

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

  it('Insight-Worker - clicking on the x icon should close the column setting drawer', () => {
    cy.get(workforceSelector.tableRow).should('exist');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
    cy.get('header button svg').click();
    cy.contains('.columns-drawer-header', 'Column Settings').should('not.exist');
  });

  it('Insight-Worker - clicking outside the drawer should close the column setting drawer', () => {
    cy.get(workforceSelector.tableRow).should('exist');
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
    cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
    cy.get('body').click(0, 0);
    cy.contains('.columns-drawer-header', 'Column Settings').should('not.exist');
  });

});