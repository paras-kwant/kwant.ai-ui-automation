/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData.js';


describe("Worker Module - Add Worker Tests", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
  });

  it('Validate adding a worker with all fields filled', () => {
    const workerData = generateWorkerData(); // generate random worker data

    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    workforceSelector.addWorkerButton().click();
    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');

    workforceSelector.addMoreDetail().click();

    // Personal Details Page
    cy.get('p').contains('Personal Details').scrollIntoView().should('be.visible');
    workforceSelector.phoneInput().type('9779868757376');
    workforceSelector.emailInput().type('paras+45@kwant.ai');
    workforceSelector.addressInput().type('Kathmandu');
    workforceSelector.zipcodeInput().type('44600');
    workforceSelector.dobInput().clear({ force: true }).type('01/01/2001', { force: true });
    cy.selectRandomOption('[name="raceName"]', '.sc-tagGq[role="button"]', 'raceName');
    cy.selectRandomOption('[name="sex"]', '.sc-tagGq[role="button"]', 'sex');
    cy.selectRandomOption('[name="mwbe"]', '.sc-tagGq[role="button"]', 'mwbe');
    cy.selectRandomOption('[name="ethnicity"]', '.sc-tagGq[role="button"]', 'ethnicity');

    workforceSelector.emergencyContactNameInput().type('Emergency Contact Name');
    workforceSelector.emergencyContactPhoneInput().type('9876543210');
    workforceSelector.emergencyContactAddressInput().type('Kathmandu');

    workforceSelector.addMoreDetail().click();

    // Job Details Page
    workforceSelector.jobTitleInput().type('worker');
    cy.selectRandomOption('[name="professionName"]', '.sc-tagGq[role="button"]', 'professionName');
    workforceSelector.employeeIdInput().type('123456');
    cy.selectRandomOption('[name="crewName"]', '.sc-tagGq[role="button"]', 'crewname');
    workforceSelector.dollarPerManHour().type('30');
    cy.selectRandomOption('[name="payGroup"]', '.sc-tagGq[role="button"]', 'payGroup');
    cy.selectRandomOption('[name="alliance"]', '.sc-tagGq[role="button"]', 'alliance');
    cy.selectRandomOption('[name="projectTaskCategoryName"]', '.sc-tagGq[role="button"]', 'projectTaskCategoryName');

    workforceSelector.addMoreDetail().click();

    // Certifications Page
    workforceSelector.addCertificationButton().click();
    cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
    workforceSelector.credentialIdInput().type('74774747477477474');
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get('[role="button"]').contains('Day(s)').click();
    cy.fixture('file.pdf', 'base64').then(fileContent => {
      cy.get('.sc-gObJpS').attachFile(
        { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' }
      );
    });
    workforceSelector.submitButton().click({ force: true });

    workforceSelector.addMoreDetail().click();

    // Beacon Configuration Page
    cy.selectRandomOption('[name="projectBeaconSerialNumber"]', '.sc-tagGq[role="button"]', 'device');
    cy.get('.exact-toggle-switch > [type="checkbox"]').check({ force: true });
    cy.wait(2000);
    workforceSelector.submitWorkerButton().click();
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');

    cy.writeFile('cypress/fixtures/createdWorker.json', {
      firstName: workerData.firstName,
      lastName: workerData.lastName
    });

    // // Search and Navigate to Worker Details
    // cy.get('header>button').click();
    // cy.get('#search-input').type(firstName);
    // cy.get('.personal-info-content__title')
    //   .contains(`${firstName} ${lastName}`)
    //   .should('be.visible')
    //   .click();

    // // Verify General Details
    // cy.wait(2000)
    // let expectedValuesGeneralDetails = [
    //   firstName,
    //   lastName,
    //   'Micron'
    // ];

    // expectedValuesGeneralDetails.forEach((val) => {
    //   cy.get('.hover-hoc-container__input__display-value')
    //     .should('contain.text', val);
    // });

    // // Verify Personal Details
    // cy.get('.sc-jXbUNg>.jmJtNV').eq(0).click();

    // let expectedValuesPersonalDetails = [
    //   '988-8747777',
    //   'paras+45@kwant.ai',
    //   '01/01/2001',
    //   'Asian',
    //   'Male',
    //   'MWBE',
    //   'Emergency Contact Name',
    //   '9876543210',
    //   'Kathmandu',
    //   'This is added new text',
    //   'Test is added new lalal'
    // ];

    // cy.get('.hover-hoc-container__input__display-value').then(($elements) => {
    //   const allText = Array.from($elements).map(el => el.textContent).join('');
    //   expectedValuesPersonalDetails.forEach((val) => {
    //     expect(allText).to.contain(val);
    //   });
    // });

    // // Verify Job Details
    // cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();

    // const today = new Date();
    // const formattedDate = `${(today.getMonth() + 1).toString().padStart(2,'0')}/` +
    //                       `${today.getDate().toString().padStart(2,'0')}/` +
    //                       `${today.getFullYear()}`;

    // const expectedValuesJobDetails = [
    //   'General',
    //   '123456',
    //   'Management',
    //   '30',
    //   'Blue Oval Battery Park of Michigan',
    //   'Union',
    //   formattedDate,
    //   '-',
    //   'engineer',
    //   'Management'
    // ];

    // expectedValuesJobDetails.forEach(val => {
    //   cy.get('.hover-hoc-container__input__display-value').should('contain.text', val);
    // });

    // // Verify Documents
    // cy.get('.sc-jXbUNg>.jmJtNV').eq(2).click();
    // const expectedValuesDocuments = [
    //   'CA',
    //   '74774747477477474'
    // ];

    // expectedValuesDocuments.forEach(val => {
    //   cy.get('.cell-content').should('contain.text', val);
    // });

    // // Verify Beacon Settings
    // cy.get('.sc-jXbUNg>.jmJtNV').eq(3).click();
    // cy.get('input[type="checkbox"].exact-toggle-switch-checkbox').should('be.checked');

    // // Verify Safety Notifications
    // cy.get('.sc-jXbUNg>.jmJtNV').eq(4).click();
    // cy.get('.empty-body__title').should('have.text', 'No safety notifications yet!');

    // cy.get('.sc-CCtys.bfwwiC').click();
  });

  it("Validate adding a worker with only mandatory fields", () => {
    const workerData = generateWorkerData();

    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    workforceSelector.submitWorkerButton().click();
    
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');
    cy.writeFile('cypress/fixtures/noEmailWorker.json', {
      firstName: workerData.firstName,
      lastName: workerData.lastName
    });
  });

  it("Validate worker photo capture via camera works", () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);    
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.wait(2000); 
    workforceSelector.takeAPictureButton().click();
    cy.wait(2000);
    workforceSelector.clickPictureButton().click();
    workforceSelector.submitPhotoButton().click();
  
    cy.get('.upload-avatar img')
      .should('have.attr', 'src')
      .and('not.contain', 'https://uat.kwant.ai/assets/personbg-2f058cfa');
  });

  it('Validate the "Add More Details" and "Add worker" buttons are disabled when mandatory fields are empty', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);   
    workforceSelector.addWorkerButton().click();
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    workforceSelector.addMoreDetail().should('be.disabled');
  });

  it('should validate existing worker warning', () => {
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.get('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((fullName) => {
        const [firstName, lastName] = fullName.trim().split(" ");
        workforceSelector.addWorkerButton().click();
        workforceSelector.firstNameInput().type(firstName);
        workforceSelector.lastNameInput().type(lastName);
  
        workforceSelector.toastMessage()
          .contains('This worker name may already be in your system.')
          .should('be.visible');
      });
  });
});
