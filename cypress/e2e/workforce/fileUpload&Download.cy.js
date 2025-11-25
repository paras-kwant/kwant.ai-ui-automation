/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  


Cypress.Commands.add("closeUploadDownloadDrawerIfOpen", () => {
  cy.get("body").then(($body) => {
    if ($body.find(".sc-krNlru svg").length > 0) {
      cy.get(".sc-krNlru svg")
        .should("be.visible")
        .click({ force: true });

      // Wait until drawer overlay disappears fully
      cy.get(".sc-zmges", { timeout: 10000 }).should("not.exist");
    }
  });
});




describe("Worker Module - file upload and download", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });

  beforeEach(() => {
    cy.closeUploadDownloadDrawerIfOpen();
  });




it('Vaidate adding a worker by uploading .csv file', () => {
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  cy.fixture('uploadFiles/employeeUpload.csv', 'base64').then(fileContent => {
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
  cy.get('.sc-kOPcWz').should('contain.textt', '1 worker(s) will be added.')

})

it('Validate downloading the template file', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  const fileName = 'Ontarget-employee-upload-template.csv';

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


  

it('Validate worker download matches UI', () => {
  const FILE_NAME = 'Ontarget-Employee-Report.csv';
  const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
  const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);

  cy.wait(10000);

  cy.get('.personal-info-content__title').then(($els) => {
    const uiNames = [...$els].map(el => el.innerText.trim());
    
    // Only log summary, not individual names
    cy.log(`Found ${uiNames.length} workers in UI`);

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
  // Only log summary statistics
  cy.log(`CSV Workers: ${csvNames.length}`);
  cy.log(`UI Workers: ${uiNames.length}`);
  
  const missingInCsv = uiNames.filter(name => !csvNames.includes(name));
  const extraInCsv = csvNames.filter(name => !uiNames.includes(name));
  
  if (missingInCsv.length > 0) {
    cy.log(`❌ Missing in CSV: ${missingInCsv.length} workers`);
    // Only log first 10 missing names
    cy.log(`First missing: ${missingInCsv.slice(0, 10).join(', ')}${missingInCsv.length > 10 ? '...' : ''}`);
  } else {
    cy.log(`✅ All UI workers found in CSV`);
  }
  
  if (extraInCsv.length > 0) {
    cy.log(`ℹ️ Extra in CSV: ${extraInCsv.length} workers`);
  }
}

function validateNamesMatch(uiNames, csvNames) {
  const missingNames = uiNames.filter(name => !csvNames.includes(name));
  
  if (missingNames.length > 0) {
    // Log to console for debugging (not Cypress log)
    console.log('Missing workers:', missingNames);
    
    expect(missingNames.length).to.equal(0, 
      `${missingNames.length} UI names not found in CSV. Check console for full list.`
    );
  }
}

  

it('Validate CSV contains only the selected worker', () => {
  const FILE_NAME = 'Ontarget-Employee-Report.csv';
  const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
  const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);

  cy.wait(5000);

  cy.get('.personal-info-content__title').then(($els) => {
    const firstWorker = $els[0].innerText.trim();
    cy.log(`Selected worker: ${firstWorker}`);

    cy.task("deleteDownloadedFiles", {
      downloadsFolder: DOWNLOADS_FOLDER,
      pattern: "Ontarget-Employee-Report",
      extension: ".csv"
    });

    // ✅ Select only the first worker
    cy.get('.checkboxCheckmark').eq(0).click({ force: true });

    // Download CSV
    cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
    cy.get('.dropdown-option').contains('Download').click();

    cy.readFile(FILE_PATH, { timeout: 30000 }).should('exist').then(() => {
      cy.task("parseExcel", { filePath: FILE_PATH }).then((rows) => {
        const csvNames = extractWorkerNamesFromCSV(rows);

        const normalize = str => str.toLowerCase().trim();
        const normalizedCsv = csvNames.map(normalize);

        expect(normalizedCsv.length).to.equal(1);
        expect(normalizedCsv[0]).to.equal(firstWorker.toLowerCase());
      });
    });
  });
});

it('Validate adding a worker by drag-and-dropping .csv file', () => {

  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload CSV via drag and drop
  cy.fixture('uploadFiles/employeeUpload.csv', 'base64').then(fileContent => {
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

  cy.get('.sc-kOPcWz')
    .should('be.visible')
    .and('contain.text', '1 worker(s) will be added.');
});




it('Validate adding .csv file with no worker', () => {
  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('backup.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'EmptyCsv.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

  cy.get('.sc-kOPcWz')
    .should('be.visible')
    .and('contain.text', 'No content to upload.'); // update text for empty CSV
});

it('Validate adding worker by uploading  file with other than csv or excel', () => {


  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click({force: true});
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('demo.pdf', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'demo.pdf',
        mimeType: 'pdf',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

workforceSelector.toastMessage().contains('File type unsupported').should('be.visible')
});

it('Empty company name', () => {


  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('noCompany.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'noCompany.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

workforceSelector.toastMessage().contains('Company Name cannot be empty.').should('be.visible')
});


it('Empty First Name', () => {


  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('uploadFiles/noFirstName.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'noFirstName.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

workforceSelector.toastMessage().contains('First Name or Last Name cannot be empty.').should('be.visible')
});


it('Empty last Name', () => {
  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('uploadFiles/noLastName.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'noLastName.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });
workforceSelector.toastMessage().contains('First Name or Last Name cannot be empty.').should('be.visible')
});

it('Duplicate worker data', () => {
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('uploadFiles/duplicateWorker.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'duplicateWorker.csv.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });
workforceSelector.toastMessage().contains('Duplicate worker(s) found. 1 record(s) will not be uploaded.').should('be.visible')
});

it('Invalid Phone Number', () => {

  // Open upload modal
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  // Upload empty CSV via drag-and-drop
  cy.fixture('uploadFiles/invalidPhoneNumber.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'invalidPhoneNumber.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

  cy.get('.sc-kOPcWz')
  .should('be.visible')
  .and('contain.text', '1 Invalid Phone Number');
});



it('Invalid field', () => {
  cy.get('.sc-gFAWRd>.sc-aXZVg>button').click();
  cy.get('.dropdown-option').contains('Upload').click();

  cy.fixture('uploadFiles/invalidSex.csv', 'base64').then(fileContent => {
    cy.get('.sc-ewBhFl').attachFile(
      {
        fileContent,
        fileName: 'invalidSex.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

  workforceSelector.submitButton().click();
  cy.get('input[placeholder="Search"]').clear().type('parass');
  cy.wait(2000)
 cy.get(workforceSelector.tableRow).eq(0).click({force: true});
  workforceSelector.personalDetails().click();
  cy.getWorkerField('Email').contains('-');
  cy.getWorkerField('Sex').contains('-');
  cy.getWorkerField('Race').contains('-');
  cy.getWorkerField('MWBE').contains('-');

  cy.get('button p').contains('Cancel').click();
  cy.get(".sc-cRmqLi").eq(0).find('[type="checkbox"]').check({ force: true });
  cy.get(workforceSelector.overflowMenu).click();
  cy.contains(".dropdown-option", "Delete").click();
  cy.get("button p").contains("Delete").click();
})
})