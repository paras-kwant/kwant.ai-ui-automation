/// <reference types="cypress" />

import columnSettingsPage from '../../../pages/insights/workers/column';

describe("Insight-worker Module - column", { tags: ["Epic:insight", "Feature:Companies Module"] }, () => {

  beforeEach(() => {
    columnSettingsPage.visit('500526306');
    columnSettingsPage.selectFirstSelectorItem();
  });


  it('Insight-Worker - Validate drag and drop column syncs with table headers', () => {

    columnSettingsPage.assertTableRowsExist();
    columnSettingsPage.openColumnDrawer();

    columnSettingsPage.getDrawerColumnLabels().then(initialOrder => {
      cy.log('Initial Drawer Order:', initialOrder);

      const sourceIndex = 0;
      const targetIndex = 1;
      const draggedColumn = initialOrder[sourceIndex];

      const expectedOrder = [...initialOrder];
      expectedOrder.splice(sourceIndex, 1);
      expectedOrder.splice(targetIndex, 0, draggedColumn);

      cy.log('Expected Drawer Order:', expectedOrder);

      columnSettingsPage.dragColumn(sourceIndex, targetIndex);
      cy.wait(1000);

      columnSettingsPage.clickSave();
      columnSettingsPage.closeDrawerByClickingOutside();

      columnSettingsPage.getTableColumns().then(tableColumns => {
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


  it('Insight-Worker - save button should be disabled when there is no change', () => {
    columnSettingsPage.assertTableRowsVisible();
    columnSettingsPage.openColumnDrawer();
    cy.wait(1000);
    columnSettingsPage.assertSaveDisabled();
  });

  it('Insight-Worker - save button should be enabled when there is a change', () => {
    columnSettingsPage.assertTableRowsVisible();
    columnSettingsPage.openColumnDrawer();
    columnSettingsPage.clickReset();
    cy.wait(1000);
    columnSettingsPage.checkColumn('projectCode');
    columnSettingsPage.assertColumnChecked('projectCode');
    columnSettingsPage.assertSaveEnabled();
  });


  it('Insight-Worker - reset the column setting', () => {
    columnSettingsPage.assertTableRowsVisible();
    columnSettingsPage.openColumnDrawer();
    columnSettingsPage.clickReset();
    columnSettingsPage.assertResetToastVisible();
    columnSettingsPage.assertColumnUnchecked('projectCode');
  });


  it('Insight-Worker - Validate checked columns appear in table in same pattern', () => {

    columnSettingsPage.assertTableRowsExist();
    columnSettingsPage.openColumnDrawer();

    columnSettingsPage.getCheckedColumnNames().then(checkedColumns => {
      cy.log('Checked Columns:', checkedColumns);

      columnSettingsPage.closeDrawerByClickingOutside();

      columnSettingsPage.getTableColumns().then(tableColumns => {
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
    columnSettingsPage.assertTableRowsExist();
    columnSettingsPage.openColumnDrawer();
    columnSettingsPage.assertDrawerVisible();
    columnSettingsPage.closeDrawerByXIcon();
    columnSettingsPage.assertDrawerClosed();
  });

  it('Insight-Worker - clicking outside the drawer should close the column setting drawer', () => {
    columnSettingsPage.assertTableRowsExist();
    columnSettingsPage.openColumnDrawer();
    columnSettingsPage.assertDrawerVisible();
    columnSettingsPage.closeDrawerByClickingOutside();
    columnSettingsPage.assertDrawerClosed();
  });

});