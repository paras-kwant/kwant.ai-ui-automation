/// <reference types="cypress" />
import { downloadPage } from "../../../pages/insights/companies/download";
import companiesHelper from "../../../support/helper/companiesHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insights Company Module - Download", { tags: ["Epic:WorkForce", "Feature:Download", "Module:Insights-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('500526306'));
  });

  it('Insights-Company - Verify by default the start date and end date displayed on the download page is same as the one displayed on insight company page.', { tags: ["Story:Download Default Date Range Matches Insight Page", "Severity:critical", "UI", "@smoke"] }, () => {
    cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);

    downloadPage.getDateRangeFromFilter().then(({ startDate, endDate }) => {
      downloadPage.openDownloadModal();
      downloadPage.assertDatesMatch(startDate, endDate);
    });
  });

  it('Insights-Company - Verify the downloaded quick report is in CSV format', { tags: ["Story:Download Quick Report Is CSV Format", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);
    downloadPage.visitCompaniesPage();

    downloadPage.getDateRangeFromFilter().then(({ startDate, endDate }) => {
      downloadPage.openDownloadModal();
      downloadPage.assertDatesMatch(startDate, endDate);
      downloadPage.clickDownloadButton();
      cy.wait(7000);

      downloadPage.getLatestDownloadedFile().then(({ fileName }) => {
        downloadPage.assertFileIsCsv(fileName);
      });
    });
  });

  it('Insights-Company - Verify the fields on the report - Company Name, Date, Number of Workers, On-site Hours', { tags: ["Story:Download Report Has Required Fields", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);
    downloadPage.openDownloadModal();
    downloadPage.clickDownloadButton();
    cy.wait(7000);

    downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
      downloadPage.assertFileIsCsv(fileName);
      downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
        downloadPage.assertCsvHeaders(rows);
      });
    });
  });

  it('Insights-Company - Verify the data on the downloaded CSV report matches with the application data', { tags: ["Story:Download CSV Data Matches Application Data", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    downloadPage.interceptCompaniesApi();

    downloadPage.waitForCompaniesApi().then((interception) => {
      const uiData = downloadPage.getCompanyNamesFromApi(interception);
      cy.log('UI Data: ' + JSON.stringify(uiData));

      downloadPage.openDownloadModal();
      downloadPage.clickDownloadButton();
      cy.wait(7000);

      downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
        downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
          downloadPage.assertCsvDataMatchesUi(rows, uiData);
        });
      });
    });
  });

  it('Insights-Company - Verify selecting a company checkbox only downloads that company data in the report', { tags: ["Story:Download Selected Company Only", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    cy.intercept('POST', '**/api/insight/company/table?**').as('getCompanyTableData');
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.wait('@getCompanyTableData').its('response.statusCode').should('eq', 200);
    downloadPage.getRandomCompanyFromUI().then((selectedCompany) => {
      cy.log('Selected Company: ' + selectedCompany);

      downloadPage.checkCompanyCheckbox(selectedCompany);

      cy.get('button').contains('Download Report').click();
      cy.get('.footer button').contains('Download').click();

      cy.wait(7000);

      downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
        downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
          downloadPage.assertOnlySelectedCompanyInCsv(rows, selectedCompany);
        });
      });
    });
  });

  it('Insights-Company - download for Today',            { tags: ["Story:Download Report For Today", "Severity:normal", "UI", "@smoke"] }, () => { downloadPage.runDownloadTestForFilter('Today'); });
  it('Insights-Company - download for Current Week',     { tags: ["Story:Download Report For Current Week", "Severity:normal", "UI", "Module:Insights-Company"] }, () => { downloadPage.runDownloadTestForFilter('Current Week'); });
  it('Insights-Company - download for Last 7 Days',      { tags: ["Story:Download Report For Last 7 Days", "Severity:normal", "UI", "Module:Insights-Company"] }, () => { downloadPage.runDownloadTestForFilter('Last 7 Days'); });
  it('Insights-Company - download for Last 30 days',     { tags: ["Story:Download Report For Last 30 Days", "Severity:normal", "UI", "Module:Insights-Company"] }, () => { downloadPage.runDownloadTestForFilter('Last 30 days'); });
  it('Insights-Company - download for This Month',       { tags: ["Story:Download Report For This Month", "Severity:normal", "UI", "Module:Insights-Company"] }, () => { downloadPage.runDownloadTestForFilter('This Month'); });
  it('Insights-Company - download for Project Duration', { tags: ["Story:Download Report For Project Duration", "Severity:normal", "UI", "Module:Insights-Company"] }, () => { downloadPage.runDownloadTestForFilter('Project Duration'); });

});