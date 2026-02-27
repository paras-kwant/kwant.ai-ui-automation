/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper';
import { generateWorkerData } from '../../fixtures/workerData.js';
import companiesHelper from '../../support/helper/companiesHelper.js';


describe("Company Module - File Upload", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.contains('.card-title', Cypress.env('PROJECT_NAME'), { timeout: 40000 })
        .should('be.visible')
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });
  
  beforeEach(() => {

    cy.cleanUI()
  });
  


  it('Should add a worker by uploading a valid CSV file', () => {
   workerHelper.openUploadModal()

   cy.fixture('testdata/companies/Company-upload-valid.csv', 'base64').then(fileContent => {
    cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'CompanyUpload.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });
  cy.wait(2000)
    cy.get('span').should('contain.text', '1 new company(s) will be imported.');
    cy.get('button p').contains('Submit').click({force:true})
    cy.searchAndDeleteWorker('Test', 'Company');

  });

  it('Verify the uploading of a blank template shows a message saying “No new company(s) will be imported.', ()=>{
    workerHelper.openUploadModal();

    cy.fixture('testdata/companies/Company-upload-empty.csv', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'Valid.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
      );
    });

    cy.get('span').should('contain.text', 'No Content to upload');

   })

  it('Should add a worker by uploading a valid xls file and validate in the table', () => {
    workerHelper.openUploadModal()
 
    cy.fixture('testdata/companies/Company-upload-template (1).xls', 'base64')
  .then(fileContent => {
    cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'CompanyUpload.xls',
        mimeType: 'application/vnd.ms-excel',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

     cy.get('span').should('contain.text', '1 new company(s) will be imported.');
     cy.get('button p').contains('Submit').click({force:true})
     cy.searchAndDeleteWorker('Test', 'Company');
 
   });


  it('Verify the X cancels the page', ()=>{
    cy.viewport(1440, 900); // laptop / full screen
    workerHelper.openUploadModal();
    cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
    cy.get('p').should('not.contain', 'Upload Companies')
  })

  it('Verify clicking outside the drawer page collapses the page', ()=>{
        workerHelper.openUploadModal();
        cy.get('body').click(0, 0); 
    
        cy.get('p').should('not.contain', 'Upload Companies');
    
  })



   it('Should add a worker by uploading a valid file and validate in the table and check the data entered', () => {
    workerHelper.openUploadModal()
 
    cy.fixture('testdata/companies/Company-upload-valid.csv', 'base64').then(fileContent => {
        cy.get(workforceSelector.dragAndDrop).attachFile(
          {
            fileContent,
            fileName: 'CompanyUpload.csv',
            mimeType: 'text/csv',
            encoding: 'base64'
          },
          { subjectType: 'drag-n-drop', force: true }
        );
      });

     cy.get('span').should('contain.text', '1 new company(s) will be imported.');
     cy.wait(1000)
     cy.get('button p').contains('Submit').click({force:true})
     cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
     cy.get(workforceSelector.searchInput).clear().type('Test Company');
     cy.get(workforceSelector.tableRow).should('contain.text', 'Test Company').click({force:true});
     cy.wait('@searchApi').its('response.statusCode').should('eq', 200);
    cy.getWorkerField('Company Name').contains('Test Company');
    cy.getWorkerField('Phone Number').contains('+9779868757379')
    cy.getWorkerField('E Mail').contains('paras@kwant.ai')
    cy.get('body').click(0,0)
    cy.searchAndDeleteWorker('Test', 'Company');
   });



it('Verify the delete icon is shown on the input box once the file is selected for upload',
  () => {


    workerHelper.openUploadModal();

    cy.fixture('testdata/companies/Company-upload-valid.csv', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
        {
          fileContent,
          fileName: 'CompanyUpload.csv',
          mimeType: 'text/csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });

  // earlier steps
cy.get('section span')
.contains('CompanyUpload.csv')
.as('fileName')
.should('be.visible');

cy.get('section button svg[fill="none"]')
.as('cancelButton')
.should('be.visible');

cy.get('@cancelButton').click({ force: true });

cy.get('section').contains('span', 'CompanyUpload.csv').should('not.exist');

  });


  it('Validate uploading a file with invalid email', ()=>{

    workerHelper.openUploadModal();

    cy.fixture('testdata/companies/Company-upload-invalidEmail.csv', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'CompanyUploadInvalidEmail.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
      );
    });



    cy.get('span').should('contain.text', 'No new company(s) will be imported.');

  })

  it('Duplicate company upload validation', ()=>{
    workerHelper.openUploadModal()
    cy.wait(1000)
   
    cy.fixture('testdata/companies/Company-upload-valid.csv', 'base64').then(fileContent => {
        cy.get(workforceSelector.dragAndDrop).attachFile(
          {
            fileContent,
            fileName: 'CompanyUpload.csv',
            mimeType: 'text/csv',
            encoding: 'base64'
          },
          { subjectType: 'drag-n-drop', force: true }
        );
      });
  
     cy.get('span').should('contain.text', '1 new company(s) will be imported.');
     cy.wait(1000)
     cy.get('button p').contains('Submit').click({force:true})
     cy.get(workforceSelector.toastMessage).contains('All companies added successfully').should('be.visible')
     cy.get('body').click()
  
    workerHelper.openUploadModal()
    cy.fixture('testdata/companies/Company-upload-valid.csv', 'base64').then(fileContent => {
        cy.get(workforceSelector.dragAndDrop).attachFile(
          {
            fileContent,
            fileName: 'CompanyUpload.csv',
            mimeType: 'text/csv',
            encoding: 'base64'
          },
          { subjectType: 'drag-n-drop', force: true }
        );
      });
     cy.get('span').should('contain.text', 'No new company(s) will be imported.');
     cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
     cy.searchAndDeleteWorker('Test', 'Company');
  })

  it('Validate uploading a file with invalid phone number', ()=>{

    workerHelper.openUploadModal();

    cy.fixture('testdata/companies/Company-upload-invalidNumber.csv', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'CompanyUploadInvalidEmail.csv',
        mimeType: 'text/csv',
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
      );
    });



    cy.get('span').should('contain.text', 'No new company(s) will be imported.');
  })

  it('Uploading file with duplicate companies in the file only one of them should get added', ()=>{
    workerHelper.openUploadModal()
    cy.fixture('testdata/companies/Company-upload-duplicateInFile.csv', 'base64').then(fileContent => {
        cy.get(workforceSelector.dragAndDrop).attachFile(
          {
            fileContent,
            fileName: 'CompanyUpload-duplicateInFile.csv',
            mimeType: 'text/csv',
            encoding: 'base64'
          },
          { subjectType: 'drag-n-drop', force: true }
        );
      })
      cy.get('span').should('contain.text', '1 new company(s) will be imported.').should('be.visible')
      cy.get('span').should('contain.text', '1 duplicate company(s) found and will not be imported.').should('be.visible')
  })


  it('upload file with multiple valid rows', ()=>{

    workerHelper.openUploadModal()
    cy.fixture('testdata/companies/Company-upload-multipleCompany.csv', 'base64').then(fileContent => {
        cy.get(workforceSelector.dragAndDrop).attachFile(
          {
            fileContent,
            fileName: 'CompanyUpload-multipleValidRows.csv',
            mimeType: 'text/csv',
            encoding: 'base64'
          },
          { subjectType: 'drag-n-drop', force: true }
        );
      })
      cy.get('span').should('contain.text', '2 new company(s) will be imported.').should('be.visible')
      cy.wait(1000)
      cy.get('button p').contains('Submit').click({force:true})
      cy.searchAndDeleteWorker('Test', 'Company1');
      cy.searchAndDeleteWorker('Test', 'Company2');
})

it('Should display an error message when trying to upload an invalid file', () => {
  workerHelper.openUploadModal();

  cy.fixture('testdata/companies/invalid.pdf', 'base64').then(fileContent => {
    cy.get(workforceSelector.dragAndDrop).attachFile(
      {
        fileContent,
        fileName: 'invalid.pdf', // Correct file name to match the invalid file
        mimeType: 'application/pdf', // Correct MIME type for a PDF file
        encoding: 'base64'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  });

  cy.get(workforceSelector.toastMessage).contains('File type unsupported')
    .should('be.visible');
});

})



