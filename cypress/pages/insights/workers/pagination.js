// cypress/pages/insights/workers/pagination.js

import { workforceSelector } from '../../../support/workforceSelector';
import WorkerHelper from '../../../support/helper/workerHelper';

class PaginationPage {

  // ─── Navigation ───────────────────────────────────────────────

  visit(clientId = '500526306') {
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage(clientId));
    cy.wait(2000);
  }

  switchToCardLayout() {
    cy.get('.selector-item.last').click();
    cy.get('.selector-item.last').should('have.class', 'active');
  }

  // ─── Table ────────────────────────────────────────────────────

  assertFirstRowVisible() {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
  }

  // ─── Total Workers ────────────────────────────────────────────

  getTotalWorkers() {
    return cy.getTotalWorkers();
  }

  getTotalPages(totalWorkers, pageSize = 100) {
    return Math.ceil(totalWorkers / pageSize);
  }

  // ─── Footer / Pagination Buttons ──────────────────────────────

  getFooter() {
    return cy.get('.table_section_footer');
  }

  getPageButtonByLabel(label) {
    return cy.get('.table_section_footer button')
      .filter((_, el) => el.innerText.trim() === String(label));
  }

  getNumberedPageButtons() {
    return cy.get('.table_section_footer button')
      .filter((_, el) => /^\d+$/.test(el.innerText.trim()));
  }

  getPrevButton() {
    return cy.get('.table_section_footer button:has(svg)').first();
  }

  getNextButton() {
    return cy.get('.table_section_footer button:has(svg)').last();
  }

  clickNextButton() {
    this.getNextButton().click();
    cy.wait(1000);
  }

  clickPrevButton() {
    this.getPrevButton().click();
    cy.wait(1000);
  }

  clickPageByLabel(label) {
    this.getPageButtonByLabel(label).click();
  }

  clickNumberedPageByIndex(index) {
    this.getNumberedPageButtons().eq(index).click();
  }

  clickLastNumberedPage() {
    this.getNumberedPageButtons().last().click();
  }

  clickFirstNumberedPage() {
    this.getNumberedPageButtons().first().click();
  }

  // ─── Pagination Assertions ────────────────────────────────────

  assertPageIsFocused(label) {
    this.getPageButtonByLabel(label)
      .invoke('attr', 'class')
      .then((classValue) => {
        expect(classValue.split(' ').length).to.eq(6);
      });
  }

  assertNumberedPageIsFocusedByIndex(index) {
    this.getNumberedPageButtons()
      .eq(index)
      .invoke('attr', 'class')
      .then((classValue) => {
        expect(classValue.split(' ').length).to.eq(6);
      });
  }

  assertPage2Visible() {
    this.getPageButtonByLabel('2').should('be.visible');
  }

  assertPage2NotExist() {
    this.getPageButtonByLabel('2').should('not.exist');
  }

  assertPrevDisabled() {
    this.getPrevButton().should('be.disabled');
  }

  assertPrevEnabled() {
    this.getPrevButton().should('not.be.disabled');
  }

  assertNextDisabled() {
    this.getNextButton().should('be.disabled');
  }

  assertNextEnabled() {
    this.getNextButton().should('not.be.disabled');
  }

  assertEllipsisVisible() {
    this.getFooter().contains('…').should('be.visible');
  }

  assertEllipsisNotExist() {
    this.getFooter().contains('…').should('not.exist');
  }

  // ─── Scroll Assertions ────────────────────────────────────────

  scrollTableToBottom() {
    cy.get('.table-wrapper').scrollTo('bottom', { duration: 1000, ensureScrollable: false });
  }

  assertTableScrolledDown() {
    cy.get('.table-wrapper').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(0);
    });
  }

  assertTableScrolledToTop() {
    cy.get('.table-wrapper').then((wrapper) => {
      expect(wrapper[0].scrollTop).to.be.lte(0);
    });
  }
}

export default new PaginationPage();