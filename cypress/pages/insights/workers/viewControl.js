// cypress/pages/insights/workers/viewControl.js

import { workforceSelector } from '../../../support/workforceSelector';
import workerHelper from '../../../support/helper/workerHelper';

class InsightsWorkerPage {


  visit(clientId = '500526306') {
    cy.loginAndVisit(() => workerHelper.visitWorkersInsightPage(clientId));
    cy.wait(2000);
  }

  selectFirstSelectorItem() {
    cy.get('.selector-item.first').click();
    cy.get('.selector-item.first').should('have.class', 'active');
    cy.wait(1000);
  }


  interceptWorkerTableAPI() {
    cy.intercept('POST', '**/api/empinsight/work_table**').as('getWorkerTableData');
  }

  waitForWorkerTableAPI() {
    return cy.wait('@getWorkerTableData');
  }


  clickLastUpdateButton() {
    cy.contains('.insights-header-right-container p', 'Last Update:').click();
  }

  getLastUpdateTime() {
    return cy.get('.insights-header-right-container').within(() => {
      cy.get('p').eq(0).should('contain.text', 'Last Update:');
    });
  }

  getLastUpdateTimeText() {
    return cy.get('.insights-header-right-container p').eq(1).invoke('text');
  }


  getCurrentDateRangeText() {
    return cy.get('.company_insight_filter_header').find('button p').eq(1).invoke('text');
  }

  clickPreviousWeekArrow() {
    cy.get('.company_insight_filter_header').within(() => {
      cy.get('svg').eq(4).click();
    });
  }

  clickNextWeekArrow() {
    cy.get('.company_insight_filter_header').within(() => {
      cy.get('svg').eq(6).click();
    });
  }

  parseDateRange(rangeText) {
    return rangeText.split(' - ').map(d => {
      const parts = d.split('/');
      return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    });
  }


  clickZoneTimeButton() {
    cy.get('button p').contains('Zone Time').click();
  }

  getDropdownOptions() {
    return cy.get('.dropdown-option');
  }


  switchToListLayout() {
    cy.get('.selector-item.first').click();
    cy.wait(1000);
  }

  switchToCardLayout() {
    cy.get('.selector-item.last').click();
    cy.wait(1000);
  }


  assertTableRowsVisible() {
    cy.get(workforceSelector.tableRow).should('be.visible');
  }

  assertLoaderGone() {
    cy.get('.loader-image').should('not.exist');
  }


  assertEmptyStateNotVisible() {
    cy.get('.empty-state').should('not.exist');
  }

  assertTableEmptyOrVisible() {
    cy.get('body').then($body => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.log('Table has data — asserting rows visible');
        this.assertTableRowsVisible();
        this.assertEmptyStateNotVisible();
      } else {
        cy.log('Table is empty — asserting empty state visible');
		cy.validateEmptyTable(); // Custom command to check for empty state
      }
    });
  }

  // ─── Stat Cards ───────────────────────────────────────────────

  assertStatCardsVisible() {
    cy.get('.worker_insight_section').should('be.visible');
  }

  assertStatCardsHidden() {
    cy.get('.worker_insight_section').should('not.exist');
  }
}

export default new InsightsWorkerPage();