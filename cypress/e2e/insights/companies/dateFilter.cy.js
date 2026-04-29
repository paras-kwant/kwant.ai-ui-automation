/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from "../../../support/helper/companiesHelper.js";

const getCalendarButton = () =>
  cy.get('.filters_header_right_section button').contains('/');

const openCalendar = () => {
  getCalendarButton().click();
  cy.get('.rmdp-calendar').should('be.visible');
};

const getEnabledDays = () =>
  cy.get('.rmdp-day:not(.rmdp-disabled)');

describe("Insights-Company Module - Calendar & Download Validation", { tags: ["Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5795237201'));
  });

  it('Insights-Company - Calendar options visible', {
    tags: ["Story:Validate Calendar Options", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    const filters = [
      "Today",
      "Current Week",
      "Last 7 Days",
      "Last 30 days",
      "This Month",
      "Project Duration",
      "Custom Range"
    ];
    filters.forEach(filter => cy.contains('button p', filter).should('be.visible'));
  });

  it('Insights-Company - Clicking outside closes calendar', {
    tags: ["Story:Calendar Close on Outside Click", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.get('body').click(0, 0);
    cy.get('.rmdp-calendar').should('not.exist');
  });

  it('Insights-Company - download for Today', {
    tags: ["Story:Download Report For Today", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    const today = new Date().getDate().toString();
    cy.intercept('POST', '**/api/insight/company/table*').as('calendarApi');

    openCalendar();
    cy.contains('button p', 'Today').click();
    cy.wait('@calendarApi').its('response.statusCode').should('eq', 200);

    openCalendar();
    cy.get('.rmdp-day.rmdp-range').contains(today).should('be.visible');
  });

  it('Insights-Company - Current Week selection highlights correct dates', {
    tags: ["Story:Current Week Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const expectedDates = [];
    const temp = new Date(start);
    while (temp <= end) {
      expectedDates.push(temp.getDate().toString());
      temp.setDate(temp.getDate() + 1);
    }

    cy.intercept('POST', '**/api/insight/company/table*').as('calendarApi');

    openCalendar();
    cy.contains('button p', 'Current Week').click();
    cy.wait('@calendarApi').its('response.statusCode').should('eq', 200);

    openCalendar();
    cy.get('.rmdp-day.rmdp-range').each(($el) => {
      expect(expectedDates.includes($el.text().trim())).to.be.true;
    });
  });

  it('Insights-Company - Last 7 Days selection', {
    tags: ["Story:Last 7 Days Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'Last 7 Days').click();

    openCalendar();
    cy.get('.rmdp-day.rmdp-range').should('have.length.at.least', 7);
  });

  it('Insights-Company - Switching filters updates selection', {
    tags: ["Story:Filter Switching", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'Today').click();
    openCalendar();
    cy.get('.rmdp-day.rmdp-range').should('have.length', 1);

    cy.contains('button p', 'Last 7 Days').click();
    openCalendar();
    cy.get('.rmdp-day.rmdp-range').should('have.length.at.least', 7);
  });

  it('Insights-Company - This Month selection', {
    tags: ["Story:This Month Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'This Month').click();

    openCalendar();
    cy.get('.rmdp-day.rmdp-range').its('length').should('be.within', 28, 31);
  });

  it('Insights-Company - Last 30 Days selection', {
    tags: ["Story:Last 30 Days Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'Last 30 days').click();

    openCalendar();
    cy.get('.rmdp-day.rmdp-range').should('have.length.at.least', 30);
  });

  it('Insights-Company - Custom Range date difference across two months', {
    tags: ["Story:Custom Range Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'Custom Range').click();

    getEnabledDays().then(($days) => {
      const total = $days.length;
      const startIndex = Math.floor(total * 0.2);
      const endIndex = Math.floor(total * 0.5);

      const startEl = $days.eq(startIndex);
      const endEl = $days.eq(endIndex);

      const startDateStr = startEl.attr('data-date');
      const endDateStr = endEl.attr('data-date');

      const startDate = startDateStr ? new Date(startDateStr) : new Date(0, 0, parseInt(startEl.text().trim()));
      const endDate = endDateStr ? new Date(endEl.attr('data-date')) : new Date(0, 0, parseInt(endEl.text().trim()));

      cy.wrap(startEl).click();
      cy.wrap(endEl).click();
      cy.get('body').click(0, 0);

      openCalendar();
      const expectedDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      cy.get('.rmdp-day.rmdp-range').should('have.length.gte', expectedDays);
    });
  });

  it('Insights-Company - Reverse date selection', {
    tags: ["Story:Reverse Date Selection", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();
    cy.contains('button p', 'Custom Range').click();

    getEnabledDays().then(($days) => {
      const total = $days.length;
      const laterIndex = Math.floor(total * 0.7);
      const earlierIndex = Math.floor(total * 0.3);

      cy.wrap($days.eq(laterIndex)).click();
      cy.wrap($days.eq(earlierIndex)).click();
    });

    cy.get('body').click(0, 0);
    getCalendarButton().should('contain.text', '/');
  });

  it('Insights-Company - Navigate between months', {
    tags: ["Story:Calendar Month Navigation", "Severity:normal", "UI", "Module:Insights-Company"]
  }, () => {
    openCalendar();

    cy.get('.rmdp-header-values').first().invoke('text').then((firstMonth) => {
      cy.get('[role="dialog"] button').filter(':visible').last().click();

      cy.get('.rmdp-header-values').first().invoke('text').should('not.eq', firstMonth);

      cy.get('[role="dialog"] button').filter(':visible').first().click();
      cy.get('.rmdp-header-values').first().invoke('text').should('eq', firstMonth);
    });
  });

});