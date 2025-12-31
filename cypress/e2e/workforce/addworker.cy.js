/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData.js';
import workerHelper from '../../support/helper/workerHelper.js';
import { addWorkerSelector } from '../../selector/addWorker.js';
import addworkerPage from '../../pages/workforce/addworkerPage.js';

describe("Worker Module - Add Worker Tests", () => {
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
  beforeEach(() => {
    addworkerPage.openAddWorkerForm();
  })
  it('Should disable buttons when mandatory fields are empty', () => {
      addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should not allow adding worker without First Name', () => {
    const workerData = generateWorkerData();
    addworkerPage.uploadProfileImage('profile.png');
    addWorkerSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should not allow adding worker without Last Name', () => {
    const workerData = generateWorkerData();
    addworkerPage.uploadProfileImage('profile.png');
    workforceSelector.firstNameInput().type(workerData.firstName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should not allow adding worker without Company name', () => {
    const workerData = generateWorkerData();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    addworkerPage.fillWorkerName(workerData);
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should validate email format', () => {
    const workerData = generateWorkerData(); 
    addworkerPage.fillWorkerName(workerData);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.emailInput().type('paras@asdasdsa');
    addWorkerSelector.addMoreDetail().click();
    addworkerPage.assertToastMessage('Invalid email')
  });

  it('Should restrict worker image upload to PNG, JPG, JPEG', () => {
    addworkerPage.uploadProfileImage('demo.pdf');
    addworkerPage.assertToastMessage('Image upload failed: Unsupported file type.');

  });

  it('Should show warning when adding existing worker', () => {
    cy.get('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((fullName) => {
        const [firstName, lastName] = fullName.trim().split(" ");
        addworkerPage.fillWorkerName({ firstName, lastName });
        addworkerPage.assertToastMessage('This worker name may already be in your system.')
      });
  });

  it('Should add worker with only mandatory fields', () => {
    const workerData = generateWorkerData();
    addworkerPage.fillWorkerName(workerData);
    cy.selectRandomOption('input[name="company"]','.sc-tagGq[role="button"]','company');
    addworkerPage.submitWorker();
    cy.writeFile('cypress/fixtures/noEmailWorker.json', workerData);
  });
  

  it('Should add worker with profile picture', () => {
    const workerData = generateWorkerData();
    addworkerPage.uploadProfileImage('profile.png');
    addWorkerSelector.firstNameInput().type(workerData.firstName);
    addWorkerSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    addWorkerSelector.addMoreDetail().click();
    cy.get('p').contains('Personal Details').scrollIntoView().should('be.visible');
    addWorkerSelector.emailInput().type('paras+45@kwant.ai');
    workforceSelector.AccessControl().click()
    cy.selectRandomOption('[name="projectBeaconSerialNumber"]', '.sc-tagGq[role="button"]', 'device');
    addworkerPage.submitWorker();
  });

  it('Should capture worker photo via camera', () => {   
    addWorkerSelector.profileImageUploadButton().click();
    addWorkerSelector.takeAPictureButton().click();
    cy.get('.video_viewer').should('be.visible')
    addWorkerSelector.clickPictureButton().click();
    addWorkerSelector.submitPhotoButton().click();
    cy.get('.upload-avatar img')
    .should('have.attr', 'src')
    .and('match', /^blob:/); 
  });
<<<<<<< HEAD

=======
>>>>>>> fa8d4a397423b04c30800b63e9e191f2d2225a5e
  it('Should add worker with all fields filled', () => {
    const workerData = generateWorkerData();

    addworkerPage.uploadProfileImage('profile.png');

    addworkerPage.fillWorkerName(workerData);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');

    addWorkerSelector.addMoreDetail().click();
    cy.get('p').contains('Personal Details').scrollIntoView().should('be.visible');
    addWorkerSelector.phoneInput().type('9779868757376');
    addWorkerSelector.emailInput().type('paras+45@kwant.ai');
    workforceSelector.addressInput().type('Kathmandu');
    addWorkerSelector.zipcodeInput().type('44600');
    addWorkerSelector.dobInput().first().clear({ force: true }).type('01/01/2001', { force: true });
    cy.selectRandomOption('[name="raceName"]', '.sc-tagGq[role="button"]', 'raceName');
    cy.selectRandomOption('[name="sex"]', '.sc-tagGq[role="button"]', 'sex');
    cy.selectRandomOption('[name="mwbe"]', '.sc-tagGq[role="button"]', 'mwbe');
    cy.selectRandomOption('[name="ethnicity"]', '.sc-tagGq[role="button"]', 'ethnicity');

    addWorkerSelector.emergencyContactNameInput().type('Emergency Contact Name');
    addWorkerSelector.emergencyContactPhoneInput().type('9876543210');
    addWorkerSelector.emergencyContactAddressInput().type('Kathmandu');

    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.jobTitleInput().type('worker');
    cy.selectRandomOption('[name="professionName"]', '.sc-tagGq[role="button"]', 'professionName');
    addWorkerSelector.employeeIdInput().type('123456');
    cy.selectRandomOption('[name="crewName"]', '.sc-tagGq[role="button"]', 'crewname');
    addWorkerSelector.dollarPerManHour().type('30');
    cy.selectRandomOption('[name="payGroup"]', '.sc-tagGq[role="button"]', 'payGroup');
    cy.selectRandomOption('[name="alliance"]', '.sc-tagGq[role="button"]', 'alliance');
    cy.selectRandomOption('[name="projectTaskCategoryName"]', '.sc-tagGq[role="button"]', 'projectTaskCategoryName');

    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.addCertificationButton().click();
    cy.selectRandomOption('[name="documentType"]', '.sc-tagGq[role="button"]', 'documentType');
    addWorkerSelector.credentialIdInput().type('74774747477477474');
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.get('[role="button"]').contains('Day(s)').click();
    cy.fixture('image.png', 'base64').then(fileContent => {
      cy.get('.sc-gObJpS').attachFile(
        { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' }
      );
    });
    addWorkerSelector.submitButton().should('be.visible').click({});
    addWorkerSelector.addMoreDetail().click();

    addWorkerSelector.addMoreDetail().click();
    cy.selectRandomOption('[name="projectBeaconSerialNumber"]', '.sc-tagGq[role="button"]', 'device');
    cy.get('.exact-toggle-switch > [type="checkbox"]').check({ force: true });
    // cy.wait(2000);
    addworkerPage.submitWorker();
    cy.writeFile('cypress/fixtures/createdWorker.json', {
      firstName: workerData.firstName,
      lastName: workerData.lastName
    });
  });
})
