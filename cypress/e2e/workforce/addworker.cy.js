/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData.js';
import workerHelper from '../../support/helper/addWorker';

describe("Worker Module - Add Worker Tests", () => {
  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);

  });
  
  beforeEach(() => {
    cy.get("body").then(($body) => {
      if ($body.find("aside button svg, .sc-krNlru svg").length > 0) {
        cy.get("aside button svg, .sc-krNlru svg")
          .should("be.visible")
          .click({ force: true });
      }
    });
  });

  it('Should disable buttons when mandatory fields are empty', () => {
    workforceSelector.addWorkerButton().click();
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    workforceSelector.addMoreDetail().should('be.disabled');
  });

  it('Should not allow adding worker without First Name', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    workforceSelector.addMoreDetail().should('be.disabled');
  });

  it('Should not allow adding worker without Last Name', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.firstNameInput().type(workerData.firstName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    workforceSelector.addMoreDetail().should('be.disabled');
  });

  it('Should not allow adding worker without Company name', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.get('[label="Add Worker"]>button').should('be.disabled');
    workforceSelector.addMoreDetail().should('be.disabled');
  });

  it('Should validate email format', () => {
    const workerData = generateWorkerData(); 
    workforceSelector.addWorkerButton().click();
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    workforceSelector.addMoreDetail().click();
    workforceSelector.emailInput().type('paras@asdasdsa');
    workforceSelector.addMoreDetail().click();
    workforceSelector.toastMessage().contains('Invalid email').should('be.visible');
  });

  it('Should restrict worker image upload to PNG, JPG, JPEG', () => {
    workforceSelector.addWorkerButton().click();
    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/demo.pdf', { force: true });
    workforceSelector.toastMessage().contains('Image upload failed: Unsupported file type.').should('be.visible');
  });

  it('Should show warning when adding existing worker', () => {
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

  it('Should add worker with only mandatory fields', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();
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

  it('Should add worker with profile picture', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    workforceSelector.submitWorkerButton().click();
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');
  });

  it('Should capture worker photo via camera', () => {   
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

  it.only('Should add worker with all fields filled', () => {
    const workerData = generateWorkerData();
    workforceSelector.addWorkerButton().click();

    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });

    workforceSelector.firstNameInput().type(workerData.firstName);
    workforceSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');

    workforceSelector.addMoreDetail().click();
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
    workforceSelector.jobTitleInput().type('worker');
    cy.selectRandomOption('[name="professionName"]', '.sc-tagGq[role="button"]', 'professionName');
    workforceSelector.employeeIdInput().type('123456');
    cy.selectRandomOption('[name="crewName"]', '.sc-tagGq[role="button"]', 'crewname');
    workforceSelector.dollarPerManHour().type('30');
    cy.selectRandomOption('[name="payGroup"]', '.sc-tagGq[role="button"]', 'payGroup');
    cy.selectRandomOption('[name="alliance"]', '.sc-tagGq[role="button"]', 'alliance');
    cy.selectRandomOption('[name="projectTaskCategoryName"]', '.sc-tagGq[role="button"]', 'projectTaskCategoryName');

    workforceSelector.addMoreDetail().click();
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
    workforceSelector.submitButton().should('be.visible').click({});
    workforceSelector.addMoreDetail().click();

    workforceSelector.addMoreDetail().click();
    cy.selectRandomOption('[name="projectBeaconSerialNumber"]', '.sc-tagGq[role="button"]', 'device');
    cy.get('.exact-toggle-switch > [type="checkbox"]').check({ force: true });
    cy.wait(2000);
    workforceSelector.submitWorkerButton().click();
    cy.get('h4').contains('successfully added as a worker.').should('be.visible');
    cy.writeFile('cypress/fixtures/createdWorker.json', {
      firstName: workerData.firstName,
      lastName: workerData.lastName
    });
  });
});