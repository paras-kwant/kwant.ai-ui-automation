/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper';
import { generateWorkerData } from '../../fixtures/workerData.js';


describe("Worker Module - File Upload and Download", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.contains('.card-title', Cypress.env('PROJECT_NAME'), { timeout: 40000 })
  .should('be.visible')
  .click();
    });
    workerHelper.visitWorkersPage();

  });

  beforeEach(() => {
    cy.cleanUI()
  });

  it('Should add a worker by uploading a valid CSV file', () => {
   workerHelper.openUploadModal()
    workerHelper.uploadWorkerCSV('testdata/employeeUpload.csv');
    cy.get('[type="info"]').should('contain.text', '1 worker(s) will be added.');

  });


  it('Should download the worker CSV template successfully', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    const fileName = 'worker-upload-template.csv';

   workerHelper.openUploadModal()
    cy.get('p').contains('Worker Upload Template').click({force: true});
    cy.readFile(`${downloadsFolder}/${fileName}`, { timeout: 15000 })
      .should('exist')
      .then((content) => {
        const expectedHeaders = [
          "S.No.","First Name","Last Name","Company Name","Title","Cost Code",
          "Instance Id","MAC","Instance Type","Crew","Union","Phone ","Email",
          "Race ","Sex","MWBE","RFID/ NFC","$/MH","Employee Id",
          "Last Seen Location","Last Seen Time","Battery level","Project Code"
        ];

        expectedHeaders.forEach(header => {
          expect(content).to.contain(header);
        });
      });
  });

  it('Should verify downloaded worker CSV content matches UI worker list', () => {
    const FILE_NAME = 'Ontarget-Employee-Report.csv';
    const DOWNLOADS_FOLDER = Cypress.config("downloadsFolder");
    const FILE_PATH = path.join(DOWNLOADS_FOLDER, FILE_NAME);


    cy.get('.personal-info-content__title').then(($els) => {
      const uiNames = [...$els].map(el => el.innerText.trim());
      cy.log(`Found ${uiNames.length} workers in UI`);

      cy.task("deleteDownloadedFiles", {
        downloadsFolder: DOWNLOADS_FOLDER,
        pattern: "Ontarget-Employee-Report",
        extension: ".csv"
      });

      cy.get(workforceSelector.overflowMenu).click();
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

  it('Should verify downloaded CSV contains only the selected worker', () => {
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

      cy.get('.checkboxCheckmark').eq(0).click({ force: true });

      cy.get(workforceSelector.overflowMenu).click();
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

  it('Should add a worker via drag-and-drop CSV upload', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/employeeUpload.csv', 'base64').then(fileContent => {
      cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'employeeUpload.csv',
          mimeType: 'text/csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get('[type="info"]')
      .should('be.visible')
      .and('contain.text', '1 worker(s) will be added.');
      cy.get('button p').contains('Submit').click();
      cy.searchAndDeleteWorker('James', 'Anderson');
  });

  it('Should display message when uploading a CSV with no worker data', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('backup.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'EmptyCsv.csv',
          mimeType: 'text/csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get('[type="info"]')
      .should('be.visible')
      .and('contain.text', 'No content to upload.');
  });

  it('Should show error when uploading non-CSV or non-Excel file', () => {
    cy.get(workforceSelector.tableRow).should('be.visible')
    cy.wait(1000)
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('demo.pdf', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'demo.pdf',
          mimeType: 'pdf',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.toastMessage).contains('File type unsupported').should('be.visible');
  });

  it('Should show validation error for missing Company Name', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('noCompany.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'noCompany.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.toastMessage).contains('Company Name cannot be empty.').should('be.visible');
  });

  it('Should show validation error for missing First Name', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/noFirstName.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'noFirstName.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.toastMessage).contains('First Name or Last Name cannot be empty.').should('be.visible');
  });

  it('Should show validation error for missing Last Name', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/noLastName.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'noLastName.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.toastMessage).contains('First Name or Last Name cannot be empty.').should('be.visible');
  });

  it('Should show duplicate worker validation message for duplicate CSV data', () => {
    cy.wait(2000)
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/duplicateWorker.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'duplicateWorker.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.toastMessage)
      .contains('Duplicate worker(s) found. 1 record(s) will not be uploaded.')
      .should('be.visible');
  });

  it('Should detect and show invalid phone number message from CSV upload', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/invalidPhoneNumber.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'invalidPhoneNumber.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get('[type="info"]')
      .should('be.visible')
      .and('contain.text', '1 Invalid Phone Number');
  });

  it('Should upload CSV with invalid fields and validate profile fallback values', () => {
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/invalidFields.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'invalidFields.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get(workforceSelector.submitButton).click();
    cy.get('input[placeholder="Search"]').clear().type('parass');
    cy.wait(2000)
    cy.get(workforceSelector.tableRow).eq(0).click({force: true});
    cy.get(workforceSelector.personalDetailsPage).click();
    cy.getWorkerField('Phone').contains('-');
    cy.getWorkerField('Sex').contains('-');
    cy.getWorkerField('Race').contains('-');
    cy.getWorkerField('MWBE').contains('-');
    cy.get('button p').contains('Cancel').click();
    cy.get(workforceSelector.tableRow).eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
  });


  it('Should  showw - while the project code is invalid', () => {
    cy.wait(2000)
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/projectcode.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'projectcode.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });
    cy.get(workforceSelector.submitButton).click();
    cy.get('input[placeholder="Search"]').clear().type('James anderson112');
    cy.wait(2000)
    cy.get(workforceSelector.tableRow).eq(0).click({force: true});
    cy.get(workforceSelector.jobDetailsPage).click();
    cy.getWorkerField('Project Code').contains('-');
  
  });


  it('submiting device with instance id and with out mac id', () => {
    cy.wait(2000)
    cy.get(workforceSelector.overflowMenu).click();
    cy.get('.dropdown-option').contains('Upload').click();

    cy.fixture('testdata/nomacid.csv', 'base64').then(fileContent => {
       cy.contains('button', 'Choose File').attachFile(
        {
          fileContent,
          fileName: 'nomacid.csv',
          mimeType: 'csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });
    cy.get(workforceSelector.toastMessage).contains('MAC cannot be empty.')
  });


  it('Uploading device without first name, last name and company', () => {

    const generateInstanceId = () => {
      const chars = '0123456789abcdefghijklmnopqrstu';
      return Array.from({ length: 10 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
  
    const generateMacId = () => {
      const chars = 'WXYZ';
      return Array.from({ length: 7 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
  
    const instanceId = generateInstanceId();
    const macId = generateMacId();
  
    // Open Upload modal
    cy.get(workforceSelector.overflowMenu)
      .should('be.visible')
      .click();
  
    cy.get('.dropdown-option')
      .contains('Upload')
      .click();
  
    cy.readFile('cypress/fixtures/testdata/validintancemacid.csv').then((content) => {
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const data = lines[1].split(',');
  
      const firstNameIndex = headers.findIndex(h => h.trim() === 'First Name');
      const lastNameIndex = headers.findIndex(h => h.trim() === 'Last Name');
      const companyIndex = headers.findIndex(h => h.trim() === 'Company Name');
      const instanceIdIndex = headers.findIndex(h => h.trim() === 'Instance Id');
      const macIndex = headers.findIndex(h => h.trim() === 'MAC');
  
      if (firstNameIndex !== -1) data[firstNameIndex] = '';
      if (lastNameIndex !== -1) data[lastNameIndex] = '';
      if (companyIndex !== -1) data[companyIndex] = '';
      if (instanceIdIndex !== -1) data[instanceIdIndex] = instanceId;
      if (macIndex !== -1) data[macIndex] = macId;
  
      const updatedCsv = [lines[0], data.join(',')].join('\n');
      cy.writeFile('cypress/fixtures/testdata/validintancemacid.csv', updatedCsv);
    });
  
     cy.contains('button', 'Choose File').attachFile(
      {
        filePath: 'testdata/validintancemacid.csv',
        mimeType: 'text/csv'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
    cy.get('[type="info"]')
      .contains('1 Beacon will be imported.').should('be.visible')
      cy.get('button p').contains('Submit').click();
  
    cy.wait(3000);
    cy.contains(workforceSelector.tableColumn, 'Device')
    .scrollIntoView()
  .find('.table-header-filter-btn svg')
  .click();

    cy.get('[placeholder="Search"]').eq(1).click().type(macId)
    cy.get('label[for^=":r"]').contains(macId).should('be.visible');

  });
  

  it('Uploading device with worker so that it gets assigned', () => {
    const workerData = generateWorkerData();

    const generateInstanceId = () => {
      const chars = '0123456789abcdefghijklmnopqrstu';
      return Array.from({ length: 10 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
  

    const generateMacId = () => {
      const chars = 'WXYZ'; 
      return Array.from({ length: 7 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
  
    const instanceId = generateInstanceId();
    const macId = generateMacId();
  
    cy.get(workforceSelector.overflowMenu)
      .should('be.visible')
      .click();
  
    cy.get('.dropdown-option')
      .contains('Upload')
      .click();
  
      cy.readFile('cypress/fixtures/testdata/validintancemacid.csv').then((content) => {
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        const data = lines[1].split(',');
      
        const firstNameIndex = headers.findIndex(h => h.trim() === 'First Name');
        const lastNameIndex = headers.findIndex(h => h.trim() === 'Last Name');
        const companyIndex = headers.findIndex(h => h.trim() === 'Company Name');
        const instanceIdIndex = headers.findIndex(h => h.trim() === 'Instance Id');
        const macIndex = headers.findIndex(h => h.trim() === 'MAC');
      
        if (firstNameIndex !== -1) data[firstNameIndex] = workerData.firstName;
        if (lastNameIndex !== -1) data[lastNameIndex] = workerData.lastName;
        if (companyIndex !== -1) data[companyIndex] = 'ACI';
        if (instanceIdIndex !== -1) data[instanceIdIndex] = instanceId;
        if (macIndex !== -1) data[macIndex] = macId;
      
        cy.writeFile(
          'cypress/fixtures/testdata/validintancemacid.csv',
          `${lines[0]}\n${data.join(',')}`
        );
      });
      
      

     cy.contains('button', 'Choose File').attachFile(
      {
        filePath: 'testdata/validintancemacid.csv',
        mimeType: 'text/csv'
      },
      { subjectType: 'drag-n-drop', force: true }
    );

    cy.get('[type="info"]').contains('1 Beacon will be imported.').should('be.visible');
    cy.wait(5000)
    cy.get('button p').contains('Submit').click();
    cy.get(workforceSelector.tableRow).should('be.visible')
    cy.get('input[placeholder="Search"]').clear().type(`${workerData.firstName} ${workerData.lastName}`);
    cy.wait(2000)
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.accessControlPage).click();
    cy.getWorkerField('Device').should('contain.text', macId);
    cy.get(workforceSelector.personalDetailsPage).click();

    cy.get('button p').contains('Cancel').click();
  cy.get(workforceSelector.tableRow).each(($row) => {
    cy.wrap($row).find('[type="checkbox"]').check({ force: true });
  });
    cy.get(workforceSelector.overflowMenu).click();
  cy.contains(".dropdown-option", "Delete").click();
  cy.get("button p").contains("Delete").click();

  });


  it('Uploading device with already exist ids', () => {

    cy.get(workforceSelector.overflowMenu).should('be.visible').click();
    cy.get('.dropdown-option').contains('Upload').click();

  
     cy.contains('button', 'Choose File').attachFile(
      { filePath: 'testdata/validintancemacid.csv', mimeType: 'text/csv' },
      { subjectType: 'drag-n-drop', force: true }
    );
  
    cy.get(workforceSelector.toastMessage).contains('1 Beacon(s) already exist.').should('be.visible');

  });

  it('Uploading device with EMPTY instance id should fail validation', () => {

    const instanceId = '';
  
    const generateMacId = () => {
      const chars = 'WXYZ';
      return Array.from({ length: 7 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
  
    const macId = generateMacId();
  
    // Open Upload modal
    cy.get(workforceSelector.overflowMenu)
      .should('be.visible')
      .click();
  
    cy.get('.dropdown-option')
      .contains('Upload')
      .click();
  
    // Update CSV with EMPTY instance id
    cy.readFile('cypress/fixtures/testdata/validintancemacid.csv').then((content) => {
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const data = lines[1].split(',');
  
      const instanceIdIndex = headers.findIndex(h => h.trim() === 'Instance Id');
      const macIndex = headers.findIndex(h => h.trim() === 'MAC');
  
      if (instanceIdIndex !== -1) data[instanceIdIndex] = instanceId; // EMPTY
      if (macIndex !== -1) data[macIndex] = macId;
  
      const updatedCsv = [lines[0], data.join(',')].join('\n');
      cy.writeFile('cypress/fixtures/testdata/validintancemacid.csv', updatedCsv);
    });
  
   
     cy.contains('button', 'Choose File').attachFile(
      {
        filePath: 'testdata/validintancemacid.csv',
        mimeType: 'text/csv'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  
    cy.get('[type="info"]')
      .contains('1 Beacon will be imported.')
      .should('not.exist');
  
    cy.wait(3000);
    cy.get('button p').contains('Submit').click({ force: true });
  cy.get(workforceSelector.tableRow).should('be.visible')
  cy.wait(3000);
  cy.contains(workforceSelector.tableColumn, 'Device')
  .scrollIntoView()
  .find('.table-header-filter-btn svg')
  .click();

  cy.get('[placeholder="Search"]').eq(1).click().type(macId)
  cy.get('.sc-eldPxv').contains(macId).should('not.exist');
  });
  
it('Should upload CSV, verify worker details, and delete the entry ', () => {
  cy.get(workforceSelector.overflowMenu).click();
  cy.get('.dropdown-option').contains('Upload').click();

  cy.fixture('testdata/fulldata.csv', 'base64').then(fileContent => {
     cy.contains('button', 'Choose File').attachFile(
      {
        fileContent,
        fileName: 'fulldata.csv',
        mimeType: 'csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

  cy.get(workforceSelector.submitButton).click();
  cy.get('input[placeholder="Search"]').clear().type('james fullAnderson');
  cy.wait(2000)
  cy.get(workforceSelector.tableRow).eq(0).click({force: true});
  cy.get(workforceSelector.personalDetailsPage).click();
  cy.getWorkerField('Email').contains('jamesanderson@gmail.com');
  cy.getWorkerField('Phone').contains('986-8757379');  
  cy.getWorkerField('Sex').contains('Male');
  cy.getWorkerField('Race').contains('American Indian or Alaska Native');
  cy.getWorkerField('MWBE').contains('Non MWBE');

  cy.get('button p').contains('Cancel').click();
  cy.get(workforceSelector.tableRow).each(($row) => {
    cy.wrap($row).find('[type="checkbox"]').check({ force: true });
  });
    cy.get(workforceSelector.overflowMenu).click();
  cy.contains(".dropdown-option", "Delete").click();
  cy.get("button p").contains("Delete").click();
});
})



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
  cy.log(`CSV Workers: ${csvNames.length}`);
  cy.log(`UI Workers: ${uiNames.length}`);
  
  const missingInCsv = uiNames.filter(name => !csvNames.includes(name));
  const extraInCsv = csvNames.filter(name => !uiNames.includes(name));
  
  if (missingInCsv.length > 0) {
    cy.log(`❌ Missing in CSV: ${missingInCsv.length} workers`);
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
    console.log('Missing workers:', missingNames);
    
    expect(missingNames.length).to.equal(0, 
      `${missingNames.length} UI names not found in CSV. Check console for full list.`
    );
  }
  
}
