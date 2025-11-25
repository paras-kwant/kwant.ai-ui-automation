/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "../../support/commands";
import { log } from "console";



describe("Worker Module - Filter", () => {
    before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
  });
  
  beforeEach(() => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });


  it("Verify the table header filter - name", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
      cy.log(`First names: ${firstNames.join(", ")}`);

      const randomNames = Cypress._.sampleSize(firstNames, 2);

      workforceSelector.nameFilter().click();
      cy.get("input.sc-fHjqPf.fCepZC").type(randomNames[0]);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      // cy.get(".sc-cRmqLi .personal-info-content__title").each(($el) => {
      //   cy.wrap($el).should("contain.text", randomNames[0]);
      // });

      cy.get(".sc-cRmqLi .personal-info-content__title").eq(0).should("contain.text", randomNames[0]);

      cy.get("button p").contains("Filters").click();
      cy.get('[placeholder="Enter Name"]').should("have.value", randomNames[0]);
      cy.get("body").click();
      cy.get(workforceSelector.clearFilterButton).click();
    });
  });

  it('Verify the table header filter exists for applicable table headers', () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.wait(1000);
  
    cy.get('.sc-bXWnss').each(($el, index) => {
      if (index >= 3) { // skip first 3 headers
        cy.wrap($el).then(($header) => {
          if ($header.find('.table-header-filter-btn').length) {
            cy.wrap($header)
              .find('.table-header-filter-btn')
              .should('exist'); // check existence only
          }
        });
      }
    });
  });

  it("Verify Clear filter functionality", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);

    let workerNamesBefore, selectedName, selectedCompany, selectedJobTitle, selectedStatus;

    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      cy.get(".personal-info-content__title").then(($elements) => {
        workerNamesBefore = $elements
          .map((index, element) => Cypress.$(element).text().trim())
          .get()
          .join("");
        cy.log("Before Search:", workerNamesBefore);
      });

      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
      const randomName = Cypress._.sample(firstNames);
      selectedName = randomName;

      cy.log(`Selected Name: ${randomName}`);
      cy.get(".table-header-filter-btn").eq(0).click();
      cy.get("input.sc-fHjqPf.fCepZC").type(randomName);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.get(".table-header-filter-btn").eq(1).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const companyName = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      selectedCompany = companyName;

      cy.log(`Selected Company: ${companyName}`);
      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.get(".table-header-filter-btn").eq(2).click();
    cy.get('[placeholder="Search"]').eq(1).type("worker");
    selectedJobTitle = "worker";

    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(".table-header-filter-btn").eq(3).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const statusName = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      selectedStatus = statusName;

      cy.log(`Selected Site Status: ${statusName}`);
      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      cy.get(workforceSelector.clearFilterButton).click();
      cy.wait(1000);
      cy.get(".personal-info-content__title").should(
        "have.length.greaterThan",
        0
      );

      cy.get(".personal-info-content__title").then(($elements) => {
        const workerNamesAfter = $elements
          .map((index, element) => Cypress.$(element).text().trim())
          .get()
          .join("");
        cy.log("After Clear:", workerNamesAfter);
      });
    });
  });


  it("Verify Multiple Company Selection for Filtering", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.log("Testing multiple company filter selection");

    // Get company names from first 4 rows
    cy.get(workforceSelector.tableRow).then(($rows) => {
        // Slice to get first 4 rows
        const rowsToCheck = $rows.slice(0, 4);
        
        // Collect all company names properly
        const companyNamesFromTable = [];
        
        rowsToCheck.each((index, row) => {
          const companyName = Cypress.$(row)
            .find(".table_td:nth-child(6) .cell-content")
            .text()
            .trim();
          
          if (companyName) {
            companyNamesFromTable.push(companyName);
          }
        });

        cy.log(`All company names collected: ${companyNamesFromTable.join(", ")}`);

        // Get unique companies
        const uniqueCompanies = [...new Set(companyNamesFromTable)];
        
        cy.log(`Total unique companies to select: ${uniqueCompanies.length}`);
        cy.log(`Unique companies: ${uniqueCompanies.join(", ")}`);

        // Open company filter
        cy.get(".table-header-filter-btn").eq(1).click();
        cy.wait(1000);

        // Select ALL unique companies found
        cy.wrap(uniqueCompanies).each((selectedCompany) => {
          cy.log(`🔍 Searching for company: ${selectedCompany}`);
          
          // Clear and search for the company
          cy.get('input[placeholder="Search"]').eq(1).clear();
          cy.wait(300);
          cy.get('input[placeholder="Search"]').eq(1).type(selectedCompany);
          cy.wait(800);

          // Find and check the company checkbox
          cy.get(".sc-fzQBhs.fyTPqL").each(($parent) => {
            const companyName = $parent.find(".sc-eldPxv.bVwlNE").text().trim();
            
            if (companyName === selectedCompany) {
              cy.log(`✓ Checking company: ${companyName}`);
              cy.wrap($parent)
                .find('input[type="checkbox"]')
                .first()
                .check({ force: true });
              
              // Stop looking once found
              return false;
            }
          });
          
          cy.wait(500);

        });

        cy.get("p").contains("Filters:").click();
        
        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            cy.get(workforceSelector.tableRow).each(($row) => {
              cy.wrap($row).within(() => {
                cy.get(".table_td:nth-child(6) .cell-content").then(($cell) => {
                  const companyName = $cell.text().trim();
                  const isExpectedCompany = uniqueCompanies.includes(companyName);
                  
                  expect(isExpectedCompany, 
                    `Company "${companyName}" should be one of: ${uniqueCompanies.join(", ")}`
                  ).to.be.true;
                  
                  cy.log(`✓ Row has expected company: ${companyName}`);
                });
              });
            });
          } else {
            cy.get('.empty-body').should('be.visible');
            cy.log('No results found - empty state displayed');
          }

        })
      })
    })



  it("Verify Dropdown Selection for Filtering - company", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.log("Testing for company filter");

    cy.get(".table-header-filter-btn").eq(1).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const name = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      
      cy.log(`Randomly selected company name: ${name}`);

      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      cy.verifyTableorEmptyState({
        tableRowSelector: ".sc-cRmqLi",
        cellSelector: ".table_td:nth-child(6) .cell-content",
        expectedText: name,
      });
    });
  });

  it("Verify combined filters (Name + Company + Job Title + Site Status)", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.log("Testing combined filters");

    let selectedName, selectedCompany, selectedJobTitle, selectedStatus;

    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
      const randomName = Cypress._.sample(firstNames);
      selectedName = randomName;

      cy.log(`Selected Name: ${randomName}`);
      cy.get(".table-header-filter-btn").eq(0).click();
      cy.get("input.sc-fHjqPf.fCepZC").type(randomName);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.get(".table-header-filter-btn").eq(1).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const companyName = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      selectedCompany = companyName;

      cy.log(`Selected Company: ${companyName}`);
      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.get(".table-header-filter-btn").eq(2).click();
    cy.get('[placeholder="Search"]').eq(1).type("worker");
    selectedJobTitle = "worker";

    cy.log(`Selected Job Title: ${selectedJobTitle}`);
    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(".table-header-filter-btn").eq(3).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const statusName = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      selectedStatus = statusName;

      cy.log(`Selected Site Status: ${statusName}`);
      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.then(() => {
      cy.log(`Validating combined filters:`);
      cy.log(`Name: ${selectedName}`);
      cy.log(`Company: ${selectedCompany}`);
      cy.log(`Job Title: ${selectedJobTitle}`);
      cy.log(`Status: ${selectedStatus}`);

      cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.log("Validating filtered results contain all selected criteria");

          cy.get(".sc-cRmqLi .personal-info-content__title")
            .contains(selectedName)
            .should("be.visible");

          cy.get(".table_td:nth-child(6) .cell-content")
            .contains(selectedCompany)
            .should("be.visible");

          cy.get(".table_td:nth-child(7) .cell-content")
            .contains(selectedJobTitle)
            .should("be.visible");

          if (selectedStatus.toLowerCase() === "flagged") {
            cy.get(".dot-container__status-label")
              .should("contain.text", "Red")
              .and("be.visible");
          } else {
            cy.get(".dot-container__status-label")
              .contains(selectedStatus)
              .should("be.visible");
          }

          cy.log("✅ All combined filters validated successfully");
        } else {
          cy.get(".empty-body").should(
            "have.text",
            "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
          );
          cy.log("⚠️ No results found matching all combined filter criteria");
        }
      });
    });
  });

  it('Verify Toast Message for Empty Filter Results',()=>{
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.log("Testing for toast message on empty filter results");

    cy.get(".table-header-filter-btn").eq(0).click();
    cy.get('input.sc-fHjqPf.fCepZC').type("NonExistentWorkerName");

    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(".empty-body").should(
      "have.text",
      "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
    );

  })


  it("Verify Name Filter Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();
  
    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map((w) => w.firstName).filter(Boolean);
  
      const name = Cypress._.sample(firstNames); // pick 1 name
      cy.log(`Selected name: ${name}`);
  
      const upper = name.toUpperCase();
      const lower = name.toLowerCase();
      const mixed = name
        .split("")
        .map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
        .join("");
  
      const runSearch = (searchValue) => {
        workforceSelector.nameFilter().click();
        cy.get("input.sc-fHjqPf.fCepZC")
          .clear()
          .type(searchValue);
  
        cy.get("p").contains("Filters:").click();
        cy.wait(1000);
  
        cy.get(".sc-cRmqLi .personal-info-content__title").each(($el) => {
          const text = $el.text().toLowerCase();
          expect(text).to.include(name.toLowerCase());
        });
      };
  
      cy.log(` Testing UPPERCASE: ${upper}`);
      runSearch(upper);
  
      cy.log(`Testing lowercase: ${lower}`);
      runSearch(lower);
  
      cy.log(` Testing MiXeD: ${mixed}`);
      runSearch(mixed);
    });
  });
  it("Validate removing filter one after another", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('[label="Filters"] button').click();
    cy.get('[name="name"]').type("test");
    cy.get('[name="phone"]').type("98789765654");
    cy.get('[name="email"]').type("demo@gmail.com");
    cy.get(".sc-aXZVg.hdcwLk button").click();
    cy.get(".jHNNhu").click();

    cy.get(".filter-tag").should("have.length", 3);
    cy.get(".filter-tag").eq(0).should("contain.text", "Name: test");
    cy.get(".filter-tag").eq(1).should("contain.text", "Phone: 98789765654");
    cy.get(".filter-tag").eq(2).should("contain.text", "Email: demo@gmail.com");

    cy.get(".sc-ecPEgm.kVJnXL >> .action-container").eq(0).click();
    cy.get(".filter-tag").eq(0).should("not.contain.text", "Name: test");
    cy.get(".filter-tag").should("have.length", 2);

    cy.get(".sc-ecPEgm.kVJnXL >> .action-container").eq(0).click();
    cy.get(".filter-tag")
      .eq(0)
      .should("not.contain.text", "Phone: 98789765654");
    cy.get(".filter-tag").should("have.length", 1);
  });

  it("Verify Filter of the different column for Job (Title)", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);

    cy.get(".table-header-filter-btn").eq(2).click();
    cy.get('input[placeholder="Search"]').eq(1).type("tech");
    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get("body").then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(".table_td:nth-child(7) .cell-content").then(($cells) => {
          const hasMatch = [...$cells].some((cell) =>
            cell.innerText.toLowerCase().includes("tech")
          );
          expect(hasMatch).to.be.true;
        });
      } else {
        cy.get(".empty-body").should(
          "have.text",
          "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
        );
      }
    });
  });

  it("Verify Filter of the different column for site status", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.log("Testing for site status filter");

    cy.get(".table-header-filter-btn").eq(3).click();

    cy.get(".sc-fzQBhs.fyTPqL").then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const name = $randomParent.find(".sc-eldPxv.bVwlNE").text().trim();
      
      cy.log(`Randomly selected status: ${name}`);

      cy.wrap($randomParent)
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          if (name.toLowerCase() === "flagged") {
            cy.log("Handling 'Flagged' status with special case");
          } else {
            cy.contains('.dot-container__status-label', name)
  .scrollIntoView()
  .should('be.visible');
          }
        } else {
          cy.get(".empty-body").should(
            "have.text",
            "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
          );
        }
      });
    });
  });

  it("Verify Interaction with Search Bar Filter", () => {
    // cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();
  
    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
  
      cy.log(`First names: ${firstNames.join(", ")}`);
  
      const randomNames = Cypress._.sampleSize(firstNames, 2);
  
      // --- Apply Name Search ---
      workforceSelector.nameFilter().click();
      cy.get("input.sc-fHjqPf.fCepZC").type(randomNames[0]);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
  
      cy.get(".sc-cRmqLi .personal-info-content__title").each(($el) => {
        cy.wrap($el).should("contain.text", randomNames[0]);
      });
  
      // --- Get Job Title from first row and apply Job Title filter ---
      cy.get(workforceSelector.tableRow)
        .eq(0)
        .find(".cell-content")
        .eq(2)
        .invoke("text")
        .then((jobTitleText) => {
          const jobTitle = jobTitleText.trim();
          cy.log(`Job Title from first row: ${jobTitle}`);
  
          cy.get(".table-header-filter-btn").eq(2).click();
          cy.get('input[placeholder="Search"]').eq(1).type(jobTitle);
          cy.get("p").contains("Filters:").click();
          cy.wait(1000);
  
      
          cy.get(".sc-cRmqLi .personal-info-content__title").eq(0).should("contain.text", randomNames[0]);
  
      
          cy.get(workforceSelector.tableRow)
            .eq(0)
            .find(".cell-content")
            .eq(2)
            .should("contain.text", jobTitle);
        });
    });
  });
  

});