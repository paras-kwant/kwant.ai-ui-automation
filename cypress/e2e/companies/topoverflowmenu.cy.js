/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector.js";
import workerHelper from "../../support/helper/workerHelper.js";
import companiesHelper from "../../support/helper/companiesHelper.js";
import { generateCompanyData } from "../../fixtures/workerData.js";

describe("Companies - overflow menu", () => {
  let authHeaders = {};

  before(() => {
	cy.viewport(1440, 900);
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/projectConfigs', (req) => {
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project']
      };
    }).as('getConfig');
    
    companiesHelper.visitCompaniesPage();
    cy.wait('@getConfig');

    // Clear search if present
    cy.get("body").then(($body) => {
      if($body.find(workforceSelector.searchInput).length > 0){
        cy.get(workforceSelector.searchInput).clear();
      }
    });

    // Clear filters if present
    cy.get("body").then(($body) => {
      if ($body.find(".filter-tag svg").length > 0) {
        cy.get(".filter-tag svg")
          .should("be.visible")
          .click({ force: true });
      }
    });
    
    cy.url().should("include", "/companies");
    cy.get(workforceSelector.tableRow, { timeout: 10000 }).should("exist");
  });

  // Helper function to create company with retry logic
  const createCompany = (payload, retries = 2) => {
    return cy.request({
      method: "POST",
      url: "/api/projectTaskTrades",
      headers: authHeaders,
      body: payload,
      failOnStatusCode: false,
      timeout: 30000
    }).then((res) => {
      if (res.status === 500 && retries > 0) {
        cy.log(`Got 500 error, retrying... (${retries} retries left)`);
        cy.wait(2000); // Wait before retry
        return createCompany(payload, retries - 1);
      }
      
      if (![200, 201].includes(res.status)) {
        cy.log(`API Error: ${res.status} - ${JSON.stringify(res.body)}`);
        throw new Error(`Failed to create company: ${res.status}`);
      }
      
      return res;
    });
  };

  it('should show the overflow option when no worker is selected', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").should("not.exist");
    cy.contains(".dropdown-option", "Merge").should("not.exist");
    cy.contains(".dropdown-option", "Download").should('be.visible');
    cy.contains(".dropdown-option", "Upload").should('be.visible');
  });

  it("Should cancel deletion when Cancel is clicked", () => {
    let companyName;
    cy.get(workforceSelector.tableRow).should('be.visible');
    cy.get(".personal-info-content__title").first().then(($row) => {
      companyName = $row.text().trim();
      cy.log(companyName);
      
      cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
      cy.get(workforceSelector.overflowMenu).click();
      cy.contains(".dropdown-option", "Delete").click();
      cy.get("button p").contains("Cancel").click();
      cy.get(".sc-eBHhsj.eOSUyE").should("not.exist");
      cy.get(".personal-info-content__title").first().should("contain.text", companyName);
    });
  });

  it("Should not delete a company which has workers, then cleanup", () => {
    const companyName = `deleteTestWithWorkers_${Date.now()}`;
  
    createCompany({
      name: companyName,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: `S.No.,First Name,Last Name,Title,Cost Code,Instance Id,MAC,Instance Type,Crew,Union,Phone ,Email,Race ,Sex,MWBE,RFID/ NFC,$/MH,Employee Id,Last Seen Location,Last Seen Time,Battery level,Project Code
,Kumar,chandra,,,,,,,,,,,,,,,,,,,`
    });
    
    // Wait for worker processing
    cy.wait(3000);
    
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(companyName);
    cy.get(workforceSelector.tableRow, { timeout: 10000 }).should('contain.text', companyName);
    
    cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    
    cy.get(workforceSelector.toastMessage).contains("Companies with associated workers cannot be deleted.");
    
    cy.contains(workforceSelector.tableRow, companyName)
      .should('be.visible')
      .click({ force: true });
    
    cy.get(workforceSelector.companyWorkerPage).click();
    cy.get('.details p').contains('Total Workers').should('be.visible');
    cy.get('[label="view"]').eq(0).click();
    
    cy.get(workforceSelector.tableRow, { timeout: 10000 }).should('be.visible');
    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });
    
    cy.intercept('POST', '/api/worker/bulkdelete').as('deleteWorkers');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteWorkers', { timeout: 10000 });
    cy.wait(1000);
    
    cy.visit('https://uat.kwant.ai/projects/500526306/companies');
    cy.url().should("include", "/500526306/companies");
    cy.get(workforceSelector.searchInput).clear().type(companyName);
    cy.contains(workforceSelector.tableRow, companyName, { timeout: 10000 }).should('be.visible');
    
    cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
    
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompany', { timeout: 10000 });
    
    cy.get(workforceSelector.toastMessage).contains("successfully deleted");
  });

  it("Should delete company successfully with no workers", () => {
    const companyName = `deleteCompanyNoWorker_${Date.now()}`;
    
    createCompany({
      name: companyName,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });

    cy.wait(1000);
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(companyName);
    cy.get(workforceSelector.tableRow, { timeout: 10000 })
      .contains(companyName)
      .should('be.visible');

    cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
    
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompany', { timeout: 10000 });
    
    cy.get(workforceSelector.toastMessage).contains("successfully deleted");
  });

  it("Should delete multiple companies successfully without workers", () => {
    const timestamp = Date.now();
    const companyBaseName = "bulkDeleteTest";
    
    // Create first company
    createCompany({
      name: `${companyBaseName}_${timestamp}_1`,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });
    
    cy.wait(1000);
    
    // Create second company
    createCompany({
      name: `${companyBaseName}_${timestamp}_2`,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });
    
    cy.wait(1000);
    
    // Create third company
    createCompany({
      name: `${companyBaseName}_${timestamp}_3`,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });

    cy.wait(1000);
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(`${companyBaseName}_${timestamp}`);
    cy.get(workforceSelector.tableRow, { timeout: 10000 })
      .contains(`${companyBaseName}_${timestamp}`)
      .should('be.visible');

    // Wait for all companies to load
    cy.get(workforceSelector.tableRow).should('have.length.at.least', 3);

    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });

    cy.intercept('POST', '/api/companies/delete').as('deleteCompanies');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompanies', { timeout: 10000 });
    
    cy.get(workforceSelector.toastMessage).contains("successfully deleted");
  });

  it("Should merge companies with no workers successfully", () => {
    const timestamp = Date.now();
    const company1Name = `mergeNoWorkerTest_${timestamp}_1`;
    const company2Name = `mergeNoWorkerTest_${timestamp}_2`;
    
    // Create first company
    createCompany({
      name: company1Name,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });
    
    cy.wait(1000);
    
    // Create second company
    createCompany({
      name: company2Name,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: null
    });

    cy.wait(1000);
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(`mergeNoWorkerTest_${timestamp}`);
    cy.get(workforceSelector.tableRow, { timeout: 10000 })
      .contains(`mergeNoWorkerTest_${timestamp}`)
      .should('be.visible');

    // Wait for both companies
    cy.get(workforceSelector.tableRow).should('have.length.at.least', 2);

    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });

    cy.intercept('POST', '/api/projectTaskTrades/merge*').as('mergeCompanies');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Merge Companies")
      .should("be.visible")
      .click();

    cy.get('[placeholder="Select the Company"]')
      .click()
      .type(company1Name);

    cy.contains('[role="button"]', company1Name).click();
    cy.get("button p").contains("Merge").click();
    cy.wait('@mergeCompanies', { timeout: 15000 });

    cy.get(workforceSelector.toastMessage).contains("Companies merged successfully!");

    // Verify merge
    cy.wait(1000);
    cy.get(workforceSelector.searchInput).clear().type(`mergeNoWorkerTest_${timestamp}`);
    cy.contains(workforceSelector.tableRow, company2Name).should('not.exist');
    cy.contains(workforceSelector.tableRow, company1Name).should('be.visible');
    
    // Cleanup
    cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
    
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompany', { timeout: 10000 });
    
    cy.get(workforceSelector.toastMessage).contains("successfully deleted");
  });

  it("Should merge 3 companies with workers and validate all workers are present", () => {
    const timestamp = Date.now();
    const company1Name = `merge3WorkerTest_${timestamp}_1`;
    const company2Name = `merge3WorkerTest_${timestamp}_2`;
    const company3Name = `merge3WorkerTest_${timestamp}_3`;
    
    // Create first company with workers
    createCompany({
      name: company1Name,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: `S.No.,First Name,Last Name,Title,Cost Code,Instance Id,MAC,Instance Type,Crew,Union,Phone ,Email,Race ,Sex,MWBE,RFID/ NFC,$/MH,Employee Id,Last Seen Location,Last Seen Time,Battery level,Project Code
,Kumar,Chandra,,,,,,,,,,,,,,,,,,,
,Ram,Sharma,,,,,,,,,,,,,,,,,,,`
    });

    cy.wait(3000); // Wait for worker processing

    createCompany({
      name: company2Name,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: `S.No.,First Name,Last Name,Title,Cost Code,Instance Id,MAC,Instance Type,Crew,Union,Phone ,Email,Race ,Sex,MWBE,RFID/ NFC,$/MH,Employee Id,Last Seen Location,Last Seen Time,Battery level,Project Code
,Sita,Devi,,,,,,,,,,,,,,,,,,,
,Gita,Kumari,,,,,,,,,,,,,,,,,,,`
    });

    cy.wait(3000); // Wait for worker processing

    // Create third company with workers
    createCompany({
      name: company3Name,
      projectId: "500526306",
      projectManagerId: null,
      projectManagerName: null,
      projectTaskCategoryId: null,
      projectTaskCategoryName: null,
      safetyManagerId: null,
      safetyManagerName: null,
      uploadWorkers: `S.No.,First Name,Last Name,Title,Cost Code,Instance Id,MAC,Instance Type,Crew,Union,Phone ,Email,Race ,Sex,MWBE,RFID/ NFC,$/MH,Employee Id,Last Seen Location,Last Seen Time,Battery level,Project Code
,Rita,Rani,,,,,,,,,,,,,,,,,,,
,Mohan,Das,,,,,,,,,,,,,,,,,,,`
    });

    cy.wait(3000); // Wait for worker processing
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(`merge3WorkerTest_${timestamp}`);
    cy.get(workforceSelector.tableRow, { timeout: 15000 })
      .contains(`merge3WorkerTest_${timestamp}`)
      .should('be.visible');

    // Wait for all companies
    cy.get(workforceSelector.tableRow).should('have.length.at.least', 3);

    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });

    cy.intercept('POST', '/api/projectTaskTrades/merge*').as('mergeCompanies');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Merge Companies")
      .should("be.visible")
      .click();

    cy.get('[placeholder="Select the Company"]')
      .click()
      .type(company1Name);

    cy.contains('[role="button"]', company1Name).click();
    cy.get("button p").contains("Merge").click();
    cy.wait('@mergeCompanies', { timeout: 20000 });

    cy.get(workforceSelector.toastMessage).contains("Companies merged successfully!");

    // Verify merge
    cy.wait(2000);
    cy.reload();
    cy.get(workforceSelector.searchInput).clear().type(`merge3WorkerTest_${timestamp}`);
    cy.contains(workforceSelector.tableRow, company2Name).should('not.exist');
    cy.contains(workforceSelector.tableRow, company3Name).should('not.exist');
    cy.contains(workforceSelector.tableRow, company1Name)
      .should('be.visible')
      .click({ force: true });

    // Verify worker count
    cy.get(workforceSelector.companyWorkerPage).click();
    cy.get('.details p').contains('Total Workers').should('be.visible');
    cy.get('.details p').contains('6').should('be.visible');
    cy.get('[label="view"]').eq(0).click();

    // Verify all workers
    cy.get(workforceSelector.tableRow, { timeout: 10000 }).should('be.visible');
    cy.get(workforceSelector.tableRow).should('contain', 'Kumar Chandra');
    cy.get(workforceSelector.tableRow).should('contain', 'Ram Sharma');
    cy.get(workforceSelector.tableRow).should('contain', 'Sita Devi');
    cy.get(workforceSelector.tableRow).should('contain', 'Gita Kumari');
    cy.get(workforceSelector.tableRow).should('contain', 'Rita Rani');
    cy.get(workforceSelector.tableRow).should('contain', 'Mohan Das');

    // Cleanup: Delete workers
    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });
    
    cy.intercept('POST', '/api/worker/bulkdelete').as('deleteWorkers');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteWorkers', { timeout: 10000 });
    cy.wait(1000);
    
    // Cleanup: Delete company
    cy.visit('https://uat.kwant.ai/projects/500526306/companies');
    cy.url().should("include", "/500526306/companies");
    cy.get(workforceSelector.searchInput).clear().type(`merge3WorkerTest_${timestamp}`);
    cy.contains(workforceSelector.tableRow, company1Name, { timeout: 10000 }).should('be.visible');
    
    cy.get(workforceSelector.tableRow).first().find('[type="checkbox"]').check({ force: true });
    
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompany', { timeout: 10000 });

    cy.get(workforceSelector.toastMessage).contains("successfully deleted");
  });
});