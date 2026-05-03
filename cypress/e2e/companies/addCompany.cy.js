/// <reference types="cypress" />
import { workforceSelector } from '../../support/workforceSelector';
import companiesHelper from '../../support/helper/companiesHelper';
import addCompanyPage from '/cypress/pages/companies/addCompany';
import { generateCompanyData} from '../../fixtures/generateData'; 

describe("WorkForce Companies Module - Add Company", { tags: ["Epic:WorkForce", "Feature:Companies Module", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('4441501293'));   
  }) 

  it('WorkForce-Company - shows error message when invalid phone number is entered while adding a company', { 

  }, () => {
    const companyData = generateCompanyData();
    const invalidPhones = ['12345','abcdefghij','98@#123456','980000000000'];
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

  it('WorkForce-Company - Should restrict worker image upload to PNG, JPG, JPEG', { 
    tags: ["Story:Image Upload Validation", "Severity:normal", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    cy.get('p').contains('General Details').should('be.visible');
    addCompanyPage.uploadCompanyLogo('cypress/fixtures/demo.pdf');
    addCompanyPage.verifyErrorMessage('Image upload failed: Unsupported file type.');
  });

  it('WorkForce-Company Should show warning when adding existing Company', { 
    tags: ["Story:Duplicate Company", "Severity:critical", "UI", "Module:WorkForce-Company"] 
  }, () => {
    cy.get('.personal-info-content__title').first().invoke('text').then((fullName) => {
      addCompanyPage.clickAddCompany();
      addCompanyPage.enterCompanyName(fullName.trim());
      addCompanyPage.clickSubmit();
      addCompanyPage.verifyErrorMessage('Company name has already been registered.');
    });
  });

  it('WorkForce-Company - Validate submitting the Add Company form while leaving all field empty', { 
    tags: ["Story:Mandatory Fields Validation", "Severity:critical", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.clickSubmit();
    addCompanyPage.verifyErrorMessage('Company name is required.');
  });

  it('WorkForce-Company - Validate the Back button functionality while clicking picture', { 
    tags: ["Story:Camera Functionality", "Severity:minor", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.profileImageUploadButton.click();
    addCompanyPage.takeAPictureButton.click();
    cy.get('img').should('be.visible');
    addCompanyPage.clickBackWhileCapturing();
    addCompanyPage.verifyVideoViewerNotVisible();
  });

  it('WorkForce-Company - Should Validate Retake Picture Functionality', { 
    tags: ["Story:Camera Retake", "Severity:minor", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.profileImageUploadButton.click();
    addCompanyPage.takeAPictureButton.click();

    addCompanyPage.verifyVideoViewerVisible();
    addCompanyPage.captureButton.click();
    addCompanyPage.verifyVideoViewerNotVisible();
    addCompanyPage.retakePicture();
    addCompanyPage.verifyVideoViewerVisible();
  });

  it("WorkForce-Company - Verify mandatory fields only and others are null", () => {

    const companyData = {
      companyName: generateCompanyData().companyName
    };
  
    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
  
    addCompanyPage.clickAddCompany();
    addCompanyPage.fillMandatoryFields(companyData.companyName);
    addCompanyPage.clickSubmit();
  
    cy.wait('@addCompany').then((interception) => {
      const { request, response } = interception;
  
      expect(response.statusCode).to.eq(201);
  
      expect(request.body.name).to.eq(companyData.companyName);
      expect(response.body.name).to.eq(companyData.companyName);
  
  
      expect(request.body.email ?? null).to.eq(null);
      expect(request.body.phone ?? null).to.eq(null);
      expect(request.body.address ?? null).to.eq(null);
      expect(request.body.zipCode ?? null).to.eq(null);
  
      expect(response.body.email ?? null).to.eq(null);
      expect(response.body.phone ?? null).to.eq(null);
      expect(response.body.address ?? null).to.eq(null);
      expect(response.body.zipCode ?? null).to.eq(null);

      expect(response.body.id).to.exist;
    });
  
    addCompanyPage.verifyComapnyAddedSucessfully();
  });

  it('WorkForce-Company - Verify adding company while using the camera to capture logo', { 
    tags: ["Story:Add Company With Camera", "Severity:normal", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    addCompanyPage.captureCompanyLogoWithCamera();
    addCompanyPage.verifyImageUploaded();
  });

  it('Validate presence and count of all labels according to the project', () => {
    cy.intercept(
      'GET',
      '**/api/getPreferredColumns?module=companies_drawer'
    ).as('getColumnThroughApi');
    cy.get(workforceSelector.tableRow).should('be.visible');

  
    addCompanyPage.clickAddCompany();
  
    cy.wait('@getColumnThroughApi')
      .its('response')
      .then((response) => {
  
        expect(response.statusCode).to.eq(200);
  
        const excludedKeys = [
          'status',
          'safetyManagerName',
          'projectManagerName'
        ];
  
        const expectedLabels = response.body
          .filter(col => !excludedKeys.includes(col.key))
          .map(col => col.displayName);
  
          const selectors = [
            '.hover-hoc-container__label',
            'label',
            '.toggle-label'
          ];
          
          expectedLabels.forEach(label => {
            cy.get('body').then(($body) => {
          
              const exists = selectors.some(selector =>
                $body.find(`${selector}:contains("${label}")`).length > 0
              );
          
              expect(exists, `Missing label in UI: ${label}`).to.be.true;
          
            });
          });
  
      }); 
  });
  it('WorkForce-Company - Verify adding company with all fields filled', { 
    tags: ["Story:Add Company Full Fields", "Severity:critical", "UI", "API", "Module:WorkForce-Company","Module:WorkForce-Company"] 
  }, () => {
    let companyId
    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
    const companyData = generateCompanyData();
    addCompanyPage.clickAddCompany();
    addCompanyPage.fillAllFields(companyData);
    addCompanyPage.clickSubmit();
    cy.wait('@addCompany').then((interception) => {
      addCompanyPage.validateAddedCompanyData(interception, companyData);
    });
    addCompanyPage.verifyComapnyAddedSucessfully();
  });


  it('Adding company with worker uploading feature', () => {
    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');
  
    const companyData = generateCompanyData();
  
    addCompanyPage.clickAddCompany();
    addCompanyPage.fillMandatoryFields(companyData.companyName);
  
    cy.contains('button', 'Add more details').click();
    cy.contains('button', 'Add Worker').click();
  
    cy.fixture('testdata/companies/single_worker_valid.csv', 'base64').then(fileContent => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
        {
          fileContent,
          fileName: 'single_worker_valid.csv',
          mimeType: 'text/csv',
          encoding: 'base64'
        },
        { subjectType: 'drag-n-drop', force: true }
      );
    });
  
    addCompanyPage.clickSubmit();
    addCompanyPage.verifyComapnyAddedSucessfully();
  
    cy.wait('@addCompany').then((interception) => {
      const { request, response } = interception;
      expect(response.statusCode).to.eq(201);
      const responseBody = response.body;
      expect(responseBody.name).to.eq(companyData.companyName);
      expect(responseBody.workers).to.exist;
      expect(responseBody.workers.totalWorker).to.eq(1);
      expect(responseBody.status).to.eq('ACTIVE');
      expect(responseBody.projectId).to.exist;
    });
  });


});