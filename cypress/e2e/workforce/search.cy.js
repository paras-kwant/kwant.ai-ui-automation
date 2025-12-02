/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import WorkerHelper from '../../support/helper/workerHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Module - Search", () => {

  // Safe login + project opening
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    WorkerHelper.visitWorkersPage();
  });

  beforeEach(() => {
    cy.cleanUI();
  })



  it("Validating the search functionality - run twice", () => {
    cy.wait(1500);
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception?.response?.body?.projectWorkerDTOS || [];
      const firstNames = workers.map((w) => w.firstName).filter(Boolean);
      const randomNames = Cypress._.sampleSize(firstNames, 2);

      randomNames.forEach((name) => {
        cy.get(workforceSelector.searchInput).clear().type(name, { delay: 50 });
        cy.wait(2000);

        cy.get("body").then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            cy.get(workforceSelector.tableRow).contains(name).should("be.visible");
          } else {
            cy.log(`Worker not found for: ${name}`);
          }
        });
      });
    });
  });

  // 2. Search triggers API only when >= 3 letters
  it("Search triggers API only when at least 3 letters are entered", () => {
    cy.wait(2000);

    cy.get(workforceSelector.tableRow).then(($els) => {
      const initialList = [...$els].map((el) => el.innerText.trim());

      cy.get(workforceSelector.searchInput).clear().type("a");
      cy.get(workforceSelector.tableRow).then(($new) => {
        expect([...$new].map((x) => x.innerText.trim())).to.deep.equal(initialList);
      });

      cy.get(workforceSelector.searchInput).clear().type("aa");
      cy.get(workforceSelector.tableRow).then(($new) => {
        expect([...$new].map((x) => x.innerText.trim())).to.deep.equal(initialList);
      });

      cy.get(workforceSelector.searchInput).clear().type("aha");
      cy.wait(2000);

      cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).then(($new) => {
            expect([...$new].map((x) => x.innerText.trim())).not.to.deep.equal(initialList);
          });
        } else {
          cy.get(".empty-body").should(
            "contain.text",
            "No Results Found"
          );
        }
      });
    });
  });

  // 3. Search no results
  it("Validating the search functionality for the search with no results", () => {
    cy.get(workforceSelector.searchInput).clear().type("NonExistentName12345");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

  // 4. Empty input keeps rows unchanged
  it("Validating search functionality with empty input keeps rows unchanged", () => {
    cy.wait(3000);

    cy.get(".personal-info-content__title")
      .first()
      .invoke("text")
      .then((beforeValue) => {
        cy.get(workforceSelector.searchInput).clear().type(" ");
        cy.wait(1000);

        cy.get(".personal-info-content__title")
          .first()
          .invoke("text")
          .then((afterValue) => {
            expect(afterValue.trim()).to.eq(beforeValue.trim());
          });
      });
  });

  // 5. Search by Job Title
  it("Validating search functionality with job title in use", () => {
    cy.get(workforceSelector.tableRow)
      .eq(1)
      .find(".cell-content")
      .eq(2)
      .invoke("text")
      .then((jobTitle) => {
        cy.get(workforceSelector.searchInput).clear().type(jobTitle);
        cy.wait(2000);

        cy.get(workforceSelector.tableRow)
          .find(".cell-content")
          .eq(2)
          .contains(jobTitle);
      });
  });

  // 6. Search by Company
  it("Validating search functionality with company in use", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .find(".cell-content")
      .eq(1)
      .invoke("text")
      .then((company) => {
        cy.get(workforceSelector.searchInput).clear().type(company);
        cy.wait(2000);

        cy.get(workforceSelector.tableRow)
          .eq(0)
          .find(".cell-content")
          .eq(1)
          .should("contain.text", company);
      });
  });

  // 7. Case Insensitive Search
  it("Verify search Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", () => {
    cy.wait(2000);
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception?.response?.body?.projectWorkerDTOS || [];
      const firstNames = workers.map((w) => w.firstName).filter(Boolean);
      const name = Cypress._.sample(firstNames);

      const testValues = [
        name.toUpperCase(),
        name.toLowerCase(),
        name
          .split("")
          .map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
          .join(""),
      ];

      const runSearch = (value) => {
        cy.get(workforceSelector.searchInput).clear().type(value);
        cy.wait(1500);

        cy.get(".sc-cRmqLi .personal-info-content__title").each(($el) => {
          expect($el.text().toLowerCase()).to.include(name.toLowerCase());
        });
      };

      testValues.forEach(runSearch);
    });
  });

});
