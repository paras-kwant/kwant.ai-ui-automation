// cypress/pages/insights/workers/calendarFilter.js

import WorkerHelper from '../../../support/helper/workerHelper';

class CalendarFilterPage {

  // ─── Navigation ───────────────────────────────────────────────

  visit(clientId = '500526306') {
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage(clientId));
  }

  // ─── Intercepts ───────────────────────────────────────────────

  interceptCalendarAPI() {
    cy.intercept('POST', '**/api/empinsight/work_table*').as('calendarApi');
  }

  waitForCalendarAPI() {
    return cy.wait('@calendarApi');
  }

  // ─── Calendar Open / Close ────────────────────────────────────

  getCalendarButton() {
    return cy.get('.filters_header_right_section button').contains('/');
  }

  openCalendar() {
    this.getCalendarButton().click();
    cy.get('.rmdp-calendar').should('be.visible');
  }

  closeCalendarByClickingOutside() {
    cy.get('body').click(0, 0);
  }

  assertCalendarClosed() {
    cy.get('.rmdp-calendar').should('not.exist');
  }

  // ─── Filter Buttons ───────────────────────────────────────────

  clickFilterOption(label) {
    cy.contains('button p', label).click();
  }

  assertFilterOptionsVisible() {
    const filters = ['Current Week', 'Last Week', 'Last 2 Weeks', 'Custom Range'];
    filters.forEach(filter => cy.contains('button p', filter).should('be.visible'));
  }

  // ─── Range Highlights ─────────────────────────────────────────

  getRangeHighlightedDays() {
    return cy.get('.rmdp-day.rmdp-range');
  }

  assertRangeHighlightedDays(expectedDates) {
    cy.get('.rmdp-day.rmdp-range').each(($el) => {
      expect(expectedDates.includes($el.text().trim())).to.be.true;
    });
  }

  assertRangeLength(length) {
    this.getRangeHighlightedDays().should('have.length', length);
  }

  assertRangeLengthAtLeast(length) {
    this.getRangeHighlightedDays().should('have.length.at.least', length);
  }

  assertRangeLengthGte(length) {
    this.getRangeHighlightedDays().should('have.length.gte', length);
  }

  // ─── Month Navigation ─────────────────────────────────────────

  getCalendarHeaderText() {
    return cy.get('.rmdp-header-values').first().invoke('text');
  }

  clickNextMonth() {
    cy.get('[role="dialog"] button').filter(':visible').last().click();
  }

  clickPrevMonth() {
    cy.get('[role="dialog"] button').filter(':visible').first().click();
  }

  // ─── Custom Range ─────────────────────────────────────────────

  getEnabledDays() {
    return cy.get('.rmdp-day:not(.rmdp-disabled)');
  }

  selectCustomDateRange(startRatio = 0.2, endRatio = 0.5) {
    return this.getEnabledDays().then(($days) => {
      const total = $days.length;
      const startIndex = Math.floor(total * startRatio);
      const endIndex = Math.floor(total * endRatio);

      const startEl = $days.eq(startIndex);
      const endEl = $days.eq(endIndex);

      const startDateStr = startEl.attr('data-date');
      const endDateStr = endEl.attr('data-date');

      const startDate = startDateStr
        ? new Date(startDateStr)
        : new Date(0, 0, parseInt(startEl.text().trim()));
      const endDate = endDateStr
        ? new Date(endDateStr)
        : new Date(0, 0, parseInt(endEl.text().trim()));

      cy.wrap(startEl).click();
      cy.wrap(endEl).click();

      return cy.wrap({ startDate, endDate });
    });
  }

  selectReverseDateRange(laterRatio = 0.7, earlierRatio = 0.3) {
    return this.getEnabledDays().then(($days) => {
      const total = $days.length;
      cy.wrap($days.eq(Math.floor(total * laterRatio))).click({ force: true });
      cy.wrap($days.eq(Math.floor(total * earlierRatio))).click({ force: true });
    });
  }


  // ─── Date Helpers ─────────────────────────────────────────────

  getCurrentWeekDates() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return this._buildDateRange(start, end);
  }

  getLastWeekDates() {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    const start = new Date(startOfThisWeek);
    start.setDate(startOfThisWeek.getDate() - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return this._buildDateRange(start, end);
  }

  _buildDateRange(start, end) {
    const dates = [];
    const temp = new Date(start);
    while (temp <= end) {
      dates.push(temp.getDate().toString());
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  }
}

export default new CalendarFilterPage();