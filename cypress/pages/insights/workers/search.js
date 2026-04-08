import { workforceSelector } from "../../../support/workforceSelector";

class SearchPage {
  // ─── Selectors ───────────────────────────────────────────────────────────────

  get searchInput() {
    return cy.get(workforceSelector.searchInput);
  }

  get tableRows() {
    return cy.get(workforceSelector.tableRow);
  }

  get companyTitles() {
    return cy.get(`${workforceSelector.tableRow} .personal-info-content__title`);
  }

  get searchClearButton() {
    return cy.get("#search-input").siblings("div").find("svg").eq(1);
  }

  get emptyBody() {
    return cy.get(".empty-body");
  }

  // ─── API Intercepts ───────────────────────────────────────────────────────────

  // Call ONCE in beforeEach — not per test
  interceptCompaniesApi() {
    cy.intercept("POST", "/api/insight/company/table*").as("companiesApi");
  }

  waitForCompaniesApi() {
    return cy.wait("@companiesApi");
  }

  // Use this only when you genuinely need fresh API data
  // Avoids reload where possible by just waiting for existing intercept
  waitForInitialLoad() {
    return this.waitForCompaniesApi();
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  typeInSearch(value, options = {}) {
    this.searchInput.clear().type(value, options);
  }

  clearSearch() {
    this.searchInput.clear();
  }

  clickClearButton() {
    this.searchClearButton.click();
  }

  clickFavoriteForCompany(companyName) {
    this.companyTitles
      .contains(companyName)
      .closest('[data-testid="table_tr"]')
      .find(".table-row-favorite svg")
      .click({ force: true });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  getCompanyNamesFromApi(interception) {
    const companies = interception?.response?.body?.data || [];
    return companies.map((c) => c.companyName).filter(Boolean);
  }

  captureTableState() {
	return cy.get(`${workforceSelector.tableRow} .personal-info-content__title`)
	  .should('have.length.greaterThan', 1) // 
	  .then(($els) => $els.toArray().map((el) => el.innerText.trim()));
  }

  // ─── Assertions ──────────────────────────────────────────────────────────────

  assertCompanyVisible(name) {
    cy.get(workforceSelector.tableRow).contains(name).should("be.visible");
  }

  assertFirstRowContains(name) {
    this.companyTitles.eq(0).should("contain.text", name);
  }

  assertSearchInputEmpty() {
    this.searchInput.should("have.value", "");
  }

  assertEmptyState() {
    this.emptyBody.should("contain.text", "No Results Found");
  }

  assertTableMatchesState(expectedList) {
	cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).should(($els) => {
	  const currentList = $els.toArray().map((el) => el.innerText.trim());
	  expect(currentList).to.deep.equal(expectedList);
	});
  }

  assertTableNotMatchesState(expectedList) {
	cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).should(($els) => {
	  const currentList = $els.toArray().map((el) => el.innerText.trim());
	  expect(currentList).not.to.deep.equal(expectedList);
	});
  }

  assertAllRowsContain(name) {
    this.companyTitles.each(($el) => {
      expect($el.text().toLowerCase()).to.contains(name.toLowerCase());
    });
  }
}

export const searchPage = new SearchPage();