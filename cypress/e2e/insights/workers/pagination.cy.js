/// <reference types="cypress" />

import paginationPage from '../../../pages/insights/workers/pagination';

describe("Insights-Workers Module - Pagination", { tags: ["Epic:WorkForce", "Feature:Pagination", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    paginationPage.visit('5007477836');
    paginationPage.switchToCardLayout();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Default Page Focus
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify pagination is visible and default page is focused', {
    tags: ["Story:Pagination Default Page Focused", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertPageIsFocused('1');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Page 2 Existence
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Workers - Verify pagination breaks into pages if 100+ workers exist', {
    tags: ["Story:Pagination Breaks Into Pages", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.getTotalWorkers().then((totalValue) => {
      if (totalValue > 100) {
        paginationPage.assertPage2Visible();
      } else {
        paginationPage.assertPage2NotExist();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Next / Prev Navigation
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify Next and previous button navigates to respective page', {
    tags: ["Story:Next Previous Button Navigation", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.getTotalWorkers().then((totalValue) => {
      const totalPages = paginationPage.getTotalPages(totalValue);

      if (totalPages > 1) {
        paginationPage.assertPrevDisabled();
        paginationPage.assertNextEnabled();

        paginationPage.clickNextButton();
        paginationPage.assertPrevEnabled();
        paginationPage.assertNextEnabled();

        paginationPage.clickPrevButton();
        paginationPage.assertPrevDisabled();
      } else {
        paginationPage.assertPrevDisabled();
        paginationPage.assertNextDisabled();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Ellipsis
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify ellipsis appears when total pages exceed threshold', {
    tags: ["Story:Ellipsis Appears On Many Pages", "Severity:normal", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertFirstRowVisible();
    paginationPage.getTotalWorkers().then((totalValue) => {
      cy.log('Total Workers:', totalValue);
      if (totalValue > 800) {
        paginationPage.assertEllipsisVisible();
      } else {
        paginationPage.assertEllipsisNotExist();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Last Page Disables Next
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify LAST page disables Next button', {
    tags: ["Story:Last Page Disables Next Button", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertFirstRowVisible();
    paginationPage.getTotalWorkers().then((totalValue) => {
      const totalPages = paginationPage.getTotalPages(totalValue);
      if (totalPages > 1) {
        paginationPage.clickLastNumberedPage();
        paginationPage.assertNextDisabled();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // First Page Disables Prev
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify FIRST page disables previous button', {
    tags: ["Story:First Page Disables Previous Button", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertFirstRowVisible();
    paginationPage.getTotalWorkers().then((totalValue) => {
      const totalPages = paginationPage.getTotalPages(totalValue);
      if (totalPages > 1) {
        paginationPage.clickFirstNumberedPage();
        paginationPage.assertPrevDisabled();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Page Number Click Navigation
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify clicking page numbers navigates to correct page', {
    tags: ["Story:Page Number Navigation", "Severity:critical", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertFirstRowVisible();
    paginationPage.getTotalWorkers().then((totalValue) => {
      const totalPages = paginationPage.getTotalPages(totalValue);

      if (totalPages > 3) {
        paginationPage.clickNumberedPageByIndex(1);
        paginationPage.assertNumberedPageIsFocusedByIndex(1);

        paginationPage.clickNumberedPageByIndex(2);
        paginationPage.assertNumberedPageIsFocusedByIndex(2);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll Resets on Page Change
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-workers - Verify page scroll resets to top after navigating between pages', {
    tags: ["Story:Scroll Resets On Page Navigation", "Severity:normal", "UI", "Module:WorkForce-Company"]
  }, () => {
    paginationPage.assertFirstRowVisible();
    paginationPage.getTotalWorkers().then((totalValue) => {
      const totalPages = paginationPage.getTotalPages(totalValue);

      if (totalPages < 2) return;

      paginationPage.scrollTableToBottom();
      paginationPage.assertTableScrolledDown();

      paginationPage.clickPageByLabel('2');
      paginationPage.assertFirstRowVisible();
      paginationPage.assertTableScrolledToTop();
    });
  });

});