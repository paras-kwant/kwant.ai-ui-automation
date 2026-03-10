/// <reference types="cypress" />

const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../../support/workforceSelector';
import companiesHelper from '../../../support/helper/companiesHelper';

describe("Insights Companies Module - Selection Functionality", { tags: ["Epic:Insights", "Feature:Selection", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));
  });




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
  it('clicking next week SVG updates date range correctly by 7 days', { 
	tags: ["Story:Company Insight Date Filter", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
  
	cy.get('.company_insight_filter_header').within(() => {
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
	tags: ["Story:On-site Hours Drawer", "Severity:normal", "UI", "Module:Insights-Company"] 
  }, () => {
	cy.get(workforceSelector.tableRow).should('be.visible');
	cy.get('button p').contains('On-site Hours').click();
	cy.get('.dropdown-option')
  .should('have.length.greaterThan', 1);

  })

});