// cypress/pages/insights/workers/columnSettings.js

import { workforceSelector } from '../../../support/workforceSelector';
import WorkerHelper from '../../../support/helper/workerHelper';

class ColumnSettingsPage {

  // ─── Navigation ───────────────────────────────────────────────

  visit(clientId = '5007477836') {
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage(clientId));
  }

  selectFirstSelectorItem() {
    cy.get('.loader-image').should('not.exist');
    cy.get('.selector-item.first').click();
    cy.get('.selector-item.first').should('have.class', 'active');
  }

  // ─── Column Drawer ────────────────────────────────────────────

  openColumnDrawer() {
    cy.get('[clip-path="url(#table_chart_svg__a)"]').first().click({ force: true });
  }

  closeDrawerByXIcon() {
    cy.get('header button svg').click();
  }

  closeDrawerByClickingOutside() {
    cy.get('body').click(0, 0);
  }

  assertDrawerVisible() {
    cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');
  }

  assertDrawerClosed() {
    cy.contains('.columns-drawer-header', 'Column Settings').should('not.exist');
  }

  // ─── Drawer Options ───────────────────────────────────────────

  getDrawerColumnLabels() {
    return cy.get('.columns-drawer-content__column-option__left')
      .then($els => $els.map((i, el) => el.innerText.trim()).get());
  }

  getDraggableItems() {
    return cy.get('[data-rbd-draggable-id]');
  }

  // ─── Drag & Drop ─────────────────────────────────────────────

  dragColumn(sourceIndex, targetIndex) {
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
  }

  // ─── Save / Reset Buttons ─────────────────────────────────────

  clickSave() {
    cy.get(workforceSelector.saveButton).click();
    cy.wait(1000);
  }

  clickReset() {
    cy.get('[label="Reset to default"] button').should('be.visible').click();
  }

  assertSaveDisabled() {
    cy.get('[label="Save"] button').should('be.disabled');
  }

  assertSaveEnabled() {
    cy.get('[label="Save"] button').should('be.enabled');
  }

  // ─── Checkbox Interactions ────────────────────────────────────

  getColumnCheckbox(draggableId) {
    return cy.get(`[data-rbd-drag-handle-draggable-id="${draggableId}"]`)
      .find('input[type="checkbox"]');
  }

  checkColumn(draggableId) {
    this.getColumnCheckbox(draggableId).check({ force: true });
  }

  assertColumnChecked(draggableId) {
    this.getColumnCheckbox(draggableId).should('be.checked');
  }

  assertColumnUnchecked(draggableId) {
    this.getColumnCheckbox(draggableId).should('not.be.checked');
  }

  // ─── Table Assertions ─────────────────────────────────────────

  assertTableRowsVisible() {
    cy.get(workforceSelector.tableRow).should('be.visible');
  }

  assertTableRowsExist() {
    cy.get(workforceSelector.tableRow).should('exist');
  }

  assertTableEmptyOrVisible() {
    cy.get('body').then($body => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.log('Table has data — asserting rows visible');
        this.assertTableRowsExist();
      } else {
        cy.log('Table is empty — asserting empty state visible');
        cy.get('.empty-state').should('be.visible');
      }
    });
  }

  getTableColumns() {
    return cy.get(workforceSelector.tableColumn)
      .should('exist')
      .then($cols => [...$cols].map(col => col.innerText.trim()).filter(text => text !== ''));
  }

  // ─── Toast ────────────────────────────────────────────────────

  assertResetToastVisible() {
    cy.get(workforceSelector.toastMessage)
      .contains('Columns reset successfully.').should('be.visible');
  }

  // ─── Checked Columns Helper ───────────────────────────────────

  getCheckedColumnNames() {
    const checkedColumns = [];
    return cy.get('[data-rbd-draggable-id]').each($col => {
      const checkbox = $col.find('input[type="checkbox"]');
      if (checkbox.prop('checked')) {
        const columnName = $col
          .find('.columns-drawer-content__column-option__left')
          .text()
          .trim();
        checkedColumns.push(columnName);
      }
    }).then(() => checkedColumns);
  }
}

export default new ColumnSettingsPage();