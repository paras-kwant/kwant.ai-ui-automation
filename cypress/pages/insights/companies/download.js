import { workforceSelector } from "../../../support/workforceSelector";

class DownloadPage {

  // ─── Actions ─────────────────────────────────────────────────────────────────

  visitCompaniesPage() {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/insights/companies`);
  }

  interceptSummaryApi() {
    cy.intercept('POST', '/api/insight/company/summary').as('summaryApi');
  }

  interceptCompaniesApi() {
    cy.intercept('POST', '/api/insight/company/table*').as('companiesApi');
  }

  interceptDownloadApi() {
    cy.intercept('POST', 'https://uat.kwant.ai/api/insight/company/download/quick').as('downloadApi');
  }

  waitForSummaryApi() {
    return cy.wait('@summaryApi');
  }

  waitForCompaniesApi() {
    return cy.wait('@companiesApi');
  }

  waitForDownloadApi() {
    return cy.wait('@downloadApi');
  }

  getDateRangeFromFilter() {
    return cy.get('.filters_header_right_section button').contains('/')
      .invoke('text')
      .then((dateText) => {
        const [startDate, endDate] = dateText.split(' - ').map((d) => d.trim());
        return { startDate, endDate };
      });
  }

  openDownloadModal() {
    cy.get('.filters_header_right_section button').last().click();
    cy.get('.dropdown-option').contains('Download').click();
  }

  clickDownloadButton() {
    cy.get('button').contains('Download').click();
  }

  selectFilterOption(filterLabel) {
    cy.get('.filters_header_right_section button').first().click();
    cy.get('button').contains(filterLabel).click();
  }

  checkCompanyCheckbox(companyName) {
    cy.get(`${workforceSelector.tableRow} .personal-info-content__title`)
      .contains(companyName)
      .closest('[data-testid="table_tr"]')
      .find('[type="checkbox"]')
      .check({ force: true });
  }

  getRandomCompanyFromUI() {
    return cy.get(`${workforceSelector.tableRow} .personal-info-content__title`)
      .then(($els) => {
        const names = $els.toArray().map((el) => el.innerText.trim());
        return Cypress._.sample(names);
      });
  }

  getLatestDownloadedFile() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    return cy.task('getLatestDownloadedFile', { downloadsFolder }).then((fileName) => {
      return { fileName, downloadsFolder };
    });
  }

  parseDownloadedFile(downloadsFolder, fileName) {
    return cy.task('parseExcel', { filePath: `${downloadsFolder}/${fileName}` });
  }

  getCompanyNamesFromApi(interception) {
    const companies = interception?.response?.body?.data || [];
    const uiData = {};
    companies.forEach((c) => {
      uiData[c.companyName] = c.actualDays;
    });
    return uiData;
  }

  // ─── Assertions ──────────────────────────────────────────────────────────────

  assertDatesMatch(startDate, endDate) {
    cy.get('input[placeholder="MM/DD/YYYY"]').eq(0).should('have.value', startDate);
    cy.get('input[placeholder="MM/DD/YYYY"]').eq(1).should('have.value', endDate);
  }

  assertFileIsCsv(fileName) {
    expect(fileName).to.not.be.null;
    expect(fileName).to.match(/\.csv$/i);
  }

  assertCsvHeaders(rows) {
    const headers = rows[1].map((h) => h?.toString().trim());
    cy.log('CSV Headers: ' + headers.join(', '));
    expect(headers).to.include('Company Name');
    expect(headers).to.include('Date');
    expect(headers).to.include('Number of Workers');
    expect(headers).to.include('On-site Hours');
  }

  assertEmptyState() {
    cy.get('.empty-body__title').should('contain.text', 'No Results Found');
  }

  assertCsvDataMatchesUi(rows, uiData) {
    const headers = rows[1].map((h) => h?.toString().trim());
    const companyNameIdx = headers.indexOf('Company Name');
    const dataRows = rows.slice(2).filter((r) => r.length > 0);

    const csvData = {};
    dataRows.forEach((row) => {
      const name = row[companyNameIdx]?.toString().trim();
      if (name) csvData[name] = (csvData[name] || 0) + 1;
    });

    cy.log('CSV Data: ' + JSON.stringify(csvData));

    Object.entries(uiData).forEach(([companyName, actualDays]) => {
      expect(csvData[companyName]).to.equal(actualDays,
        `${companyName}: CSV rows (${csvData[companyName]}) should match Actual Worker-Days (${actualDays})`
      );
    });
  }

  assertOnlySelectedCompanyInCsv(rows, selectedCompany) {
    const headers = rows[1].map((h) => h?.toString().trim());
    const companyNameIdx = headers.indexOf('Company Name');
    const dataRows = rows.slice(2).filter((r) => r.length > 0);

    const csvCompanies = [...new Set(
      dataRows.map((r) => r[companyNameIdx]?.toString().trim()).filter(Boolean)
    )];

    cy.log('CSV Companies: ' + JSON.stringify(csvCompanies));
    expect(csvCompanies).to.have.length(1);
    expect(csvCompanies[0]).to.equal(selectedCompany);
  }

  // ─── Reusable Flow ───────────────────────────────────────────────────────────

  runDownloadTestForFilter(filterLabel) {
    this.visitCompaniesPage();
    this.interceptSummaryApi();
    this.interceptDownloadApi();
    this.interceptCompaniesApi();

    this.selectFilterOption(filterLabel);
    this.waitForSummaryApi();

    cy.get('body').then(($body) => {
      if ($body.find('.empty-body__title').length > 0) {
        this.assertEmptyState();
      } else {
        this.waitForCompaniesApi().then((interception) => {
          const uiData = this.getCompanyNamesFromApi(interception);
          cy.log('UI Data: ' + JSON.stringify(uiData));

          this.getDateRangeFromFilter().then(({ startDate, endDate }) => {
            this.openDownloadModal();
            this.assertDatesMatch(startDate, endDate);
            this.clickDownloadButton();
            this.waitForDownloadApi();
            cy.wait(1000);

            this.getLatestDownloadedFile().then(({ fileName, downloadsFolder }) => {
              this.assertFileIsCsv(fileName);
              this.parseDownloadedFile(downloadsFolder, fileName).then((rows) => {
                this.assertCsvDataMatchesUi(rows, uiData);
              });
            });
          });
        });
      }
    });
  }
}

export const downloadPage = new DownloadPage();