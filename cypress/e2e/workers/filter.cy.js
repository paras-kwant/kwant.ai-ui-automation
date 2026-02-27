/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import "../../support/commands";
import { log, table } from "console";
import workerHelper from '../../support/helper/workerHelper.js';
import filterPage from '../../pages/workforce/filter.js';

describe("Worker Module - Filter", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    workerHelper.visitWorkersPage();
  });
  
  before(() => {
    cy.wait(1000)
      cy.get(".icon-button button").first().click();
       cy.contains('button p', "Reset to default").click() 
       cy.wait(5000) 
      cy.get('[data-rbd-draggable-id="safetyAlert"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="mwbe"] [type="checkbox"]').click()
      cy.get('[data-rbd-draggable-id="raceName"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="crewName"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="ethnicity"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="sex"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="status"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="boolean_test"] [type="checkbox"]').click();

      cy.wait(1000)
      cy.get('button p').contains('Save').should('be.visible').click();
  });
  
  beforeEach(() => {
    cy.cleanUI();

  });
  
  

  it("Verify the table header filter - name", () => {
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
      cy.log(`First names: ${firstNames.join(", ")}`);

      const randomNames = Cypress._.sampleSize(firstNames, 2);

      cy.contains(workforceSelector.tableColumn, 'Name')
	  .find('.table-header-filter-btn')
	  .click();
  
      cy.get(workforceSelector.searchInput).eq(1).type(randomNames[0]);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).eq(0).should("contain.text", randomNames[0]);

      cy.get("button p").contains("Filters").click();
      cy.get('[placeholder="Enter Name"]').should("have.value", randomNames[0]);
      cy.get("body").click();
      cy.get(workforceSelector.clearFilterButton).click();
    });
  });



  it('Verify the table header filter exists for applicable table headers', () => {
    cy.wait(1000);

    cy.get(workforceSelector.tableColumn).each(($el, index) => {
      if (index >= 3) { 
        cy.wrap($el).then(($header) => {
          if ($header.find('.table-header-filter-btn').length) {
            cy.wrap($header)
              .find('.table-header-filter-btn svg')
              .should('exist'); 
          }
        });
      }
    });
  });

  it("Verify Clear filter functionality", () => {
    let workerNamesBefore, selectedName, selectedCompany, selectedJobTitle, selectedStatus;

    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();
    cy.wait("@workersApi");
    cy.wait(1000); // Wait for DOM to render
    
    // Capture the initial state AFTER page is fully loaded
    cy.get(".personal-info-content__title").should("have.length.greaterThan", 0).then(($elements) => {
      workerNamesBefore = $elements
        .map((index, element) => Cypress.$(element).text().trim())
        .get()
        .join("");
      cy.log("Before Filters:", workerNamesBefore);
      cy.log("Before Filters Count:", $elements.length);
    });

    cy.get("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);
      const randomName = Cypress._.sample(firstNames);
      selectedName = randomName;

      cy.log(`Selected Name: ${randomName}`);
      cy.get(".table-header-filter-btn").eq(0).click();
      cy.get(workforceSelector.searchInput).eq(1).type(randomName);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);
    });

    cy.get(".table-header-filter-btn").eq(1).click();
    cy.get('body').should('be.visible');

    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
          return text !== "None";
        });
      
        expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);
      
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        cy.wrap(validLabels.eq(randomIndex))
          .find('input[type="checkbox"]')
          .check({ force: true });
      });
    });

    cy.get(".table-header-filter-btn").eq(2).click();
    cy.get('[placeholder="Search"]').eq(1).type("worker");
    selectedJobTitle = "worker";

    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(".table-header-filter-btn").eq(3).click();

    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
          return text !== "None";
        });
      
        expect(validLabels.length, 'Non-None options available').to.be.greaterThan(0);
      
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        cy.wrap(validLabels.eq(randomIndex))
          .find('input[type="checkbox"]')
          .check({ force: true });
      });
    });

    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(workforceSelector.clearFilterButton).click();
    cy.wait(3000);
    
    // Capture the state AFTER clearing filters
    cy.get(".personal-info-content__title").should("have.length.greaterThan", 0).then(($elements) => {
      const workerNamesAfter = $elements
        .map((index, element) => Cypress.$(element).text().trim())
        .get()
        .join("");
      cy.log("After Clear:", workerNamesAfter);
      cy.log("After Clear Count:", $elements.length);
      
      // Verify filters were cleared - table should match original state
      expect(workerNamesAfter).to.equal(workerNamesBefore);
    });
  });

 it("Verify Multiple Company Selection for Filtering", () => {
    cy.log("Testing multiple company filter selection");

    cy.get(workforceSelector.tableRow).then(($rows) => {
      const rowsToCheck = $rows.slice(0, 4);
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

      const uniqueCompanies = [...new Set(companyNamesFromTable)];

      cy.log(`Total unique companies to select: ${uniqueCompanies.length}`);
      cy.log(`Unique companies: ${uniqueCompanies.join(", ")}`);

      cy.get(".table-header-filter-btn").eq(1).click({ force: true });
      cy.wait(1000);

      cy.wrap(uniqueCompanies).each((selectedCompany) => {
        cy.log(`Searching for company: ${selectedCompany}`);

        cy.get('[placeholder="Search"]').eq(1).clear();
        cy.wait(300);
        cy.get('[placeholder="Search"]').eq(1).type(selectedCompany);
        cy.wait(800);

        cy.get('[class*="select_item_container"]').within(() => {
          cy.get('label[for^=":r"]').each(($label) => {
            const companyName = Cypress.$($label)
              .find('span[type="onDropdown"]')
              .last()
              .text()
              .trim();

            if (companyName === selectedCompany) {
              cy.log(`Checking company: ${companyName}`);
              cy.wrap($label)
                .find('input[type="checkbox"]')
                .check({ force: true });
              return false;
            }
          });
        });

        cy.wait(500);
      });

      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

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

                cy.log(`Row has expected company: ${companyName}`);
              });
            });
          });
        } else {
          cy.get('.empty-body').should('be.visible');
          cy.log('No results found - empty state displayed');
        }
      });
    });
  });

  
  
  it("Verify combined filters (Name + Company + Job Title + Site Status)", () => {
    cy.log("Testing combined filters");
  
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();
  
    // ================= Name filter =================
    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const randomName = Cypress._.sample(
        workers.map(w => w.firstName).filter(Boolean)
      );
  
      cy.log(`Selected Name: ${randomName}`);
  
      cy.contains(workforceSelector.tableColumn, "Name")
        .find(".table-header-filter-btn")
        .click({ force: true });
  
      cy.get(workforceSelector.searchInput).last().type(randomName);
      cy.contains("Filters:").click();
  
      cy.wrap(randomName).as("selectedName");
    });
  
    // ================= Company filter =================
    cy.contains(workforceSelector.tableColumn, "Company")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const valid = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        const randomIndex = Cypress._.random(0, valid.length - 1);
        const $randomLabel = valid.eq(randomIndex);
  
        const company = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Selected Company: ${company}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        cy.wrap(company).as("selectedCompany");
      });
    });
  
    cy.contains("Filters:").click();
  
    // ================= Job Title filter =================
    cy.contains(workforceSelector.tableColumn, "Job Title")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    cy.get('[placeholder="Search"]').last().type("worker");
    cy.contains("Filters:").click();
  
    cy.wrap("worker").as("selectedJobTitle");
  
    // ================= Site Status filter =================
    cy.contains(workforceSelector.tableColumn, "Site Status")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const valid = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        const randomIndex = Cypress._.random(0, valid.length - 1);
        const $randomLabel = valid.eq(randomIndex);
  
        const status = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Selected Site Status: ${status}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        cy.wrap(status).as("selectedStatus");
      });
    });
  
    cy.contains("Filters:").click();
  
    // ================= Validation =================
    cy.then(function () {
      cy.log("Validating combined filter results");
  
      cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
  
          cy.get(`${workforceSelector.tableRow} .personal-info-content__title`)
            .contains(this.selectedName)
            .should("be.visible");
  
          cy.get(".table_td:nth-child(6) .cell-content")
            .contains(this.selectedCompany)
            .should("be.visible");
  
          cy.get(".table_td:nth-child(7) .cell-content")
            .contains(this.selectedJobTitle)
            .should("be.visible");
  
          if (this.selectedStatus.toLowerCase() === "flagged") {
            cy.get(".dot-container__status-label")
              .should("contain.text", "Red");
          } else {
            cy.get(".dot-container__status-label")
              .contains(this.selectedStatus)
              .should("be.visible");
          }
  
          cy.log("All combined filters validated successfully ✅");
        } else {
          cy.get(".empty-body").should(
            "contain.text",
            "No Results Found"
          );
          cy.log("No results found for combined filters");
        }
      });
    });
  });


  it("Verifies the Company filter works correctly", () => {
    filterPage.applyFilter("Company");
  
    cy.get('@selectedFilterValue').then((selectedValue) => {
      filterPage.verifyFilteredRows(
        workforceSelector.generalDetailsPage,
        'Company',
        selectedValue
      );
    });
  });
  

  it('Verify Toast Message for Empty Filter Results', () => {
    cy.log("Testing for toast message on empty filter results");

    cy.get(".table-header-filter-btn").eq(0).click();
    cy.get(workforceSelector.searchInput).eq(1).type("NonExistentWorkerName");

    cy.get("p").contains("Filters:").click();
    cy.wait(1000);

    cy.get(".empty-body").contains(
      "No Results Found"
    );
  });

  it("Verify Name Filter Supports Case Insensitivity (Uppercase, Lowercase, Mixed Case)", () => {
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map((w) => w.firstName).filter(Boolean);

      const name = Cypress._.sample(firstNames);
      cy.log(`Selected name: ${name}`);

      const upper = name.toUpperCase();
      const lower = name.toLowerCase();
      const mixed = name
        .split("")
        .map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
        .join("");

      const runSearch = (searchValue) => {
        cy.contains(workforceSelector.tableColumn, 'Name').find('.table-header-filter-btn').click()
        cy.get(workforceSelector.searchInput).eq(1)
          .clear()
          .type(searchValue);

        cy.get("p").contains("Filters:").click();
        cy.wait(1000);

        cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).each(($el) => {
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
    cy.get('[label="Filters"] button').click();
    cy.get('[name="name"]').type("test");
    cy.get('[name="phone"]').type("98789765654");
    cy.get('[name="email"]').type("demo@gmail.com");
    cy.get("footer button p").contains('Filter').click();
    cy.get("body").click(0,0);

    cy.get(".filter-tag").should("have.length", 3);
    cy.get(".filter-tag").eq(0).should("contain.text", "Name: test");
    cy.get(".filter-tag").eq(1).should("contain.text", "Phone: 98789765654");
    cy.get(".filter-tag").eq(2).should("contain.text", "Email: demo@gmail.com");

    cy.get(".action-container").eq(0).click();
    cy.get(".filter-tag").eq(0).should("not.contain.text", "Name: test");
    cy.get(".filter-tag").should("have.length", 2);

    cy.get(".action-container").eq(0).click();
    cy.get(".filter-tag")
      .eq(0)
      .should("not.contain.text", "Phone: 98789765654");
    cy.get(".filter-tag").should("have.length", 1);
  });

  it("Verify Filter of the different column for Job (Title)", () => {
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
        cy.get(".empty-body").contains(
          "No Results Found "
        );
      }
    });
  });

  it("Verify filter of the Site Status column", () => {
    cy.log("Testing Site Status filter");
  
    // Open Site Status filter
    cy.contains(workforceSelector.tableColumn, "Site Status")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    // Select random non-"None" status
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
  
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        expect(validLabels.length, "Valid Site Status options")
          .to.be.greaterThan(0);
  
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        const $randomLabel = validLabels.eq(randomIndex);
  
        const statusName = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Randomly selected status: ${statusName}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        cy.wrap(statusName).as("selectedStatus");
      });
    });
  
    // Apply filter
    cy.contains("Filters:").click();
    cy.wait(1000);
  
    // Validate results
    cy.get("@selectedStatus").then((statusName) => {
      cy.get("body").then(($body) => {
  
        if ($body.find(workforceSelector.tableRow).length > 0) {
  
          if (statusName.toLowerCase() === "flagged") {
            cy.log("Handling 'Flagged' status special case");
  
            // Flagged shows red dot instead of text
            cy.get(".dot-container__status-label")
              .should("contain.text", "Red")
              .and("be.visible");
  
          } else {
            cy.contains(".dot-container__status-label", statusName)
              .scrollIntoView()
              .should("be.visible");
          }
  
        } else {
          cy.get(".empty-body").contains(
            "No Results Found"
          );
        }
      });
    });
  });
  

  it("Verify filter Interaction with Search Bar Filter", () => {
    cy.intercept("POST", "/api/filterProjectWorker*").as("workersApi");
    cy.reload();

    cy.wait("@workersApi").then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers
        .map((worker) => worker.firstName)
        .filter(Boolean);

      cy.log(`First names: ${firstNames.join(", ")}`);

      const randomNames = Cypress._.sampleSize(firstNames, 2);
      cy.contains(workforceSelector.tableColumn, 'Name').find('.table-header-filter-btn').click()
      cy.get(workforceSelector.searchInput).eq(1).type(randomNames[0]);
      cy.get("p").contains("Filters:").click();
      cy.wait(1000);

      cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).each(($el) => {
        cy.wrap($el).should("contain.text", randomNames[0]);
      });

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

          cy.get(`${workforceSelector.tableRow} .personal-info-content__title`).eq(0).should("contain.text", randomNames[0]);

          cy.get(workforceSelector.tableRow)
            .eq(0)
            .find(".cell-content")
            .eq(2)
            .should("contain.text", jobTitle);
        });
    });
  });
  it("Verify the table header filter icon (funnel icon) is visible", () => {
    cy.get(workforceSelector.tableColumn).each(($el, index) => {
      if (index >= 3) {
        cy.wrap($el).then(($header) => {
          if ($header.find('.table-header-filter-btn').length) {
            cy.wrap($header)
              .find('.table-header-filter-btn')
              .should('exist')
              .find('svg')
              .should('exist');
          }
        });
      }
    });
  });

  it("Verify all selected options are visible on hover over pills", () => {
    cy.log("Testing Company filter pill hover");
  
    // Open Company filter
    cy.contains(workforceSelector.tableColumn, "Company")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    // Select random company
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
  
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        expect(validLabels.length).to.be.greaterThan(0);
  
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        const $randomLabel = validLabels.eq(randomIndex);
  
        const companyName = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Randomly selected company: ${companyName}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        // store for hover validation
        cy.wrap(companyName).as("selectedCompany");
      });
    });
  
    // Apply filter
    cy.contains("Filters:").click();
  
    // Verify pill visible
    cy.get(".filter-tag")
      .should("be.visible")
      .and("contain.text", "Company Name");
  
    // Hover over pill and verify selected option
    cy.get("@selectedCompany").then((companyName) => {
      cy.get(".filter-tag").realHover();
      cy.wait(300);
  
      cy.contains(".label.default__label", companyName)
        .should("be.visible");
    });
  });
  

  
  it("Verify red dot indicator appears on filter icon when filter is applied", () => {
    cy.log("Testing Company filter red dot indicator");
  
    // Open Company filter
    cy.contains(workforceSelector.tableColumn, "Company")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    // Select random company
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
  
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        expect(validLabels.length).to.be.greaterThan(0);
  
        const randomIndex = Cypress._.random(0, validLabels.length - 1);
        const $randomLabel = validLabels.eq(randomIndex);
  
        const companyName = $randomLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.log(`Randomly selected company: ${companyName}`);
  
        cy.wrap($randomLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        cy.wrap(companyName).as("selectedCompany");
      });
    });

    cy.contains(workforceSelector.tableColumn, "Company")
      .find(".table-header-filter-btn")
      .within(() => {
        cy.get("div") // or the element that represents the red dot
          .should("be.visible")
      });
  });
  

  it("Verifies the Phone filter works correctly", ()=>{
    cy.get(workforceSelector.tableColumn).contains('Phone')   
    .parent()                              
    .find('svg')                           
    .click({ force: true }); 
    cy.get(workforceSelector.searchInput).eq(1).type('9812345678');
    cy.get("p").contains("Filters:").click();

    cy.wait(2000)

    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).first().click();
        workforceSelector.personalDetails().click();
        cy.getWorkerField('Phone').contains('981-2345678');
      } else {
        cy.get(".empty-body").contains(
          "No Results Found"
        );
      }
    });
  });
  
  


  it("Verifies the Last Seen Location filter works correctly for all rows", () => {
    filterPage.applyFilter("Device");
    cy.get('@selectedFilterValue').then((selectedValue) => {
      filterPage.verifyFilteredRows(
        workforceSelector.accessControlPage,
        'Last Seen On',
        selectedValue
      );
    });
  });

  it("Verifies the Race filter works correctly for all rows", () => {
    filterPage.applyFilter("Race");
    cy.get('@selectedFilterValue').then((selectedValue) => {
      filterPage.verifyFilteredRows(
        workforceSelector.personalDetailsPage,
        'Race',
        selectedValue
      );
    });
  });


  


  it("Verifies the Device filter works correctly", () => {
    filterPage.applyFilter("Device");
  
    cy.get('@selectedFilterValue').then((selectedValue) => {
      filterPage.verifyFilteredRows(
        workforceSelector.accessControlPage,
        'Device',
        selectedValue
      );
    });
  });
  
  

  

  

  it("Verifies the Sex filter works correctly", () => {
    filterPage.applyFilter("Sex");
  
    cy.get('@selectedFilterValue').then((selectedValue) => {
      filterPage.verifyFilteredRows(
        workforceSelector.personalDetailsPage,
        'Sex',
        selectedValue
      );
    });
  });

  it("Verifies the Ethnicity filter works correctly for all rows", () => {
    filterPage.applyFilter("Ethnicity");
  
    cy.get('@selectedFilterValue').then((selectedValue) => {
      cy.log(`Verifying all rows have Ethnicity: ${selectedValue}`);
      filterPage.verifyFilteredRows(
        workforceSelector.personalDetailsPage,
        'Ethnicity',
        selectedValue
      );
    });
  });

  
  
  it("Verifies the Safety Alert filter works correctly for all rows", () => {
    cy.contains(workforceSelector.tableColumn, 'Safety Alert')                           
    .find('.table-header-filter-btn')
      .click({ force: true });
  
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        let selectedAlert;
  
        if (validLabels.length === 0) {
          cy.log("⚠️ No valid Safety Alert options found, selecting first as fallback");
          const $first = $labels.eq(0);
          selectedAlert = $first
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
  
          cy.wrap($first).find('input[type="checkbox"]').check({ force: true });
        } else {
          const randomIndex = Cypress._.random(0, validLabels.length - 1);
          const $randomLabel = validLabels.eq(randomIndex);
          selectedAlert = $randomLabel
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
  
          cy.log(`Selected Safety Alert: ${selectedAlert}`);
          cy.wrap($randomLabel).find('input[type="checkbox"]').check({ force: true });
        }
  
        cy.wrap(selectedAlert).as('selectedAlert');
      });
    });
  
    cy.contains("Filters:").click();
    cy.wait(1000);
  
    cy.get('@selectedAlert').then((selectedAlert) => {
      cy.get("body").then(($body) => {
        const rowCount = $body.find(workforceSelector.tableRow).length;
  
        if (rowCount > 0) {
          for (let i = 0; i < rowCount; i++) {
            cy.get(workforceSelector.tableRow).eq(i).click({ force: true });
            cy.get(workforceSelector.SafetyAuditPage).click();
            cy.get('.label.default__label').should("contain.text", selectedAlert);
  
            cy.get('body').click(0, 0, { force: true });
            cy.wait(200);
          }
          cy.log(`✅ All rows verified for Safety Alert: ${selectedAlert}`);
        } else {
          cy.get(".empty-body").should("be.visible");
          cy.log('No results found - empty state displayed');
        }
      });
    });
  });

  it("Verifies the Crew filter works correctly for all rows", () => {
    filterPage.applyFilter("Crew");
  
    cy.get('@selectedFilterValue').then((selectedValue) => {
      cy.log(`Verifying all rows have Crew: ${selectedValue}`);
      filterPage.verifyFilteredRows(
        workforceSelector.jobDetailsPage,
        'Crew',
        selectedValue
      );
    });
  });

  it("Validates Boolean filter results based on checkbox state", () => {

    cy.contains(workforceSelector.tableColumn, "Boolean test")
      .find(".table-header-filter-btn")
      .click({ force: true });
  
    cy.get('[class*="select_item_container"]').within(() => {
      cy.get('label[for^=":r"]').then(($labels) => {
  
        const validLabels = $labels.filter((_, el) => {
          const text = Cypress.$(el)
            .find('span[type="onDropdown"]')
            .last()
            .text()
            .trim();
          return text && text !== "None";
        });
  
        let selectedValue;
  
        const $selectedLabel =
          validLabels.length > 0
            ? validLabels.eq(Cypress._.random(0, validLabels.length - 1))
            : $labels.eq(0);
  
        selectedValue = $selectedLabel
          .find('span[type="onDropdown"]')
          .last()
          .text()
          .trim();
  
        cy.wrap($selectedLabel)
          .find('input[type="checkbox"]')
          .check({ force: true });
  
        cy.log(`Selected Boolean value: ${selectedValue}`);
  
        cy.wrap(selectedValue).as('selectedBooleanValue');
      });
    });
  
    cy.contains("Filters:").click();
    cy.wait(1000);
  
    cy.get('@selectedBooleanValue').then((selectedValue) => {
      cy.get("body").then(($body) => {
        const rowCount = $body.find(workforceSelector.tableRow).length;
  
        if (rowCount > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row).within(() => {
              if (selectedValue === "True") {
                cy.get('.exact-toggle-switch [type="checkbox"]')
                  .should("exist")
                  .and("be.checked");
              } else if (selectedValue === "False") {
                cy.get('.exact-toggle-switch [type="checkbox"]')
                  .should("exist")
                  .and("not.be.checked");
              }
            });
          });
  
          cy.log(`✅ All rows verified for Boolean: ${selectedValue}`);
        } else {
          cy.get(".empty-body").should("be.visible");
          cy.log('No results found - empty state displayed');
        }
      });
    });
  });
})
