/// <reference types="cypress" />
import { searchPage } from "../../../pages/insights/workers/search";
import WorkerHelper from "../../../support/helper/workerHelper";
import { workforceSelector } from "../../../support/workforceSelector";

describe("Insight Worker - Search ", { tags: ["Epic:WorkForce", "Feature:Search", "Module:Insights-Worker"] }, () => {
  let workerNames = [];
  let companyNames = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/empinsight/work_table*").as("workersApi");
    cy.loginAndVisit(() => WorkerHelper.visitWorkersInsightPage('500526306'));

    cy.wait("@workersApi").then((interception) => {
      const body = interception.response.body;

      workerNames = body.employeeTrackingTableList
        .map((worker) => worker.fullName)
        .filter((name) => name && name !== "null null" && name.trim() !== "");

      companyNames = [
        ...new Set(
          body.employeeTrackingTableList
            .map((worker) => worker.companyName)
            .filter((name) => name && name.trim() !== "")
        ),
      ];

      expect(workerNames.length).to.be.greaterThan(0);
      expect(companyNames.length).to.be.greaterThan(0);
    });

    cy.get("body").then(($body) => {
      if ($body.find(searchPage.searchInputSelector).length > 0) {
        searchPage.searchInput.clear({ force: true });
      }
    });
  });

  it.skip("Insights-Worker - Verify if the bookmarked worker falls on the list of searches performed then the bookmarked worker should always appear on the top.", { tags: ["Story:Insights Search Bookmarked Worker Appears First", "Severity:normal", "UI", "Module:Insights-Worker"] }, () => {
    searchPage.companyTitles.eq(0).should("be.visible");

    searchPage.companyTitles.eq(2).invoke("text").then((workerName) => {
      searchPage.clickFavoriteForCompany(workerName);
      cy.wait(1000);
      searchPage.assertFirstRowContains(workerName);
      searchPage.clickFavoriteForCompany(workerName);
    });
  });

  it("Insights-Worker - Validating the search functionality by worker name - run twice", { tags: ["Story:Insights Search Worker Name Twice", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    cy.wrap(null).then(() => {
      expect(workerNames.length, "workerNames should not be empty").to.be.greaterThan(0);
    });

    const randomNames = Cypress._.sampleSize(workerNames, 2);

    randomNames.forEach((name) => {
      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch(name, { delay: 50 });
      cy.wait("@workersApi");
      searchPage.assertCompanyVisible(name);
      searchPage.searchInput.clear({ force: true });
    });
  });

  it("Insights-Worker - Validating the search functionality by company name - run twice", { tags: ["Story:Insights Search Company Name Twice", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    cy.wrap(null).then(() => {
      expect(companyNames.length, "companyNames should not be empty").to.be.greaterThan(0);
    });

    const randomCompanies = Cypress._.sampleSize(companyNames, 2);

    randomCompanies.forEach((name) => {
      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch(name, { delay: 50 });
	  cy.get(workforceSelector.tableRow).contains(name).should('be.visible')
      searchPage.searchInput.clear({ force: true });
    });
  });

  it("Insights-Worker - Search triggers API only when at least 3 letters are entered", { tags: ["Story:Insights Search API Triggers After 3 Characters", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    searchPage.typeInSearch("a");
    cy.wait(500);

    cy.get("@workersApi.all").then((calls) => {
      const countAfterOne = calls.length;

      searchPage.searchInput.clear({ force: true });
      searchPage.typeInSearch("aa");
      cy.wait(500);

      cy.get("@workersApi.all").then((calls2) => {
        expect(calls2.length, "API should not fire for 2 chars").to.equal(countAfterOne);

        searchPage.searchInput.clear({ force: true });
        searchPage.typeInSearch("aha");
        cy.wait("@workersApi");

        cy.get("@workersApi.all").then((calls3) => {
          expect(calls3.length, "API should fire for 3+ chars").to.be.greaterThan(countAfterOne);
        });
      });
    });
  });

  it("Insights-Worker - Validating the search functionality for the search with no results", { tags: ["Story:Insights Search No Results Found", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    searchPage.typeInSearch("NonExistentName12345");
    cy.wait("@workersApi");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

  it("Validating search functionality with empty input keeps rows unchanged", { tags: ["Story:Insights Search Empty Input Keeps Rows Unchanged", "Severity:normal", "UI", "Module:Insights-Worker"] }, () => {
    searchPage.companyTitles.first().should("be.visible");

    searchPage.companyTitles.first().invoke("text").then((beforeValue) => {
      searchPage.typeInSearch("   ");
      cy.wait(1000);

      searchPage.companyTitles.first().invoke("text").then((afterValue) => {
        expect(afterValue.trim()).to.eq(beforeValue.trim());
      });
    });
  });

  it("Insights-Worker - Verify search by worker name supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", { tags: ["Story:Insights Search Worker Name Case Insensitive", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    cy.wrap(null).then(() => {
      expect(workerNames.length, "workerNames should not be empty").to.be.greaterThan(0);
    });

    const name = Cypress._.sample(workerNames);

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
      cy.wait("@workersApi");
	  cy.wait(2000)
      searchPage.assertAllRowsContain(name);
    });
  });

  it("Insights-Worker - Verify search by company name supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", {
    tags: ["Story:Insights Search Company Name Case Insensitive", "Severity:critical", "UI", "Module:Insights-Worker"]
  }, () => {
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
      searchPage.typeInSearch(value);
      cy.wait("@workersApi");
      searchPage.assertCompanyVisible(name);
      searchPage.searchInput.clear({ force: true });
      searchPage.companyTitles.first().should("be.visible");
    });
  });


  it("Insights-Worker - Verify the search is cleared once the whole text from the search bar is cleared", { tags: ["Story:Insights Search Cleared On Text Removal", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    cy.wrap(null).then(() => {
      expect(workerNames.length, "workerNames should not be empty").to.be.greaterThan(0);
    });

    const name = Cypress._.sample(workerNames);

    searchPage.captureTableState().then((initialList) => {
      searchPage.typeInSearch(name);
      cy.wait("@workersApi");
      searchPage.assertTableNotMatchesState(initialList);

      searchPage.clearSearch();
      cy.wait("@workersApi");
      cy.wait(2000);
      searchPage.assertTableMatchesState(initialList);
    });
  });

  it("Insights-Worker - Verify clicking on 'x' available on the search bar to clear off the text and search applied", { tags: ["Story:Insights Search X Button Clears Search", "Severity:critical", "UI", "Module:Insights-Worker"] }, () => {
    cy.wrap(null).then(() => {
      expect(workerNames.length, "workerNames should not be empty").to.be.greaterThan(0);
    });

    const name = Cypress._.sample(workerNames);

    searchPage.captureTableState().then((initialList) => {
      searchPage.typeInSearch(name);
      cy.wait("@workersApi");
      cy.wait(1000);
      searchPage.assertTableNotMatchesState(initialList);

      searchPage.clickClearButton();
      cy.wait("@workersApi");

      searchPage.assertSearchInputEmpty();
      cy.wait(2000);
      searchPage.assertTableMatchesState(initialList);
    });
  });

});