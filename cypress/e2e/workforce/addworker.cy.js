/// <reference types="cypress" />
const path = require("path");

const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Module - Add Worker Tests", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  it('Validate adding a worker with all fields filled', () => {
    const randomNum = Math.floor(Math.random() * 100000000);
    const firstName = `John${randomNum}`;
    const lastName = "Doe";
    
    cy.visit('/projects/94049707/workers');
    
    cy.get('button').contains('Add Worker').click(); 
    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    cy.get('input[name=firstName]').type(firstName);
    cy.get('input[name=lastName]').type(lastName);
    cy.get('input[name="company"]').type('Micron');
    cy.get('.sc-fhzFiK').click();
    // cy.get('input[name=address]').type('Kathmandu');
    // cy.wait(1000)
    // cy.get('input[name=zipCode]').type('44600');
    // cy.get('[name="drop_test"]').click();
    // cy.get('[role="button"]').contains('Drop').click();

    // Personal Details Page
    cy.get('button>p').contains('Add More Details').click();
    cy.get('p').contains('Personal Details').scrollIntoView().should('be.visible');
    cy.get('[name="phone"]').type('9888747777');
    cy.get('[name="email"]').type('paras+45@kwant.ai');
    cy.get('[placeholder="Select Date of Birth"]').clear({ force: true }).type('01/01/2001', { force: true });
    cy.get('[name="raceName"]').click();
    cy.get('[role="button"]').contains('Asian').click();
    cy.get('[name="sex"]').click({force:true});
    cy.get('[role="button"]').contains('Male').click();
    cy.get('[name="mwbe"]').click();
    cy.get('[role="button"]').contains('MWBE').click();
    cy.get('[name="emergencyContactName"]').type('Emergency Contact Name');
    cy.get('[name="emergencyContactPhone"]').type('9876543210');
    cy.get('[name="emergencyContactAddress"]').type('Kathmandu');
    cy.wait(1000)
    cy.get('[name="new_text"]').type('This is added new text');
    cy.get('[name="lalal"]').type('Test is added new lalal');

    // Job Details Page
    cy.get('button>p').contains('Add More Details').click();
    cy.get('[name="professionName"]').click();
    cy.get('[role="button"]').contains('General').click();
    cy.get('[name="employeeId"]').type('123456');
    cy.get('[name="crewName"]').click();
    cy.get('[role="button"]').contains('Management').click();
    cy.get('[name="dollarPerManHour"]').type('30');
    cy.get('[name="payGroup"]').click();
    cy.get('[role="button"]').contains('Blue Oval Battery Park of Michigan').click();
    cy.get('[name="alliance"]').click();
    cy.get('[role="button"]').contains('Union').click();

    cy.get('[name="title"]').click();
    cy.get('[role="button"]').contains('engineer').click();
    cy.get('[name="projectTaskCategoryName"]').click();
    cy.get('[role="button"]').contains('Management').click();

    // Certifications Page
    cy.get('button>p').contains('Add More Details').click();
    cy.get('button > p').contains('Add Certification').click();
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains('CA').click();
    cy.get('[name="credentialId"]').type('74774747477477474');
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get('[role="button"]').contains('Day(s)').click();
    cy.fixture('file.pdf', 'base64').then(fileContent => {
      cy.get('.sc-gObJpS').attachFile(
        { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' }
      );
    });
    cy.get('button>p').contains('Submit').click();

    // Beacon Configuration Page
    cy.get('button>p').contains('Add More Details').click();
    cy.get('[name="projectBeaconSerialNumber"]').click();
    cy.get('[role="button"].sc-tagGq').eq(0).click();
    cy.wait(1000);
    cy.get('[placeholder="Select Color Band"][autocomplete="off"]').click();
    cy.get(':nth-child(9) > [style="display: flex; justify-content: space-between; align-items: center; padding: 8px;"] > .sc-dhKdcB').click();
    cy.get('.exact-toggle-switch > [type="checkbox"]').check({ force: true });
    cy.get('.hdcwLk > button > p').click();
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');

    cy.writeFile('cypress/fixtures/createdWorker.json', {
      firstName,
      lastName
    });

    // Search and Navigate to Worker Details
    cy.get('header>button').click();
    cy.get('#search-input').type(firstName);
    cy.get('.personal-info-content__title')
      .contains(`${firstName} ${lastName}`)
      .should('be.visible')
      .click();

    // Verify General Details
    cy.wait(2000)
    let expectedValuesGeneralDetails = [
      firstName,
      lastName,
      'Micron'
    ];

    expectedValuesGeneralDetails.forEach((val) => {
      cy.get('.hover-hoc-container__input__display-value')
        .should('contain.text', val);
    });

    // Verify Personal Details
    cy.get('.sc-jXbUNg>.jmJtNV').eq(0).click();

    let expectedValuesPersonalDetails = [
      '988-8747777',
      'paras+45@kwant.ai',
      '01/01/2001',
      'Asian',
      'Male',
      'MWBE',
      'Emergency Contact Name',
      '9876543210',
      'Kathmandu',
      'This is added new text',
      'Test is added new lalal'
    ];

    cy.get('.hover-hoc-container__input__display-value').then(($elements) => {
      const allText = Array.from($elements).map(el => el.textContent).join('');
      expectedValuesPersonalDetails.forEach((val) => {
        expect(allText).to.contain(val);
      });
    });

    // Verify Job Details
    cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();

    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2,'0')}/` +
                          `${today.getDate().toString().padStart(2,'0')}/` +
                          `${today.getFullYear()}`;

    const expectedValuesJobDetails = [
      'General',
      '123456',
      'Management',
      '30',
      'Blue Oval Battery Park of Michigan',
      'Union',
      formattedDate,
      '-',
      'engineer',
      'Management'
    ];

    expectedValuesJobDetails.forEach(val => {
      cy.get('.hover-hoc-container__input__display-value').should('contain.text', val);
    });

    // Verify Documents
    cy.get('.sc-jXbUNg>.jmJtNV').eq(2).click();
    const expectedValuesDocuments = [
      'CA',
      '74774747477477474'
    ];

    expectedValuesDocuments.forEach(val => {
      cy.get('.cell-content').should('contain.text', val);
    });

    // Verify Beacon Settings
    cy.get('.sc-jXbUNg>.jmJtNV').eq(3).click();
    cy.get('input[type="checkbox"].exact-toggle-switch-checkbox').should('be.checked');

    // Verify Safety Notifications
    cy.get('.sc-jXbUNg>.jmJtNV').eq(4).click();
    cy.get('.empty-body__title').should('have.text', 'No safety notifications yet!');

    cy.get('.sc-CCtys.bfwwiC').click();
  });

  it("Validate adding a worker with only mandatory fields", () => {
    // Generate unique name for this test
    const randomNum = Math.floor(Math.random() * 100000000);
    const firstName = `Jane${randomNum}`;
    const lastName = "Smith";
    
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.addWorkerButton).click();
    cy.get(workforceSelector.profileImageUploadButton).click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    
    cy.get(workforceSelector.firstNameInput).type(firstName);
    cy.get(workforceSelector.lastNameInput).type(lastName);
    cy.get(workforceSelector.companyNameInput).type('Micron');
    cy.get('.sc-fhzFiK').click();
    cy.get(workforceSelector.submitWorkerButton).click();
    
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');
    cy.writeFile('cypress/fixtures/noEmailWorker.json', {
      firstName,
      lastName
    });

    // cy.get('header>button').click();
    // cy.searchAndDeleteWorker(firstName, lastName);
  });

  it("Validate worker photo capture via camera works", () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.addWorkerButton).click();
    cy.get(workforceSelector.profileImageUploadButton).click();
    cy.get('.upload-button__upload-options__option').eq(1).click();
    cy.wait(2000); 
    cy.get('.hdcwLk > button > p').click();
    cy.get('button>p').contains('Submit Photo').click();
  
    cy.get('.upload-avatar img')
      .should('have.attr', 'src')
      .and('not.contain', 'https://uat.kwant.ai/assets/personbg-2f058cfa');
  });

  it('Validate the "Add More Details" and "Add worker" buttons are disabled when mandatory fields are empty', () => {
    cy.visit('/projects/94049707/workers');
    cy.get('button').contains('Add Worker').click();
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    cy.get('[label="Add More Details"]>button').should('be.disabled');
  });

  it('should validate existing worker warning', () => {
    cy.visit('/projects/94049707/workers');
    cy.get('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((fullName) => {
        const [firstName, lastName] = fullName.trim().split(" ");
  
        cy.get(workforceSelector.addWorkerButton).contains('Add Worker').click();
        cy.get(workforceSelector.firstNameInput).type(firstName);
        cy.get(workforceSelector.lastNameInput).type(lastName);
  
        cy.get('.sc-kOPcWz')
          .contains('This worker name may already be in your system.')
          .should('be.visible');
      });
  });
});