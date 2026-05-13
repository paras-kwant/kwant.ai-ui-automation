/// <reference types="cypress" />

import calendarFilterPage from '../../../pages/insights/workers/dateFilter';
describe("Insights-Workers Module - Calendar Validation", { tags: ["Module:Insights-Workers"] }, () => {

  beforeEach(() => {
    calendarFilterPage.visit('500526306');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Calendar Open / Close
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Workers - Calendar options visible', {
    tags: ["Story:Validate Calendar Options", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();
    calendarFilterPage.assertFilterOptionsVisible();
  });

  it('Insights-Workers - Clicking outside closes calendar', {
    tags: ["Story:Calendar Close on Outside Click", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();
    calendarFilterPage.closeCalendarByClickingOutside();
    calendarFilterPage.assertCalendarClosed();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Week Filter Selections
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Workers - Current Week selection highlights correct dates', {
    tags: ["Story:Current Week Selection", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    const expectedDates = calendarFilterPage.getCurrentWeekDates();

    calendarFilterPage.interceptCalendarAPI();
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Current Week');
    calendarFilterPage.waitForCalendarAPI().its('response.statusCode').should('eq', 200);

    calendarFilterPage.openCalendar();
    calendarFilterPage.assertRangeHighlightedDays(expectedDates);
  });

  it('Insights-Workers - Last Week selection highlights correct dates', {
    tags: ["Story:Last Week Selection", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    const expectedDates = calendarFilterPage.getLastWeekDates();

    calendarFilterPage.interceptCalendarAPI();
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Last Week');
    calendarFilterPage.waitForCalendarAPI().its('response.statusCode').should('eq', 200);

    calendarFilterPage.openCalendar();
    calendarFilterPage.assertRangeHighlightedDays(expectedDates);
  });

  it('Insights-Workers - Last 2 Weeks selection highlights correct dates', {
    tags: ["Story:Last 2 Weeks Selection", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.interceptCalendarAPI();
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Last 2 Weeks');
    calendarFilterPage.waitForCalendarAPI().its('response.statusCode').should('eq', 200);

    calendarFilterPage.openCalendar();
    calendarFilterPage.assertRangeLengthAtLeast(14);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Filter Switching
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Workers - Switching filters updates selection', {
    tags: ["Story:Filter Switching", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Current Week');

    calendarFilterPage.openCalendar();
    calendarFilterPage.assertRangeLengthAtLeast(7);

    calendarFilterPage.clickFilterOption('Last Week');
    calendarFilterPage.openCalendar();
    calendarFilterPage.assertRangeLength(7);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Custom Range
  // ─────────────────────────────────────────────────────────────────────────

  it.skip('Insights-Workers - Custom Range date selection', {
    tags: ["Story:Custom Range Selection", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Custom Range');

    calendarFilterPage.selectCustomDateRange(0.2, 0.5).then(({ startDate, endDate }) => {
      calendarFilterPage.closeCalendarByClickingOutside();

      calendarFilterPage.openCalendar();
      const expectedDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      calendarFilterPage.assertRangeLengthGte(expectedDays);
    });
  });

  it('Insights-Workers - Reverse date selection', {
    tags: ["Story:Reverse Date Selection", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();
    calendarFilterPage.clickFilterOption('Custom Range');
    calendarFilterPage.selectReverseDateRange(0.7, 0.3);

    calendarFilterPage.closeCalendarByClickingOutside();
    calendarFilterPage.getCalendarButton().should('contain.text', '/');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Month Navigation
  // ─────────────────────────────────────────────────────────────────────────

  it('Insights-Workers - Navigate between months', {
    tags: ["Story:Calendar Month Navigation", "Severity:normal", "UI", "Module:Insights-Workers"]
  }, () => {
    calendarFilterPage.openCalendar();

    calendarFilterPage.getCalendarHeaderText().then((firstMonth) => {
      calendarFilterPage.clickNextMonth();
      calendarFilterPage.getCalendarHeaderText().should('not.eq', firstMonth);

      calendarFilterPage.clickPrevMonth();
      calendarFilterPage.getCalendarHeaderText().should('eq', firstMonth);
    });
  });

});