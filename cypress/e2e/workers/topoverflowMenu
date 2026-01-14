/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from "../../support/workforceSelector";
import workerHelper from '../../support/helper/workerHelper.js';


describe("Worker Module - overflowMenu", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    workerHelper.visitWorkersPage();

  });
  beforeEach(() => {
    cy.cleanUI()
  });

  it("Validate  the options in overflow menu", () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").should("not.exist");
    cy.contains(".dropdown-option", "Disable").should("not.exist");
    cy.contains(".dropdown-option", "Change Value").should("not.exist");
    cy.contains(".dropdown-option", "Send Alert").should("exist");

    cy.get(workforceSelector.tableRow)
      .eq(0)
      .find('[type="checkbox"]')
      .check({ force: true });

    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").should("exist");
    cy.contains(".dropdown-option", "Disable").should("exist");
    cy.contains(".dropdown-option", "Change Value").should("exist");
    cy.contains(".dropdown-option", "Send Alert").should("exist");
  });


  it('Verify the Save button is disabled unless the inputs are selected from the drop-down of Cost Code, Crew, Job Title.',()=>{
    cy.get('.personal-info-content__title').should('be.visible')
    cy.get(".sc-cRmqLi").eq(0).find('[type="checkbox"]').check({force: true});
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Change Value").click();
    cy.get('[label="Save"] button').should('be.disabled');


  })

  it(" Verify that the 'Disable' button is hidden when no worker is selected in the worker data table.", () => {
    cy.get('.personal-info-content__title').should('be.visible')
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Disable").should("not.exist");
  });


  it("Validate the Change Value functionality - Job Title", () => {
  
    cy.get(workforceSelector.tableRow).eq(2).find('[type="checkbox"]').check({ force: true });
  
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Change Value").click();
    cy.selectRandomOption('[label="Job Title"] input',".sc-tagGq","JobTitle");
  
    cy.get('[label="Job Title"] input')
      .invoke("val")
      .then((val) => cy.wrap(val).as("JobTitle"));
  
  
    cy.get(workforceSelector.saveButton).click();
  
    cy.contains("Value changed successfully").should("be.visible");
  
    cy.get(".sc-cRmqLi").eq(2).click({ force: true });
    cy.wait(1500);
    workforceSelector.jobDetails().click();
    cy.get("@JobTitle").then((JobTitle) => {
      const expectedJobTitle = JobTitle === "None" ? "-" : JobTitle;
      cy.getWorkerField("Job Title").contains(expectedJobTitle);
    });
  });


  it("Validate the Change Value functionality - Crew", () => {
  
    cy.get(workforceSelector.tableRow).eq(2).find('[type="checkbox"]').check({ force: true });
  
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Change Value").click();
    cy.selectRandomOption('[label="Crew"] input',".sc-tagGq","Crew");
  
    cy.get('[label="Crew"] input')
      .invoke("val")
      .then((val) => cy.wrap(val).as("Crew"));
  
  
    cy.get(workforceSelector.saveButton).click();
  
    cy.contains("Value changed successfully").should("be.visible");
  
    cy.get(".sc-cRmqLi").eq(2).click({ force: true });
    cy.wait(1500);
    workforceSelector.jobDetails().click();
    cy.get("@Crew").then((Crew) => {
      const expectedCrew = Crew === "None" ? "-" : Crew;
      cy.getWorkerField("Crew").contains(expectedCrew);
    });
  });
  


  it("Validate the Change Value for multiple user using select feature", () => {
    cy.get(workforceSelector.tableRow)
      .eq(0)
      .find('[type="checkbox"]')
      .check({ force: true });
  
    cy.get(workforceSelector.tableRow)
      .eq(1)
      .find('[type="checkbox"]')
      .check({ force: true });
  
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Change Value").click();
  
    cy.selectRandomOption(
      ".sc-fHjqPf.lazXQn:eq(0)",
      ".sc-tagGq",
      "Trade Classification"
    );
  
    cy.selectRandomOption(
      ".sc-fHjqPf.lazXQn:eq(1)",
      ".sc-tagGq",
      "Crew"
    );
  
    cy.selectRandomOption(
      ".sc-fHjqPf.lazXQn:eq(2)",
      ".sc-tagGq",
      "Job Title"
    );
  
    cy.get('[label="Job Title"] input')
      .invoke("val")
      .then((val) => cy.wrap(val).as("jobTitle"));
  
    cy.get('[label="Crew"] input')
      .invoke("val")
      .then((val) => cy.wrap(val).as("crew"));
  
    cy.get(workforceSelector.saveButton).click();
    cy.contains("Value changed successfully").should("be.visible");
  
    cy.get(".personal-info-content__title").eq(0).click({ force: true });
    cy.get(".sc-jXbUNg > .jmJtNV").eq(1).click();
  
    cy.get("@crew").then((crew) => {
      const expectedCrew = crew === "None" ? "-" : crew;
      cy.get(".hover-hoc-container__input__display-value")
        .eq(3)
        .should("contain.text", expectedCrew);
    });
  });
  
  it("Verify Disable Worker Functionality for multiple user", () => {
    cy.get('.personal-info-content__title').should('be.visible')
    cy.readFile("cypress/fixtures/createdWorker.json").then(
      ({ lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${lastName}`);
          cy.get('.personal-info-content__title').eq(0).contains(lastName).should('be.visible')

      }
    );
    cy.get('.header-checkbox-container').eq(0).should('be.visible').find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Disable").click();
    cy.get(".sc-dhKdcB").contains("Are you sure you want to disable the selected worker(s) ?")
    .should("be.visible");
    cy.get("button p").contains("Confirm").click();
      cy.get('.sc-cRmqLi').each(($el, index) => {
        cy.wrap($el).click({ force: true });

        workforceSelector.AccessControl().click()
      
        cy.getWorkerField('Device').should('contain.text', '-');
      });
      ;
  });

  it("Verify warning message on disabling a disable user.", () => {
    cy.wait(3000);
    cy.readFile("cypress/fixtures/createdWorker.json").then(
      ({ firstName, lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${firstName} ${lastName}`);
      }
    );
    cy.wait(2000);

    cy.get(".sc-cRmqLi").eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Disable").click();
    cy.get("button p").contains("Confirm").click();
    cy.get(".sc-kOPcWz")
      .contains("Device not assigned to selected worker(s).")
      .should("be.visible");
  });

  it("Verify warning message on disabling a worker without any assigned device.", () => {
    cy.wait(3000);
    cy.readFile("cypress/fixtures/noEmailWorker.json").then(
      ({ firstName, lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${firstName} ${lastName}`);
      }
    );
    cy.wait(2000);

    cy.get(".sc-cRmqLi").eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Disable").click();
    cy.get("button p").contains("Confirm").click();
    cy.get(".sc-kOPcWz")
      .contains("Device not assigned to selected worker(s).")
      .should("be.visible");
  });

  it.skip("Validate worker download functionlity from the overflow menu", () => {
    const FILE_NAME = "Ontarget-Employee-Report.csv";
    const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
    const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);


    cy.intercept("POST", "/api/filterProjectWorker*").as("getWorkers");
    cy.wait("@getWorkers");

    cy.get("body").then(($body) => {
      if ($body.find(".personal-info-content__title").length > 0) {
        cy.get(".personal-info-content__title").last().scrollIntoView();
        cy.wait(2000);
      }
    });

    cy.get(".personal-info-content__title")
      .should("have.length.at.least", 1)
      .then(($els) => {
        const uiNames = [...$els]
          .map((el) => el.innerText.trim())
          .filter((name) => name !== "");

        cy.log(`Found ${uiNames.length} workers in UI`);
        uiNames.forEach((name, i) => cy.log(`UI Worker ${i + 1}: ${name}`));

        cy.task("deleteDownloadedFiles", {
          downloadsFolder: DOWNLOADS_FOLDER,
          pattern: "Ontarget-Employee-Report",
          extension: ".csv",
        });

        cy.intercept("POST", "/api/downloadworkers").as("downloadWorkers");
        cy.get(".sc-gFAWRd>.sc-aXZVg>button").click();
        cy.get(".dropdown-option").contains("Download").click();
        cy.wait("@downloadWorkers");

        cy.readFile(FILE_PATH, { timeout: 30000 }).then(() => {
          cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
            const csvNames = extractWorkerNamesFromCSV(rows);

            logComparisonResults(uiNames, csvNames);
            validateNamesMatch(uiNames, csvNames);
          });
        });
      });
  });

  function extractWorkerNamesFromCSV(rows) {
    const header = rows[1];
    const firstNameIndex = header.indexOf("First Name");
    const lastNameIndex = header.indexOf("Last Name");

    if (firstNameIndex === -1 || lastNameIndex === -1) {
      throw new Error("Required columns not found in CSV");
    }

    return rows
      .slice(2)
      .map((row) => {
        const firstName = row[firstNameIndex]?.toString().trim() || "";
        const lastName = row[lastNameIndex]?.toString().trim() || "";
        return [firstName, lastName].filter(Boolean).join(" ");
      })
      .filter((name) => name !== "");
  }

  function logComparisonResults(uiNames, csvNames) {
    csvNames.forEach((name, i) => cy.log(`CSV Worker ${i + 1}: ${name}`));
    cy.log(`UI Names: ${uiNames.length}, CSV Names: ${csvNames.length}`);

    uiNames.forEach((uiName) => {
      const found = csvNames.includes(uiName) ? "✓" : "✗";
      cy.log(`${found} ${uiName}`);
    });
  }

  function validateNamesMatch(uiNames, csvNames) {
    const missingInCSV = uiNames.filter((name) => !csvNames.includes(name));

    if (missingInCSV.length > 0) {
      cy.log(
        `❌ FAILED: ${missingInCSV.length} UI worker(s) not found in downloaded CSV`
      );
      missingInCSV.forEach((name) => cy.log(`  Missing: ${name}`));

      expect(
        missingInCSV,
        `These UI workers were not found in the CSV download: ${missingInCSV.join(
          ", "
        )}`
      ).to.be.empty;
    } else {
      cy.log(
        `✅ SUCCESS: All ${uiNames.length} UI workers found in CSV (CSV has ${csvNames.length} total workers)`
      );
    }
  }
  it("Verify workers data is downloaded based on applied search filter", () => {
    const FILE_NAME = "Ontarget-Employee-Report.csv";
    const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
    const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);
  
    cy.fixture("noEmailWorker.json").then(({ firstName, lastName }) => {
      const searchName = `${firstName} ${lastName}`;
  
      cy.get(workforceSelector.searchInput).clear().type(searchName);
      cy.wait(2000);
  
      cy.get(".personal-info-content__title")
        .should("have.length.at.least", 1)
        .then(($els) => {
          const uiNames = [...$els]
            .map((el) => el.innerText.trim())
            .filter((name) => name !== "");
  
          cy.task("deleteDownloadedFiles", {
            downloadsFolder: DOWNLOADS_FOLDER,
            pattern: "Ontarget-Employee-Report",
            extension: ".csv",
          });
  
          cy.intercept("POST", "/api/downloadworkers").as("downloadWorkers");
          cy.get(".sc-gFAWRd>.sc-aXZVg>button").click();
          cy.get(".dropdown-option").contains("Download").click();
          cy.wait("@downloadWorkers");
  
          cy.readFile(FILE_PATH, { timeout: 30000 }).then(() => {
            cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
              const csvNames = extractWorkerNamesFromCSV(rows);
  
              logComparisonResults(uiNames, csvNames);
              validateNamesMatch(uiNames, csvNames);
            });
          });
        });
    });
  });
  
  function extractWorkerNamesFromCSV(rows) {
    const header = rows[0];
    const firstNameIndex = header.indexOf("First Name");
    const lastNameIndex = header.indexOf("Last Name");
  
    if (firstNameIndex === -1 || lastNameIndex === -1) {
      throw new Error("Required columns not found in CSV");
    }
  
    return rows
      .slice(1)
      .map((row) => {
        const firstName = row[firstNameIndex]?.toString().trim() || "";
        const lastName = row[lastNameIndex]?.toString().trim() || "";
        return [firstName, lastName].filter(Boolean).join(" ");
      })
      .filter(Boolean);
  }
  
  function logComparisonResults(uiNames, csvNames) {
    csvNames.forEach((name, i) => cy.log(`CSV Worker ${i + 1}: ${name}`));
    cy.log(`UI Names: ${uiNames.length}, CSV Names: ${csvNames.length}`);
  
    uiNames.forEach((uiName) => {
      const found = csvNames.includes(uiName) ? "✓" : "✗";
      cy.log(`${found} ${uiName}`);
    });
  }
  
  function validateNamesMatch(uiNames, csvNames) {
    const missingInCSV = uiNames.filter((name) => !csvNames.includes(name));
  
    if (missingInCSV.length > 0) {
      cy.log(
        `❌ FAILED: ${missingInCSV.length} UI worker(s) not found in downloaded CSV`
      );
      missingInCSV.forEach((name) => cy.log(`  Missing: ${name}`));
  
      expect(
        missingInCSV,
        `These UI workers were not found in the CSV download: ${missingInCSV.join(
          ", "
        )}`
      ).to.be.empty;
    } else {
      cy.log(
        `✅ SUCCESS: All ${uiNames.length} UI workers found in CSV (CSV has ${csvNames.length} total workers)`
      );
    }
  }
  

  

  it("Verify filtered worker data is downloaded correctly", () => {
    const FILE_NAME = "Ontarget-Employee-Report.csv";
    const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
    const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);
  
    cy.get(".table-header-filter-btn").eq(2).click();
    cy.get('input[placeholder="Search"]').eq(1).type("tech");
    cy.get("p").contains("Filters:").click();
    cy.wait(1000);


   cy.get(".personal-info-content__title")
      .should("have.length.at.least", 1)
      .then(($els) => {
        const uiNames = [...$els]
          .map((el) => el.innerText.trim())
          .filter((name) => name !== "");

        cy.log(`Found ${uiNames.length} workers in UI`);
        uiNames.forEach((name, i) => cy.log(`UI Worker ${i + 1}: ${name}`));

        cy.task("deleteDownloadedFiles", {
          downloadsFolder: DOWNLOADS_FOLDER,
          pattern: "Ontarget-Employee-Report",
          extension: ".csv",
        });

        cy.intercept("POST", "/api/downloadworkers").as("downloadWorkers");
        cy.get(".sc-gFAWRd>.sc-aXZVg>button").click();
        cy.get(".dropdown-option").contains("Download").click();
        cy.wait("@downloadWorkers");

        cy.readFile(FILE_PATH, { timeout: 30000 }).then(() => {
          cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
            const csvNames = extractWorkerNamesFromCSV(rows);

            logComparisonResults(uiNames, csvNames);
            validateNamesMatch(uiNames, csvNames);
          });
        });
      });
  });

  function extractWorkerNamesFromCSV(rows) {
    const header = rows[1];
    const firstNameIndex = header.indexOf("First Name");
    const lastNameIndex = header.indexOf("Last Name");

    if (firstNameIndex === -1 || lastNameIndex === -1) {
      throw new Error("Required columns not found in CSV");
    }

    return rows
      .slice(2)
      .map((row) => {
        const firstName = row[firstNameIndex]?.toString().trim() || "";
        const lastName = row[lastNameIndex]?.toString().trim() || "";
        return [firstName, lastName].filter(Boolean).join(" ");
      })
      .filter((name) => name !== "");
  }

  function logComparisonResults(uiNames, csvNames) {
    csvNames.forEach((name, i) => cy.log(`CSV Worker ${i + 1}: ${name}`));
    cy.log(`UI Names: ${uiNames.length}, CSV Names: ${csvNames.length}`);

    uiNames.forEach((uiName) => {
      const found = csvNames.includes(uiName) ? "✓" : "✗";
      cy.log(`${found} ${uiName}`);
    });
  }

  function validateNamesMatch(uiNames, csvNames) {
    const missingInCSV = uiNames.filter((name) => !csvNames.includes(name));

    if (missingInCSV.length > 0) {
      cy.log(
        `❌ FAILED: ${missingInCSV.length} UI worker(s) not found in downloaded CSV`
      );
      missingInCSV.forEach((name) => cy.log(`  Missing: ${name}`));

      expect(
        missingInCSV,
        `These UI workers were not found in the CSV download: ${missingInCSV.join(
          ", "
        )}`
      ).to.be.empty;
    } else {
      cy.log(
        `✅ SUCCESS: All ${uiNames.length} UI workers found in CSV (CSV has ${csvNames.length} total workers)`
      );
    }
  }

  it("Verify the deletion functionality for the selected user.", () => {
    cy.get('.personal-info-content__title').should('be.visible')
    cy.readFile("cypress/fixtures/createdWorker.json").then(
      ({ firstName, lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${lastName}`);
          cy.get('.personal-info-content__title').contains(lastName).should('be.visible')

      }
    );    
    cy.get('.header-checkbox-container').eq(0).should('be.visible').find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.get(".empty-body").should(
      "have.text",
      "No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters "
    );
  });


  it('Verify Cancel and X cancels the page.', ()=>{
    cy.get('.personal-info-content__title').should('be.visible')
    cy.readFile("cypress/fixtures/createdWorker.json").then(
      ({ firstName, lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${firstName} ${lastName}`);
      }
    );
    cy.get('.personal-info-content__title').should('be.visible')
    cy.get(".sc-cRmqLi").eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Change Value").click();
    cy.get('.sc-krNlru svg').click()
    cy.get(workforceSelector.overflowMenu).should('be.visible');
  })

});
