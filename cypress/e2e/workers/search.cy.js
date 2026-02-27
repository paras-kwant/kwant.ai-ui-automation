/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import WorkerHelper from '../../support/helper/workerHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Module - Search", () => {

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
  });

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

  it("Validating the search functionality for the search with no results", () => {
    cy.get(workforceSelector.searchInput).clear().type("NonExistentName12345");
    cy.get(".empty-body").should("contain.text", "No Results Found");
  });

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

  it("Validating search functionality with device in use", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .find(".cell-content")
      .eq(4)
      .invoke("text")
      .then((device) => {
        cy.get(workforceSelector.searchInput).clear().type(device);
        cy.wait(2000);

        cy.get(workforceSelector.tableRow).each(($row) =>{
          cy.wrap($row)
            .find(".cell-content")
            .eq(4)
            .should("contain.text", device);
        })
      });
  });

  it("Validating search functionality based on Last Seen Location in use", () => {
    cy.get(workforceSelector.tableRow)
      .eq(1)
      .find(".loc-content")
      .eq(0)
      .invoke("text")
      .then((LastSeenLocation) => {
        cy.get(workforceSelector.searchInput).clear().type(LastSeenLocation);
  
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row)
            .find(".loc-content")
            .eq(0)
            .should("contain.text", LastSeenLocation);
        });
      });
  });

  it("turinng on all the column and testing", ()=>{
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible')
    cy.get(".icon-button button").first().click();
    cy.contains('button p', "Reset to default").click()
    cy.wait(5000)
    cy.get('[data-rbd-draggable-id="raceName"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="sex"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="crewName"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="document"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="ethnicity"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="accessStatus"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="emergencyContactName"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="emergencyContactPhone"] [type="checkbox"]').click({ force: true });
    cy.get('[data-rbd-draggable-id="emergencyContactAddress"] [type="checkbox"]').click({ force: true });
    cy.contains('button p', 'Save').click();
  })

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

        cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).each(($el) => {
          expect($el.text().toLowerCase()).to.include(name.toLowerCase());
        });
      };

      testValues.forEach(runSearch);
    });
  });

});
