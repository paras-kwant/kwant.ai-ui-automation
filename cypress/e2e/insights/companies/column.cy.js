/// <reference types="cypress" />
import { columnPage } from '../../../pages/insights/companies/column';

describe("Insight-Company Module - column", { tags: ["Epic:WorkForce", "Feature:Companies Module"] }, () => {

  beforeEach(() => {
    columnPage.visit();
    columnPage.selectFirstSelectorItem();
  });

  it('Insight-Company - Validate drag and drop column syncs with table headers', () => {
    columnPage.assertTableRowsExist();
    columnPage.openColumnDrawer();

    columnPage.getDrawerColumnLabels().then(initialOrder => {
      cy.log('Initial Drawer Order:', initialOrder);

      const sourceIndex = 1;
      const targetIndex = 2;
      const draggedColumn = initialOrder[sourceIndex];

      const expectedOrder = [...initialOrder];
      expectedOrder.splice(sourceIndex, 1);
      expectedOrder.splice(targetIndex, 0, draggedColumn);

      cy.log('Expected Drawer Order:', expectedOrder);

      columnPage.dragColumn(sourceIndex, targetIndex);

      cy.wait(1000);
      columnPage.clickSave();
      columnPage.closeDrawerByClickingOutside();

      columnPage.getTableColumns().then(tableColumns => {
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

  it('Insight-Company - Verify horizontal scroll availability based on number of table columns', { tags: ["Story:Horizontal Scroll Validation", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
    columnPage.assertHorizontalScrollBehavior();
  });

  it('Insight-Company - save button should be disable when their is no chnage', () => {
    columnPage.assertTableRowsVisible();
    columnPage.openColumnDrawer();
    cy.wait(1000);
    columnPage.assertSaveDisabled();
  });

  it('Insight-Company - reset the column setting', {}, () => {
    columnPage.assertTableRowsVisible();
    columnPage.openColumnDrawer();
    columnPage.clickReset();
    columnPage.assertResetToastVisible();
    columnPage.assertColumnUnchecked('actualHours');
    columnPage.assertColumnUnchecked('avgActualHours');
    columnPage.assertColumnUnchecked('varianceHours');
  });

  it('Insight-Company - save button should be enabled when their is chnage', () => {
    cy.get('[type="success"]').should('not.exist');
    columnPage.assertTableRowsVisible();
    columnPage.openColumnDrawer();
    columnPage.clickReset();
    cy.wait(1000);
    columnPage.checkColumn('varianceHours');
    columnPage.assertColumnChecked('varianceHours');
    columnPage.assertSaveEnabled();
  });

  it('Insight-Company - Validate checked columns appear in table in same pattern', () => {
    columnPage.assertTableRowsExist();
    columnPage.openColumnDrawer();

    columnPage.getCheckedColumnNames().then(checkedColumns => {
      cy.log('Checked Columns:', checkedColumns);
      columnPage.closeDrawerByClickingOutside();

      columnPage.getTableColumns().then(tableColumns => {
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

  it('Insight-Company - clicking on the x icon should close the column setting drawer', {}, () => {
    columnPage.assertTableRowsExist();
    columnPage.openColumnDrawer();
    columnPage.assertDrawerVisible();
    columnPage.closeDrawerByXIcon();
    columnPage.assertDrawerClosed();
  });

  it('Insight-Company - clicking outside the drawer should close the column setting drawer', () => {
    columnPage.assertTableRowsExist();
    columnPage.openColumnDrawer();
    columnPage.assertDrawerVisible();
    columnPage.closeDrawerByClickingOutside();
    columnPage.assertDrawerClosed();
  });

});
