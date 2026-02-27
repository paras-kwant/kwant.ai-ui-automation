/// <reference types="cypress" />
import { searchPage } from "../../../pages/insights/companies/search";

describe("Insight Company - Search ", () => {
  let companyNames = [];

  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });

    cy.visit("https://uat.kwant.ai/projects/500526306/insights/companies");

    cy.intercept("POST", "/api/insight/company/table*").as("companiesApiInit");
    cy.wait("@companiesApiInit").then((interception) => {
      companyNames = searchPage.getCompanyNamesFromApi(interception);
      expect(companyNames.length).to.be.greaterThan(0);
    });
  });

  beforeEach(() => {
    // Re-establish intercept alias before every test
    searchPage.interceptCompaniesApi();

    // Only clear if the input exists and is visible
    cy.get("body").then(($body) => {
      if ($body.find(searchPage.searchInputSelector).length > 0) {
        searchPage.searchInput.clear({ force: true });
      }
    });
  });

  afterEach(() => {
    cy.get("body").then(($body) => {
      if ($body.find(searchPage.searchInputSelector).length > 0) {
        searchPage.searchInput.clear({ force: true });
      }
    });
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
    // Guard: ensure companyNames was populated
    cy.wrap(null).then(() => {
      expect(companyNames.length, "companyNames should not be empty").to.be.greaterThan(0);
    });

    const randomNames = Cypress._.sampleSize(companyNames, 2);

    randomNames.forEach((name) => {
      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch(name, { delay: 50 });
      cy.wait("@companiesApi");
      searchPage.assertCompanyVisible(name);
      searchPage.searchInput.clear({ force: true });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Search triggers API only when at least 3 letters are entered", () => {
    // Type 1 character — API should NOT be called
    searchPage.typeInSearch("a");
    cy.wait(500); // give time in case API fires incorrectly

    cy.get("@companiesApi.all").then((calls) => {
      const countAfterOne = calls.length;

      // Type 2 characters — API should still NOT be called
      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch("aa");
      cy.wait(500);

      cy.get("@companiesApi.all").then((calls2) => {
        expect(calls2.length, "API should not fire for 2 chars").to.equal(countAfterOne);

        // Type 3 characters — API SHOULD be called
        searchPage.searchInput.clear({ force: true });
        searchPage.typeInSearch("aha");
        cy.wait("@companiesApi");

        cy.get("@companiesApi.all").then((calls3) => {
          expect(calls3.length, "API should fire for 3+ chars").to.be.greaterThan(countAfterOne);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Validating the search functionality for the search with no results", () => {
    searchPage.typeInSearch("NonExistentName12345");
    cy.wait("@companiesApi");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Validating search functionality with empty input keeps rows unchanged", () => {
    // Wait for initial table to load
    searchPage.companyTitles.first().should("be.visible");

    searchPage.companyTitles.first().invoke("text").then((beforeValue) => {
      // Spaces-only input should not trigger search
      searchPage.typeInSearch("   ");
      cy.wait(1000);

      searchPage.companyTitles.first().invoke("text").then((afterValue) => {
        expect(afterValue.trim()).to.eq(beforeValue.trim());
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify search Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", () => {
    cy.wrap(null).then(() => {
      expect(companyNames.length, "companyNames should not be empty").to.be.greaterThan(0);
    });

    const name = Cypress._.sample(companyNames);

    const testValues = [
      name.toUpperCase(),
      name.toLowerCase(),
      name
        .split("")
        .map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
        .join(""),
    ];

    testValues.forEach((value) => {
      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch(value);
      cy.wait("@companiesApi");
      searchPage.assertAllRowsContain(name);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify the search is cleared once the whole text from the search bar is cleared", () => {
    cy.wrap(null).then(() => {
      expect(companyNames.length, "companyNames should not be empty").to.be.greaterThan(0);
    });

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

  // ─────────────────────────────────────────────────────────────────────────────

  it("Verify clicking on 'x' available on the search bar to clear off the text and search applied", () => {
    cy.wrap(null).then(() => {
      expect(companyNames.length, "companyNames should not be empty").to.be.greaterThan(0);
    });

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