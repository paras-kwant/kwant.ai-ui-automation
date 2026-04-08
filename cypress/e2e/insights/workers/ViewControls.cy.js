/// <reference types="cypress" />

import insightsWorkerPage from '../../../pages/insights/workers/viewControl';

describe(
  "Insights Workers Module - View Controls",
  { tags: ["Epic:Insights", "Feature:View Control", "Module:Insights-Worker"] },
  () => {

    beforeEach(() => {
      insightsWorkerPage.visit('500526306');
      insightsWorkerPage.selectFirstSelectorItem();
    });


    it('Insight-Worker - Clicking Last Update button should refresh table and return 200', {
      tags: ["Story:Unselect Worker Removes Count", "Severity:critical", "UI", "Module:Insights-Worker"]
    }, () => {
      insightsWorkerPage.interceptWorkerTableAPI();
      insightsWorkerPage.clickLastUpdateButton();

      insightsWorkerPage.waitForWorkerTableAPI()
        .its('response.statusCode')
        .should('eq', 200);

      insightsWorkerPage.assertLoaderGone();
      insightsWorkerPage.assertTableEmptyOrVisible();

      insightsWorkerPage.getLastUpdateTime();
      insightsWorkerPage.getLastUpdateTimeText().then(timeText => {
        const uiTime = timeText.trim();
        cy.log(`UI Time: ${uiTime}`);
        const currentTime = new Date().toTimeString().slice(0, 5);
        cy.log(`Current System Time: ${currentTime}`);
        expect(uiTime).to.match(/\d{1,2}:\d{2}/);
      });
    });


    it('Insight-Worker - Clicking previous week arrow should shift date range back by 7 days', {
      tags: ["Story:Worker Insight Date Filter", "Severity:normal", "UI", "Module:Insights-Worker"]
    }, () => {
      insightsWorkerPage.interceptWorkerTableAPI();

      insightsWorkerPage.getCurrentDateRangeText().then(initialRange => {
        cy.log('Initial date range:', initialRange);
        const [start, end] = insightsWorkerPage.parseDateRange(initialRange);

        insightsWorkerPage.clickPreviousWeekArrow();
        insightsWorkerPage.waitForWorkerTableAPI().its('response.statusCode').should('eq', 200);

        insightsWorkerPage.assertTableEmptyOrVisible();

        insightsWorkerPage.getCurrentDateRangeText().then(newRange => {
          cy.log('Updated date range:', newRange);
          const [newStart, newEnd] = insightsWorkerPage.parseDateRange(newRange);

          const diffStart = (start - newStart) / (1000 * 60 * 60 * 24);
          const diffEnd   = (end   - newEnd)   / (1000 * 60 * 60 * 24);

          expect(diffStart, 'Start date shifted back by 7 days').to.eq(7);
          expect(diffEnd,   'End date shifted back by 7 days').to.eq(7);
        });
      });
    });

    it('Insight-Worker - Clicking next week arrow should shift date range forward by 7 days', {
      tags: ["Story:Worker Insight Date Filter", "Severity:normal", "UI", "Module:Insights-Worker"]
    }, () => {
      insightsWorkerPage.interceptWorkerTableAPI();

      insightsWorkerPage.getCurrentDateRangeText().then(initialRange => {
        cy.log('Initial date range:', initialRange);
        const [start, end] = insightsWorkerPage.parseDateRange(initialRange);

        insightsWorkerPage.clickNextWeekArrow();
        insightsWorkerPage.waitForWorkerTableAPI().its('response.statusCode').should('eq', 200);

        insightsWorkerPage.assertTableEmptyOrVisible();

        insightsWorkerPage.getCurrentDateRangeText().then(newRange => {
          cy.log('Updated date range:', newRange);
          const [newStart, newEnd] = insightsWorkerPage.parseDateRange(newRange);

          const diffStart = (newStart - start) / (1000 * 60 * 60 * 24);
          const diffEnd   = (newEnd   - end)   / (1000 * 60 * 60 * 24);

          expect(diffStart, 'Start date shifted forward by 7 days').to.eq(7);
          expect(diffEnd,   'End date shifted forward by 7 days').to.eq(7);
        });
      });
    });

    it('Insight-Worker - Clicking On-site Hours button should open dropdown with multiple options', {
      tags: ["Story:On-site Hours Drawer", "Severity:normal", "UI", "Module:Insights-Worker"]
    }, () => {
      insightsWorkerPage.assertTableEmptyOrVisible();
      insightsWorkerPage.clickZoneTimeButton();
      insightsWorkerPage.getDropdownOptions().should('have.length.greaterThan', 1);
    });
    
    it('Insight-Worker - Switching to list layout should hide stat cards and switching back should show them', {
      tags: ["Story:Table Layout Switch", "Severity:normal", "UI", "Module:Insights-Worker"]
    }, () => {
      insightsWorkerPage.assertTableEmptyOrVisible();
      insightsWorkerPage.switchToListLayout();
      insightsWorkerPage.assertStatCardsHidden();
      insightsWorkerPage.switchToCardLayout();
      insightsWorkerPage.assertStatCardsVisible();
    });

  }
);