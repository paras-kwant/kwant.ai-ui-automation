/// <reference types="cypress" />
import { searchPage } from "../../../pages/insights/companies/search";

describe("Insight Company - Search ", () => {
  let companyNames = [];

  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });

    // intercept + visit ONCE, cache company names for all tests
    cy.intercept("POST", "/api/insight/company/table*").as("companiesApi");
    cy.visit("https://uat.kwant.ai/projects/500526306/insights/companies");
    cy.wait("@companiesApi").then((interception) => {
      companyNames = searchPage.getCompanyNamesFromApi(interception);
    });
  });

  beforeEach(() => {
    cy.cleanUI();
    searchPage.interceptCompaniesApi();
    // Clear search between tests so state is clean without reload
    searchPage.searchInput.clear();
  });

  afterEach(() => {
    searchPage.searchInput.clear();
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it.skip("Verify if the bookmarked company falls on the list of searches performed then the bookmarked company should always appear on the top.", () => {
    searchPage.companyTitles.eq(0).should("be.visible");

    searchPage.companyTitles.eq(2).invoke("text").then((companyName) => {
      searchPage.clickFavoriteForCompany(companyName);
      cy.wait(1000);
      searchPage.assertFirstRowContains(companyName);
      searchPage.clickFavoriteForCompany(companyName); // undo
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Validating the search functionality - run twice", () => {
    const randomNames = Cypress._.sampleSize(companyNames, 2); // use cached names, no reload

    randomNames.forEach((name) => {
      searchPage.typeInSearch(name, { delay: 50 });
      cy.wait("@companiesApi");
      searchPage.assertCompanyVisible(name);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Search triggers API only when at least 3 letters are entered", () => {
    searchPage.typeInSearch("a");
    cy.get("@companiesApi.all").then((calls) => {
      const countAfterOne = calls.length;

      searchPage.typeInSearch("aa");
      cy.get("@companiesApi.all").then((calls2) => {
        expect(calls2.length).to.equal(countAfterOne);

        searchPage.typeInSearch("aha");
        cy.wait("@companiesApi");
        cy.get("@companiesApi.all").then((calls3) => {
          expect(calls3.length).to.be.greaterThan(countAfterOne);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Validating the search functionality for the search with no results", () => {
    searchPage.typeInSearch("NonExistentName12345");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Validating search functionality with empty input keeps rows unchanged", () => {
    cy.wait(3000);

    searchPage.companyTitles.first().invoke("text").then((beforeValue) => {
      searchPage.typeInSearch("   ");
      cy.wait(1000);

      searchPage.companyTitles.first().invoke("text").then((afterValue) => {
        expect(afterValue.trim()).to.eq(beforeValue.trim());
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify search Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", () => {
    const name = Cypress._.sample(companyNames); // use cached names, no reload

    const testValues = [
      name.toUpperCase(),
      name.toLowerCase(),
      name.split("").map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase())).join(""),
    ];

    testValues.forEach((value) => {
      searchPage.typeInSearch(value);
      cy.wait("@companiesApi");
      searchPage.assertAllRowsContain(name);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify the search is cleared once the whole text from the search bar is cleared", () => {
    const name = Cypress._.sample(companyNames);

    searchPage.captureTableState().then((initialList) => {
      searchPage.typeInSearch(name);
      cy.wait("@companiesApi");
      searchPage.assertTableNotMatchesState(initialList);

      searchPage.clearSearch();
      cy.wait("@companiesApi");
      cy.wait(2000);
      searchPage.assertTableMatchesState(initialList);
    });
  });


  it("Verify clicking on 'x' available on the search bar to clear off the text and search applied", () => {
    const name = Cypress._.sample(companyNames);

    searchPage.captureTableState().then((initialList) => {
      searchPage.typeInSearch(name);
      cy.wait("@companiesApi");
      cy.wait(1000);
      searchPage.assertTableNotMatchesState(initialList);

      searchPage.clickClearButton();
      cy.wait("@companiesApi");

      searchPage.assertSearchInputEmpty();
      cy.wait(2000);
      searchPage.assertTableMatchesState(initialList);
    });
  });
});