/// <reference types="cypress" />
import { downloadPage } from "../../../pages/insights/companies/download";

describe("Insights Company Module - Download", () => {

  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });
    downloadPage.visitCompaniesPage();
  });

  beforeEach(() => {
    cy.cleanUI();
  });


  it('Verify by default the start date and end date displayed on the download page is same as the one displayed on insight company page.', () => { // Add a wait to ensure the page has loaded before interacting with it
	cy.wait(2000)

    downloadPage.getDateRangeFromFilter().then(({ startDate, endDate }) => {
      downloadPage.openDownloadModal();
      downloadPage.assertDatesMatch(startDate, endDate);
    });
  });


  it('Verify the downloaded quick report is in CSV format', () => {
    downloadPage.visitCompaniesPage();

    downloadPage.getDateRangeFromFilter().then(({ startDate, endDate }) => {
      downloadPage.openDownloadModal();
      downloadPage.assertDatesMatch(startDate, endDate);
      downloadPage.clickDownloadButton();
      cy.wait(4000)

      downloadPage.getLatestDownloadedFile().then(({ fileName }) => {
        downloadPage.assertFileIsCsv(fileName);
      });
    });
  });


  it('Verify the fields on the report - Company Name, Date, Number of Workers, On-site Hours', () => {
    downloadPage.visitCompaniesPage();
    downloadPage.openDownloadModal();
    downloadPage.clickDownloadButton();
    cy.wait(4000)

    downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
      downloadPage.assertFileIsCsv(fileName);
      downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
        downloadPage.assertCsvHeaders(rows);
      });
    });
  });


  it('Verify the data on the downloaded CSV report matches with the application data', () => {
    downloadPage.interceptCompaniesApi();
    downloadPage.visitCompaniesPage();

    downloadPage.waitForCompaniesApi().then((interception) => {
      const uiData = downloadPage.getCompanyNamesFromApi(interception);
      cy.log('UI Data: ' + JSON.stringify(uiData));

      downloadPage.openDownloadModal();
      downloadPage.clickDownloadButton();
      cy.wait(4000)

      downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
        downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
          downloadPage.assertCsvDataMatchesUi(rows, uiData);
        });
      });
    });
  });


  it('Verify selecting a company checkbox only downloads that company data in the report', () => {
    downloadPage.visitCompaniesPage();

    downloadPage.getRandomCompanyFromUI().then((selectedCompany) => {
      cy.log('Selected Company: ' + selectedCompany);

      downloadPage.checkCompanyCheckbox(selectedCompany);

      cy.get('button').contains('Download Report').click();
      cy.get('.footer button').contains('Download').click();

      cy.wait(5000);

      downloadPage.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
        downloadPage.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
          downloadPage.assertOnlySelectedCompanyInCsv(rows, selectedCompany);
        });
      });
    });
  });


  it('download for Today',            () => { downloadPage.runDownloadTestForFilter('Today'); });
  it('download for Current Week',     () => { downloadPage.runDownloadTestForFilter('Current Week'); });
  it('download for Last 7 Days',      () => { downloadPage.runDownloadTestForFilter('Last 7 Days'); });
  it('download for Last 30 days',     () => { downloadPage.runDownloadTestForFilter('Last 30 days'); });
  it('download for This Month',       () => { downloadPage.runDownloadTestForFilter('This Month'); });
  it('download for Project Duration', () => { downloadPage.runDownloadTestForFilter('Project Duration'); });

});