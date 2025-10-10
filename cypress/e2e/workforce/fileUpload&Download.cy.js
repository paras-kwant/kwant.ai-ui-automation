/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - file upload and download", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

 
it.only('Validating Uploading profile picture functionality', () => {
  cy.visit('/projects/94049707/workers');
  cy.get('.personal-info-content__title').eq(0).click();
  cy.wait(3000)
  
  cy.get('.upload-avatar').scrollIntoView().then(($avatarContainer) => {
    
    if ($avatarContainer.find('img').length > 0) {
      console.log('Profile image exists');
      
      cy.get('.upload-avatar img').then(($img) => {
        const initialSrc = $img.attr('src');
        console.log('Initial Image Src:', initialSrc);

        cy.get(workforceSelector.profileImageUploadButton)
          .scrollIntoView()
          .should('be.visible')
          .click();
          
        cy.get('.upload-button__upload-options__option').eq(0).click();
        cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
        
        cy.get(workforceSelector.updateButton).scrollIntoView().click();
        cy.get('.sc-kOPcWz').contains('Successfully updated employee.').should('be.visible');
        cy.get('.upload-avatar').scrollIntoView()
        cy.wait(3000)
        cy.get('.upload-avatar img').should('be.visible').then(($updatedImg) => {
          const finalSrc = $updatedImg.attr('src');
          console.log('Final Image Src:', finalSrc);
          expect(finalSrc).to.not.equal(initialSrc);
        });
      });
      
    } else {
      console.log('No profile image, proceeding to upload');
      cy.get('.upload-avatar').scrollIntoView()
      cy.get(workforceSelector.profileImageUploadButton)
      .scrollIntoView()
      .should('be.visible')
      .click();
      cy.get('.upload-button__upload-options__option').eq(0).click();
      cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
      cy.get('.upload-avatar').scrollIntoView()
      cy.get(workforceSelector.updateButton).click();
      cy.get('.sc-kOPcWz').contains('Successfully updated employee.').should('be.visible');
      cy.get('.upload-avatar img').should('be.visible');
    }
  });
});


it('Vaidate adding a worker by uploading .csv file', () => {
  cy.visit('/projects/94049707/workers');
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  cy.fixture('employeeUpload.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'employeeUpload.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });
  cy.get('.sc-kOPcWz').should('contain.text', '1 worker(s) will be added.')
  cy.get(workforceSelector.submitButton).click();
  cy.get('.personal-info-content__title').first().should('contain.text', 'Automation Test');
  cy.get('.drawer_title>p').click()

})

it('Validate downloading the template file', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  const fileName = 'Ontarget-employee-upload-template.csv';

  cy.visit('/projects/94049707/workers');
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();
  cy.get('.drawer_title>p').click();

  // wait for the file to download
  cy.readFile(`${downloadsFolder}/${fileName}`, { timeout: 15000 })
    .should('exist')
    .then((content) => {
      // List of expected headers
      const expectedHeaders = [
        "S.No.",
        "First Name",
        "Last Name",
        "Company Name",
        "Title",
        "Cost Code",
        "Instance Id",
        "MAC",
        "Instance Type",
        "Crew",
        "Union",
        "Phone ",
        "Email",
        "Race ",
        "Sex",
        "MWBE",
        "RFID/ NFC",
        "$/MH",
        "Employee Id",
        "Last Seen Location",
        "Last Seen Time",
        "Battery level",
        "Project Code"
      ];

      // Assert that each header exists in the CSV content
      expectedHeaders.forEach(header => {
        expect(content).to.contain(header);
      });
    });
});


  

  it("Validate worker download matches UI", () => {
    const FILE_NAME = 'Ontarget-Employee-Report.csv';
    const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
    const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);

    cy.visit('/projects/94049707/workers');
    cy.wait(10000);
  
    cy.get('.personal-info-content__title').then(($els) => {
      const uiNames = [...$els].map(el => el.innerText.trim());
      uiNames.forEach((name, i) => cy.log(`UI Worker ${i + 1}: ${name}`));

      cy.wait(20000)
      cy.task("deleteDownloadedFiles", {
        downloadsFolder: DOWNLOADS_FOLDER,
        pattern: "Ontarget-Employee-Report",
        extension: ".csv"
      });
  
      cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
      cy.get('.dropdown-option').contains('Download').click();
  
      cy.readFile(FILE_PATH, { timeout: 30000 }).then(() => {
        cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
          const csvNames = extractWorkerNamesFromCSV(rows);
          
          logComparisonResults(uiNames, csvNames);
          validateNamesMatch(uiNames, csvNames);
        });
      });
    });
  });
  
  // Helper functions
  function extractWorkerNamesFromCSV(rows) {
    const header = rows[1];
    const firstNameIndex = header.indexOf("First Name");
    const lastNameIndex = header.indexOf("Last Name");
  
    if (firstNameIndex === -1 || lastNameIndex === -1) {
      throw new Error("Required columns not found in CSV");
    }
  
    return rows.slice(2)
      .map(row => {
        const firstName = row[firstNameIndex]?.toString().trim() || "";
        const lastName = row[lastNameIndex]?.toString().trim() || "";
        return [firstName, lastName].filter(Boolean).join(" ");
      })
      .filter(name => name !== "");
  }
  
  function logComparisonResults(uiNames, csvNames) {
    csvNames.forEach((name, i) => cy.log(`CSV Worker ${i + 1}: ${name}`));
    cy.log(`UI Names: ${uiNames.length}, CSV Names: ${csvNames.length}`);

    
  
    uiNames.forEach(uiName => {
      const found = csvNames.includes(uiName) ? "✓" : "✗";
      cy.log(`${found} ${uiName}`);
    });
  }
  
  function validateNamesMatch(uiNames, csvNames) {
    const missingNames = uiNames.filter(name => !csvNames.includes(name));
    
    if (missingNames.length > 0) {
      expect(missingNames.length).to.equal(0, 
        `UI names not found in CSV: ${missingNames.join(', ')}`
      );
    }
  }

  

  
})