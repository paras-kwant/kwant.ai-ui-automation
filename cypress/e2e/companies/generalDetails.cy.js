/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import generalDetailsPage from '/cypress/pages/companies/generalDetails'
import { generateRandomEmail, generateRandomWorldAddress } from '../../fixtures/workerData';

describe("Companies Module - General Details", () => {
  
  before(() => {
    cy.viewport(1440, 900);
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });

  beforeEach(() => {
    generalDetailsPage.resetPageState();
  });
  
  it('Verify company details card is displayed correctly on clicking overflow menu', () => {
    generalDetailsPage.openFirstCompany();
    generalDetailsPage.clickOverflowMenu();
    generalDetailsPage.verifyEmailAndPhoneVisible();
  });

  it('Clicking Cancel button closes the Details Drawer page', () => {
    generalDetailsPage.openFirstCompany();
    generalDetailsPage.verifyGeneralDetailsVisible();
    generalDetailsPage.clickCancel();
    generalDetailsPage.verifyGeneralDetailsNotVisible();
  });

  it('Validate table values match General Details card', () => {
    const fieldsToCheck = [
      'E Mail',
      'Address',
      'Primary Trade',
      'Zip Code',
      // 'Certificates',
      'Project Manager',
      'Safety Manager',
      'Phone Number',
      'Company Color',
      'Company Banner'
    ];

    generalDetailsPage.validateTableMatchesDetails(fieldsToCheck);
  });

  it('Update the company data and verify the changes persist', () => {
    const newEmail = generateRandomEmail();
    const newAddress = generateRandomWorldAddress();

    generalDetailsPage.openFirstCompany();
    
    generalDetailsPage.updateEmail(newEmail);
    generalDetailsPage.updateAddress(newAddress);
    
    cy.log(`✅ Generated Email: ${newEmail}`);
    cy.log(`✅ Generated Address: ${newAddress}`);

    generalDetailsPage.clickUpdate();
    generalDetailsPage.verifySuccessMessage('Company updated successfully');

    generalDetailsPage.openFirstCompany();
    generalDetailsPage.verifyFieldValue('E Mail', newEmail);
    generalDetailsPage.verifyFieldValue('Address', newAddress);
  });
});