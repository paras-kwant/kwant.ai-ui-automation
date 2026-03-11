/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../../support/workforceSelector';
import companiesHelper from '../../../support/helper/companiesHelper';

describe("Insights Companies Module - Selection Functionality", { tags: ["Epic:Insights", "Feature:Selection", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));
<<<<<<< HEAD
  });




=======
	cy.wait(2000);
	cy.get('.selector-item.first').click()
	cy.get('.selector-item.first')
  .should('have.class', 'active');
	
  });

>>>>>>> ec817ac8 (insight companies added)
  it('clicking on the Last Update: button should refresh the table and latest data', { 
	tags: ["Story:Unselect Worker Removes Count", "Severity:critical", "UI", "Module:Insights-Company"] 
  }, () => {
  
	cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
  

	cy.contains('.insights-header-right-container p', 'Last Update:').click();
  

	cy.wait('@getCompanyTableData')
	  .its('response.statusCode')
	  .should('eq', 200);
  
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('.loader-image').should('not.exist');
  
	cy.get('.insights-header-right-container').within(() => {
  
	  cy.get('p').eq(0).should('contain.text', 'Last Update:');
  
	  cy.get('p')
  .eq(1)
  .invoke('text')
  .then((timeText) => {

    const uiTime = timeText.trim();
    cy.log(`UI Time: ${uiTime}`);

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    cy.log(`Current System Time: ${currentTime}`);

    // Validate format H:MM or HH:MM
    expect(uiTime).to.match(/\d{1,2}:\d{2}/);
  });
})
  
  });

<<<<<<< HEAD

  it('clicking previous week SVG updates date range correctly by 7 days', { 
	tags: ["Story:Company Insight Date Filter", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
  
	cy.get('.company_insight_filter_header').within(() => {
	  cy.get('button p').eq(1).invoke('text').then(initialRange => {
		cy.log('Initial date range:', initialRange);
  
		const [start, end] = initialRange.split(' - ').map(d => {
		  const parts = d.split('/'); // assuming format MM/DD/YYYY
		  return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
		});
  
		cy.get('svg').eq(3).click();
		cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);
  

		cy.get('button p').eq(1).invoke('text').then(newRange => {
		  cy.log('Updated date range:', newRange);
  
		  const [newStart, newEnd] = newRange.split(' - ').map(d => {
			const parts = d.split('/');
			return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
		  });
  
		  const diffStart = (start - newStart) / (1000 * 60 * 60 * 24);
		  const diffEnd = (end - newEnd) / (1000 * 60 * 60 * 24);
  
		  expect(diffStart, 'Start date shifted by 7 days').to.eq(7);
		  expect(diffEnd, 'End date shifted by 7 days').to.eq(7);
		});
	  });
	});
  
  });
=======
  it('clicking on the onsite-today icon should open the on-site hours drawer with todays date range and correct data', {
	tags: ["Story:On-site Hours Drawer For Today", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.wait(2000)
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('.site-left').eq(0).find('.site-label').click();
	cy.go('back');
	cy.wait(1000);
  
	cy.intercept('POST', '**/api/insight/company/table**').as('companyTable');
	cy.intercept('POST', '**/api/insight/company/summary**').as('companySummary');
  
	cy.get(workforceSelector.tableRow).should('be.visible');

	cy.wait(1000);
  
	cy.get('.site-left').eq(0).find('.site-label')
	  .invoke('text')
	  .then(labelText => {
		const label = parseInt(labelText.trim(), 10);
		cy.log('Label value is:', label);
        cy.get('.site-left').eq(0).find('.site-label').click();

		cy.url().should('include', '/insights/workers');
  
		cy.get('.label.default__label', { timeout: 10000 })
		  .contains('Company Name: 1')
		  .should('be.visible');
  
		cy.get('.label.default__label')
		  .contains('Site Status: 1')
		  .should('be.visible');
  
		if (label === 0) {
		  cy.get('.empty-body__title', { timeout: 7000 })
			.should('be.visible')
			.and('contain.text', 'No Results Found');
		} else {
		  cy.get(workforceSelector.tableRow, { timeout: 7000 })
			.should('have.length', label);
		}
	  });
  });
  it('clicking on the onsite-today icon should open the on-site hours drawer with data when label > 0', {
	tags: ["Story:On-site Hours Drawer For Today", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('.site-left').eq(0).find('.site-label').click();
	cy.go('back');
	cy.wait(1000);

	cy.get(workforceSelector.tableRow).should('be.visible');
  
	cy.intercept('POST', '**/api/insight/company/table**').as('companyTable');
	cy.intercept('POST', '**/api/insight/company/summary**').as('companySummary');
  
	cy.wait(1000);
  
	// Find first row where label > 0
	cy.get('.site-left').filter((i, el) => {
	  const text = Cypress.$(el).find('.site-label').text().trim();
	  return parseInt(text, 10) > 0;
	}).first().as('nonZeroRow');
  
	cy.get('@nonZeroRow').find('.site-label')
	  .invoke('text')
	  .then(labelText => {
  
		const label = parseInt(labelText.trim(), 10);
		cy.log('Label value is:', label);
  
		cy.get('@nonZeroRow').find('.site-label').click();
  
		cy.url().should('include', '/insights/workers');
  
		cy.get('.label.default__label', { timeout: 10000 })
		  .contains('Company Name: 1')
		  .should('be.visible');
  
		cy.get('.label.default__label')
		  .contains('Site Status: 1')
		  .should('be.visible');
  
		cy.get(workforceSelector.tableRow, { timeout: 7000 })
		  .should('have.length', label);
  
	  });
  
  });
 
>>>>>>> ec817ac8 (insight companies added)
  it('clicking next week SVG updates date range correctly by 7 days', { 
	tags: ["Story:Company Insight Date Filter", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
  
	cy.get('.company_insight_filter_header').within(() => {
<<<<<<< HEAD
	  cy.get('button p').eq(1).invoke('text').then(initialRange => {
		cy.log('Initial date range:', initialRange);
  
		const [start, end] = initialRange.split(' - ').map(d => {
		  const parts = d.split('/'); 
		  return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
		});
  
		cy.get('svg').eq(5).click(); 
		cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);
  
		cy.get('button p').eq(1).invoke('text').then(newRange => {
		  cy.log('Updated date range:', newRange);
  
		  const [newStart, newEnd] = newRange.split(' - ').map(d => {
			const parts = d.split('/');
			return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
		  });

		  const diffStart = (newStart - start) / (1000 * 60 * 60 * 24);
		  const diffEnd = (newEnd - end) / (1000 * 60 * 60 * 24);
  
		  expect(diffStart, 'Start date shifted by 7 days forward').to.eq(7);
		  expect(diffEnd, 'End date shifted by 7 days forward').to.eq(7);
		});
	  });
	});
  
  });
  it.only('clicking on label="On-site Hours" should open the on-site hours drawer with correct title and content', {
=======

		cy.get('button p').eq(1).invoke('text').then(initialRange => {
		  cy.log('Initial date range:', initialRange);
	  
		  const [start, end] = initialRange.split(' - ').map(d => {
			const parts = d.split('/');
			return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
		  });
	  
		  cy.get('svg').eq(4).click();
	  
		  cy.wait('@getCompanyTableData')
			.its('response.statusCode')
			.should('eq', 200);
	  
		  // Wait until date text changes
		  cy.get('button p').eq(1)
			.should('not.have.text', initialRange)
			.invoke('text')
			.then(newRange => {
	  
			  cy.log('Updated date range:', newRange);
	  
			  const [newStart, newEnd] = newRange.split(' - ').map(d => {
				const parts = d.split('/');
				return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
			  });
	  
			  const diffStart = (start - newStart) / (1000 * 60 * 60 * 24);
			  const diffEnd = (end - newEnd) / (1000 * 60 * 60 * 24);
	  
			  expect(diffStart).to.eq(7);
			  expect(diffEnd).to.eq(7);
			});
	  
		});
	  
	  });
  });
  it('clicking on label="On-site Hours" should open the on-site hours drawer with correct title and content', {
>>>>>>> ec817ac8 (insight companies added)
	tags: ["Story:On-site Hours Drawer", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('button p').contains('On-site Hours').click();
	cy.get('.dropdown-option')
  .should('have.length.greaterThan', 1);

  })

<<<<<<< HEAD
=======
  it('switching layout of the table should update the table layout and persist the selected layout', {
	tags: ["Story:Table Layout Switch", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('.selector-item.first').click()
	cy.wait(1000)
	cy.get('.company-insights-top-stats__item').should('not.exist')
	cy.get('.selector-item.last').click()
	cy.wait(1000)
	cy.get('.company-insights-top-stats__item').should('be.visible')
  })

>>>>>>> ec817ac8 (insight companies added)
});