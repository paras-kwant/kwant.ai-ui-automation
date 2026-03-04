/// <reference types="cypress" />
import { searchPage } from "../../../pages/insights/companies/search";
import companiesHelper from "../../../support/helper/companiesHelper";

describe("Insight Company - Search ", { tags: ["Epic:WorkForce", "Feature:Search", "Module:Insights-Company"] }, () => {
  let companyNames = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/insight/company/table*").as("companiesApi");
    cy.loginAndVisit(() => companiesHelper.visitCompaniesInsightPage('5007477836'));


    cy.wait("@companiesApi").then((interception) => {
      companyNames = searchPage.getCompanyNamesFromApi(interception);
      expect(companyNames.length).to.be.greaterThan(0);
    });

    cy.get("body").then(($body) => {
      if ($body.find(searchPage.searchInputSelector).length > 0) {
        searchPage.searchInput.clear({ force: true });
      }
    });
  });

  it.skip("Insights-Company - Verify if the bookmarked company falls on the list of searches performed then the bookmarked company should always appear on the top.", { tags: ["Story:Insights Search Bookmarked Company Appears First", "Severity:normal", "UI", "Module:Insights-Company"] }, () => {
    searchPage.companyTitles.eq(0).should("be.visible");

    searchPage.companyTitles.eq(2).invoke("text").then((companyName) => {
      searchPage.clickFavoriteForCompany(companyName);
      cy.wait(1000);
      searchPage.assertFirstRowContains(companyName);
      searchPage.clickFavoriteForCompany(companyName);
    });
  });

  it("Insights-Company - Validating the search functionality - run twice", { tags: ["Story:Insights Search Company Name Twice", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
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

  it("Insights-Company - Search triggers API only when at least 3 letters are entered", { tags: ["Story:Insights Search API Triggers After 3 Characters", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    searchPage.typeInSearch("a");
    cy.wait(500);

    cy.get("@companiesApi.all").then((calls) => {
      const countAfterOne = calls.length;

      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch("aa");
      cy.wait(500);

      cy.get("@companiesApi.all").then((calls2) => {
        expect(calls2.length, "API should not fire for 2 chars").to.equal(countAfterOne);

        searchPage.searchInput.clear({ force: true });
        searchPage.typeInSearch("aha");
        cy.wait("@companiesApi");

        cy.get("@companiesApi.all").then((calls3) => {
          expect(calls3.length, "API should fire for 3+ chars").to.be.greaterThan(countAfterOne);
        });
      });
    });
  });

  it("Insights-Company - Validating the search functionality for the search with no results", { tags: ["Story:Insights Search No Results Found", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
    searchPage.typeInSearch("NonExistentName12345");
    cy.wait("@companiesApi");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

  it("Validating search functionality with empty input keeps rows unchanged", { tags: ["Story:Insights Search Empty Input Keeps Rows Unchanged", "Severity:normal", "UI", "Module:Insights-Company"] }, () => {
    searchPage.companyTitles.first().should("be.visible");

    searchPage.companyTitles.first().invoke("text").then((beforeValue) => {
      searchPage.typeInSearch("   ");
      cy.wait(1000);

      searchPage.companyTitles.first().invoke("text").then((afterValue) => {
        expect(afterValue.trim()).to.eq(beforeValue.trim());
      });
    });
  });

  it("Insights-Company - Verify search Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", { tags: ["Story:Insights Search Case Insensitive", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
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

  it("Insights-Company - Verify the search is cleared once the whole text from the search bar is cleared", { tags: ["Story:Insights Search Cleared On Text Removal", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
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

  it("Insights-Company - Verify clicking on 'x' available on the search bar to clear off the text and search applied", { tags: ["Story:Insights Search X Button Clears Search", "Severity:critical", "UI", "Module:Insights-Company"] }, () => {
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