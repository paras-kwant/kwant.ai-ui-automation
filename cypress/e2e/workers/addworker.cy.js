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
    cy.selectRandomOption('input[name="company"]', '.select_item_container [role="button"]', 'company');
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should not allow adding worker without Last Name', () => {
    const workerData = generateWorkerData();
    addworkerPage.uploadProfileImage('profile.png');
    workforceSelector.firstNameInput().type(workerData.firstName);
    cy.selectRandomOption('input[name="company"]', '.select_item_container [role="button"]', 'company');
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should not allow adding worker without Company name', () => {
    const workerData = generateWorkerData();
    workforceSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/profile.png', { force: true });
    addworkerPage.fillWorkerName(workerData);
    addworkerPage.verifyMandatoryButtonsAreDisabled();
  });

  it('Should Validate Retake Picture Functionlity', ()=>{
    addWorkerSelector.profileImageUploadButton().click();
    addWorkerSelector.takeAPictureButton().click();
    cy.get('video.video_viewer').should('be.visible')
    cy.wait(1000)
    cy.get(workforceSelector.captureButton).click()
    cy.wait(3000)
    cy.get('video.video_viewer').should('not.exist')

    cy.get('.retake_container p').contains('Retake Picture').should('be.visible').click()
    cy.get('video.video_viewer').should('be.visible')
  })

  it('Validate the Back button functionlity while clicking picture', ()=>{
    addWorkerSelector.profileImageUploadButton().click();
    addWorkerSelector.takeAPictureButton().click();
    cy.get('video.video_viewer').should('be.visible')
    cy.get(workforceSelector.backButton).click()
    cy.get('video.video_viewer').should('not.exist')
  })

  it('Should validate email format', () => {
    const workerData = generateWorkerData(); 
    addworkerPage.fillWorkerName(workerData);
    cy.selectRandomOption('input[name="company"]', '.select_item_container [role="button"]', 'company');
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

    let workerId;
    let requestPayload;
    let authHeaders = {};
  
    cy.intercept('POST', '/api/worker/save', (req) => {
      requestPayload = req.body;

      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project'],
      };
    }).as('addedworker');
  
    const workerData = generateWorkerData();
    addworkerPage.fillWorkerName(workerData);
  
    cy.selectRandomOption(
      'input[name="company"]',
      '.select_item_container [role="button"]',
      'company'
    );
  
    addworkerPage.submitWorker();

    cy.wait('@addedworker').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    
      workerId = response.body.id || response.body.data?.id;
      expect(workerId).to.exist;
    
      const savedWorker = response.body.data || response.body;
      const responseString = JSON.stringify(savedWorker);
    
      cy.log('**Validating Request Payload**');
      cy.log(JSON.stringify(requestPayload, null, 2));
    
      const validationResults = [];
    
      Object.entries(requestPayload).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          typeof value !== 'object'
        ) {
          const valueStr = String(value).trim();
          const exists = responseString.includes(valueStr);
          
          validationResults.push({
            key,
            value: valueStr,
            exists
          });
    
          if (exists) {
            cy.log(`✅ ${key}: "${valueStr}" - FOUND`);
          } else {
            cy.log(`❌ ${key}: "${valueStr}" - NOT FOUND`);
          }
    
          expect(exists, `Payload field "${key}" with value "${valueStr}" should exist in response`).to.be.true;
        }
      });
    
      const passed = validationResults.filter(r => r.exists).length;
      const failed = validationResults.filter(r => !r.exists).length;
      cy.log(`**Validation Summary: ${passed} passed, ${failed} failed**`);
    });

    cy.contains(workerData.firstName).should('be.visible');
    cy.contains(workerData.lastName).should('be.visible');
  
    cy.writeFile('cypress/fixtures/noEmailWorker.json', workerData);
  
  
  });
  
  

  it('Should add worker with profile picture', () => {

    let workerId;
    let requestPayload;
    let authHeaders = {};
  
    cy.intercept('POST', '/api/worker/save', (req) => {
      requestPayload = req.body;

      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project'],
      };
    }).as('addedworker');

    const workerData = generateWorkerData();
    addworkerPage.uploadProfileImage('profile.png');
    addWorkerSelector.firstNameInput().type(workerData.firstName);
    addWorkerSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.select_item_container [role="button"]', 'company');
    addWorkerSelector.addMoreDetail().click();
    cy.get('p').contains('Personal Details').scrollIntoView().should('be.visible');
    addWorkerSelector.emailInput().type('paras+45@kwant.ai');
    cy.get(workforceSelector.accessControlPage).click()
    cy.selectRandomOption('[name="projectBeaconSerialNumber"]', '.select_item_container [role="button"]', 'device');
    addworkerPage.submitWorker();

    cy.wait('@addedworker').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    
      workerId = response.body.id || response.body.data?.id;
      expect(workerId).to.exist;
    
      const savedWorker = response.body.data || response.body;
      const responseString = JSON.stringify(savedWorker);
    
      cy.log('**Validating Request Payload**');
      cy.log(JSON.stringify(requestPayload, null, 2));
    
      const validationResults = [];
    
      Object.entries(requestPayload).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          typeof value !== 'object'
        ) {
          const valueStr = String(value).trim();
          const exists = responseString.includes(valueStr);
          
          validationResults.push({
            key,
            value: valueStr,
            exists
          });
    
          if (exists) {
            cy.log(`✅ ${key}: "${valueStr}" - FOUND`);
          } else {
            cy.log(`❌ ${key}: "${valueStr}" - NOT FOUND`);
          }
    
          expect(exists, `Payload field "${key}" with value "${valueStr}" should exist in response`).to.be.true;
        }
      });
    
      const passed = validationResults.filter(r => r.exists).length;
      const failed = validationResults.filter(r => !r.exists).length;
      cy.log(`**Validation Summary: ${passed} passed, ${failed} failed**`);
    });

    cy.contains(workerData.firstName).should('be.visible');
    cy.contains(workerData.lastName).should('be.visible');
  });

  it('Should capture worker photo via camera', () => {   
    addWorkerSelector.profileImageUploadButton().click();
    addWorkerSelector.takeAPictureButton().click();
    cy.get('.video_viewer').should('be.visible')
    cy.wait(2000)
    cy.get(workforceSelector.captureButton).click()
    cy.get(workforceSelector.submitPhotoButton).click()
    cy.get('.upload-avatar img')
    .should('have.attr', 'src')
    .and('match', /^blob:/); 
  });

  it('Should add worker with all fields filled', () => {

    const workerData = generateWorkerData();
  
    let workerId;
    let requestPayload;
    let authHeaders = {};
  
    cy.intercept('POST', '/api/worker/save', (req) => {
      requestPayload = req.body;
  
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project'],
      };
    }).as('addedworker');
  
  
  
    addworkerPage.uploadProfileImage('profile.png');
    addworkerPage.fillWorkerName(workerData);
  
    cy.selectRandomOption(
      'input[name="company"]',
      '.select_item_container [role="button"]',
      'company'
    );
  
    addWorkerSelector.addMoreDetail().click();
    cy.contains('Personal Details').scrollIntoView().should('be.visible');
  
    addWorkerSelector.emailInput().type('paras+45@kwant.ai');
    workforceSelector.addressInput().type('Kathmandu');
    addWorkerSelector.zipcodeInput().type('44600');
    addWorkerSelector.dobInput().first().clear({ force: true }).type('01/01/2001', { force: true });
  
    cy.selectRandomOption('[name="raceName"]', '.select_item_container [role="button"]');
    cy.selectRandomOption('[name="sex"]', '.select_item_container [role="button"]');
    cy.selectRandomOption('[name="mwbe"]', '.select_item_container [role="button"]');
    cy.selectRandomOption('[name="ethnicity"]', '.select_item_container [role="button"]');
  
    addWorkerSelector.emergencyContactNameInput().type('Emergency Contact Name');
    addWorkerSelector.emergencyContactPhoneInput().type('9876543210');
    addWorkerSelector.emergencyContactAddressInput().type('Kathmandu');
  
    addWorkerSelector.addMoreDetail().click();
  
    addWorkerSelector.jobTitleInput().type('worker');
    cy.selectRandomOption('[name="professionName"]', '.select_item_container [role="button"]');
    addWorkerSelector.employeeIdInput().type('123456');
    cy.selectRandomOption('[name="crewName"]', '.select_item_container [role="button"]');
    addWorkerSelector.dollarPerManHour().type('30');
    cy.selectRandomOption('[name="payGroup"]', '.select_item_container [role="button"]');
    cy.selectRandomOption('[name="alliance"]', '.select_item_container [role="button"]');
    cy.selectRandomOption('[name="projectTaskCategoryName"]', '.select_item_container [role="button"]');
  
    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.addCertificationButton().click();
    cy.selectRandomOption('[name="documentType"]', '.select_item_container [role="button"]');
    addWorkerSelector.credentialIdInput().type('74774747477477474');
  
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[name="expiresInPeriods"]').click();
    cy.contains('Day(s)').click();
  
    cy.fixture('image.png', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
        { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' }
      );
    });
  
    addWorkerSelector.submitButton().should('be.visible').click();
    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.addMoreDetail().click();
  
    cy.selectRandomOption(
      '[name="projectBeaconSerialNumber"]',
      '.select_item_container [role="button"]'
    );
  
    addworkerPage.submitWorker();
  
  
    cy.wait('@addedworker').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    
      workerId = response.body.id || response.body.data?.id;
      expect(workerId).to.exist;
    
      const savedWorker = response.body.data || response.body;
      const responseString = JSON.stringify(savedWorker);
    
      cy.log('**Validating Request Payload**');
      cy.log(JSON.stringify(requestPayload, null, 2));
    
      const validationResults = [];
    
      Object.entries(requestPayload).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          typeof value !== 'object'
        ) {
          const valueStr = String(value).trim();
          const exists = responseString.includes(valueStr);
          
          validationResults.push({
            key,
            value: valueStr,
            exists
          });
    
          if (exists) {
            cy.log(`✅ ${key}: "${valueStr}" - FOUND`);
          } else {
            cy.log(`❌ ${key}: "${valueStr}" - NOT FOUND`);
          }
    
          // Assert with better error message
          expect(exists, `Payload field "${key}" with value "${valueStr}" should exist in response`).to.be.true;
        }
      });
    
      const passed = validationResults.filter(r => r.exists).length;
      const failed = validationResults.filter(r => !r.exists).length;
      cy.log(`**Validation Summary: ${passed} passed, ${failed} failed**`);
    });
  
    cy.contains(workerData.firstName).should('be.visible');
    cy.contains(workerData.lastName).should('be.visible');
  
    cy.writeFile('cypress/fixtures/createdWorker.json', {
      firstName: workerData.firstName,
      lastName: workerData.lastName
    });
  });
  
  
})