/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { generateCompanyData } from '../../fixtures/workerData';
import { generateWorkerData } from '../../fixtures/workerData';
import { workforceSelector } from '../../support/workforceSelector';
import { addWorkerSelector } from '../../selector/addWorker';
import addCompanyPage from '/cypress/pages/companies/addCompany'

describe("WorkForce Companies Module - add Company", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });

  beforeEach(() => {
    cy.cleanUI();
  });

  it('shows error message when invalid phone number is entered while adding a company', () => {
    const companyData = generateCompanyData();
    const invalidPhones = [
      '12345',
      'abcdefghij',
      '98@#123456',
      '980000000000'
    ];
    const errorMessagePrefix = 'Phone number can not be verified as a valid Number';

    addCompanyPage.clickAddCompany();
    addCompanyPage.enterCompanyName(companyData.companyName);

    cy.wrap(invalidPhones).each((invalidPhone) => {
      addCompanyPage.enterPhoneNumber(invalidPhone);
      addCompanyPage.phoneNumberInput.should('have.value', invalidPhone);
      addCompanyPage.clickSubmit();
      addCompanyPage.verifyErrorMessage(errorMessagePrefix);
      addCompanyPage.phoneNumberInput.clear();
    });
  });

  it('Should restrict worker image upload to PNG, JPG, JPEG', () => {
    addCompanyPage.clickAddCompany();
    cy.wait(1000);
    addCompanyPage.uploadCompanyLogo('cypress/fixtures/demo.pdf');
    addCompanyPage.verifyErrorMessage('Image upload failed: Unsupported file type.');
  });

  it('Should show warning when adding existing Company', () => {
    cy.get('.personal-info-content__title')
      .first()
      .invoke('text')
      .then((fullName) => {
        const [firstName, lastName] = fullName.trim().split(" ");

        addCompanyPage.clickAddCompany();
        addCompanyPage.enterCompanyName(fullName.trim());
        addCompanyPage.clickSubmit();
        addCompanyPage.verifyErrorMessage('Company name has already been registered.');
      });
  });

  it('Validate submiting the Add Company form while leaving all field empty', () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.clickSubmit();
    addCompanyPage.verifyErrorMessage('Company name is required.');
  });

  it('Validate the Back button functionlity while clicking picture', () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.profileImageUploadButton.click();
    addCompanyPage.takeAPictureButton.click();
    addCompanyPage.verifyVideoViewerVisible();
    addCompanyPage.clickBackWhileCapturing();
    addCompanyPage.verifyVideoViewerNotVisible();
  });

  it('Should Validate Retake Picture Functionlity', () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.profileImageUploadButton.click();
    addCompanyPage.takeAPictureButton.click();
    addCompanyPage.verifyVideoViewerVisible();
    addCompanyPage.captureButton.click();
    addCompanyPage.verifyVideoViewerNotVisible();
    addCompanyPage.retakePicture();
    addCompanyPage.verifyVideoViewerVisible();
  });

  it("Verify that a company can be added with only the mandatory field filled.", () => {
    const companyData = generateCompanyData();
    let companyId;
    let requestPayload;
    let responseData;
    let authHeaders = {};

    cy.intercept('POST', '/api/projectTaskTrades', (req) => {
      requestPayload = req.body;
      authHeaders = {
        'x-auth-token': req.headers['x-auth-token'],
        'x-auth-project': req.headers['x-auth-project'],
      };
    }).as('addCompany');

    cy.intercept('DELETE', '/api/projectTaskTrades/**').as('deleteCompany');

    addCompanyPage.clickAddCompany();
    cy.wait(1000);

    addCompanyPage.fillMandatoryFields(companyData.companyName);
    cy.wait(2000);

    addCompanyPage.clickSubmit();

    cy.wait('@addCompany').then(({ response, request }) => {
      expect(response.statusCode).to.eq(201);

      companyId = response.body.id || response.body.data?.id;
      responseData = response.body.data || response.body;
      
      expect(companyId).to.exist;

      expect(requestPayload.name || requestPayload.companyName, 'Company name should match form input')
        .to.equal(companyData.companyName);

      const responseString = JSON.stringify(responseData);
      const validationResults = [];

      // Validate each field in request payload exists in response
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
      cy.log(`Validation Summary: ${passed} passed, ${failed} failed`);

      // Validate response structure
      expect(responseData).to.have.property('id');
      const companyNameInResponse = responseData.name || responseData.companyName;
      expect(companyNameInResponse, 'Company name should exist in response')
        .to.equal(companyData.companyName);

      expect(companyData.companyName)
        .to.equal(requestPayload.name || requestPayload.companyName)
        .and.equal(companyNameInResponse);

      cy.log(`✅ Data flow validated | Company ID: ${companyId}`);
    });

    cy.get(workforceSelector.toastMessage)
      .should('be.visible')
      .and('contain.text', 'Company added successfully');
    
    cy.get('body').click(0, 0);
    cy.get(workforceSelector.searchInput).clear().type(companyData.companyName);
    cy.get(workforceSelector.tableRow).contains(companyData.companyName).should('be.visible');
    
    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
  });

  it('verify adding company while using the camera to capture logo', () => {
    addCompanyPage.clickAddCompany();
    cy.wait(1000);
    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');
    let companyId;
    const companyData = generateCompanyData();

    addCompanyPage.enterCompanyName(companyData.companyName);
    addCompanyPage.companyNameInput.should('have.value', companyData.companyName);
    addCompanyPage.captureCompanyLogoWithCamera();
    addCompanyPage.verifyImageUploaded();
    cy.wait(1000);
    addCompanyPage.clickSubmit();

    cy.wait('@addCompany').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      companyId = response.body?.id;
      cy.log(`Company created with ID: ${companyId}`);
    });

    cy.get(workforceSelector.toastMessage)
      .should('be.visible')
      .and('contain.text', 'Company added successfully');
    
    cy.get('body').click(0, 0);
    cy.get(workforceSelector.searchInput).clear().type(companyData.companyName);
    cy.get(workforceSelector.tableRow).contains(companyData.companyName).should('be.visible');
    
    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row).find('[type="checkbox"]').check({ force: true });
    });
    cy.get(workforceSelector.overflowMenu).click();
    cy.contains(".dropdown-option", "Delete").click();
    cy.get("button p").contains("Delete").click();
    cy.wait('@deleteCompany').its('response.statusCode').should('eq', 200);
  });

  it('Verify adding company with all fields filled', () => {

    const companyData = generateCompanyData();
    const workerData = generateWorkerData();
    let companyId;

    const tempCsvPath = `cypress/fixtures/temp/worker_${Date.now()}.csv`;

    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
    cy.intercept('POST', '/api/companies/delete').as('deleteCompany');

    cy.readFile('cypress/fixtures/testdata/fulldata.csv').then((content) => {
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const data = lines[1].split(',');

      const getIndex = (headerName) =>
        headers.findIndex(
          h => h.replace(/"/g, '').trim() === headerName
        );

      data[getIndex('First Name')] = `"${workerData.firstName}"`;
      data[getIndex('Last Name')] = `"${workerData.lastName}"`;
      data[getIndex('Company Name')] = `"${companyData.companyName}"`;

      const updatedCsv = [headers.join(','), data.join(',')].join('\n');
      cy.writeFile(tempCsvPath, updatedCsv);
    });

    addCompanyPage.clickAddCompany();
    cy.wait(1000);

    addCompanyPage.fillAllFields(companyData);

    addCompanyPage.navigateToDocumentTab();
    addCompanyPage.addCertification('74774747477477474');

    cy.fixture('image.png', 'base64').then(fileContent => {
      addCompanyPage.uploadDocument(fileContent, 'file.pdf', 'application/pdf');
    });

    addCompanyPage.navigateToWorkerTab();
    addCompanyPage.addWorkerFromCSV(tempCsvPath);
    addCompanyPage.verifyWorkerAddedMessage(1);
    cy.wait(1000);

    addCompanyPage.clickSubmit();

    cy.wait('@addCompany').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      companyId = response.body.id;
      
      expect(response.body.name).to.eq(companyData.companyName);
      expect(response.body.email).to.eq(companyData.email);
      expect(response.body.status).to.eq('ACTIVE');
      cy.writeFile('cypress/fixtures/createdCompany.json', {
        id: response.body.id,
        name: response.body.name
      });
    });

    cy.get('body').click(0, 0);
    cy.get(workforceSelector.searchInput).clear().type(companyData.companyName);
    cy.get(workforceSelector.tableRow).contains(companyData.companyName).click();

    cy.getWorkerField('Company Name').should('have.text', companyData.companyName);
    cy.getWorkerField('E Mail').should('have.text', companyData.email);

    cy.get(workforceSelector.companyWorkerPage).click();
    cy.get('.details')
      .should('contain.text', 'Total Workers')
      .and('contain.text', '1');
  });
});