/// <reference types="cypress" />
import { workforceSelector } from '../../support/workforceSelector';
import companiesHelper from '../../support/helper/companiesHelper';
import addCompanyPage from '/cypress/pages/companies/addCompany';
import { generateCompanyData, generateWorkerData } from '../../fixtures/workerData';

describe("WorkForce Companies Module - Add Company", { tags: ["Epic:WorkForce", "Feature:Companies Module", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
    cy.cleanUI();
  });

  it('WorkForce-Company - shows error message when invalid phone number is entered while adding a company', { 
    tags: ["Story:Invalid Phone Number", "Severity:critical", "UI", "Module:WorkForce-Company"] 
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
    cy.wait(1000);
    addCompanyPage.uploadCompanyLogo('cypress/fixtures/demo.pdf');
    addCompanyPage.verifyErrorMessage('Image upload failed: Unsupported file type.');
  });

  it('Should show warning when adding existing Company', { 
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
    addCompanyPage.verifyVideoViewerVisible();
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
    cy.wait(1000);
    addCompanyPage.verifyVideoViewerNotVisible();
    addCompanyPage.retakePicture();
    addCompanyPage.verifyVideoViewerVisible();
  });

  it("WorkForce-Company - Verify that a company can be added with only the mandatory field filled.", { 
    tags: ["Story:Add Company Mandatory Fields", "Severity:critical", "UI", "API", "Module:WorkForce-Company"] 
  }, () => {
    const companyData = generateCompanyData();
    let companyId;

    cy.intercept('POST', '/api/projectTaskTrades').as('addCompany');

    addCompanyPage.clickAddCompany();
    cy.wait(1000);
    addCompanyPage.fillMandatoryFields(companyData.companyName);
    cy.wait(2000);
    addCompanyPage.clickSubmit();

    cy.wait('@addCompany').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      companyId = response.body.id || response.body.data?.id;
      expect(companyId).to.exist;
    });

    cy.get(workforceSelector.toastMessage)
      .should('be.visible')
      .and('contain.text', 'Company added successfully');
  });

  it('WorkForce-Company - Verify adding company while using the camera to capture logo', { 
    tags: ["Story:Add Company With Camera", "Severity:normal", "UI", "Module:WorkForce-Company"] 
  }, () => {
    addCompanyPage.clickAddCompany();
    cy.wait(1000);
    addCompanyPage.captureCompanyLogoWithCamera();
    addCompanyPage.verifyImageUploaded();
  });

  it('WorkForce-Company - Verify adding company with all fields filled', { 
    tags: ["Story:Add Company Full Fields", "Severity:critical", "UI", "API", "Module:WorkForce-Company","Module:WorkForce-Company"] 
  }, () => {
    const companyData = generateCompanyData();
    addCompanyPage.clickAddCompany();
    addCompanyPage.fillAllFields(companyData);
    addCompanyPage.clickSubmit();
  });

});