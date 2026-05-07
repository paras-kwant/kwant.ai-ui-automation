/// <reference types="cypress" />

import companiesHelper from '../../support/helper/companiesHelper';
import generalDetailsPage from '/cypress/pages/companies/generalDetails'
import { generateRandomEmail, generateRandomWorldAddress } from '../../fixtures/generateData';

describe("WorkForce Companies Module - General Details", { tags: ["Epic:WorkForce", "Feature:GeneralDetails", "Module:WorkForce-Company"] }, () => {

  beforeEach(() => {
    cy.loginAndVisit(() => companiesHelper.visitCompaniesPage('500526306'));
    cy.cleanUI();
  });

  it('WorkForce-Company - Verify company details card is displayed correctly on clicking overflow menu', { tags: ["Story:Company Details Card Overflow Menu", "Severity:critical", "UI", "Module:WorkForce-Company"] }, () => {
    generalDetailsPage.openFirstCompany();
    generalDetailsPage.clickThreeDotMenu();
    generalDetailsPage.verifyEmailAndPhoneVisible();
  });

  it('WorkForce-Company - Clicking Cancel button closes the Details Drawer page', { tags: ["Story:Cancel Closes Details Drawer", "Severity:normal", "UI", "Module:WorkForce-Company"] }, () => {
    generalDetailsPage.openFirstCompany();
    generalDetailsPage.verifyGeneralDetailsVisible();
    generalDetailsPage.clickCancel();
    generalDetailsPage.verifyGeneralDetailsNotVisible();
  });

  it('WorkForce-Company - Validate table values match General Details card', { tags: ["Story:Table Values Match General Details", "Severity:critical", "UI", "@smoke"] }, () => {
    cy.wait(2000);
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

  it('WorkForce-Company - Update the company data and verify the changes persist', { tags: ["Story:Update Company Data Persists", "Severity:critical", "UI", "@smoke"] }, () => {
    const newEmail = generateRandomEmail();
    const newAddress = generateRandomWorldAddress();

    generalDetailsPage.openFirstCompany();
    generalDetailsPage.updateEmail(newEmail);
    generalDetailsPage.updateAddress(newAddress);
    cy.log(`Generated Email: ${newEmail}`);
    cy.log(`Generated Address: ${newAddress}`);
    generalDetailsPage.clickUpdate();
    generalDetailsPage.verifySuccessMessage('Company updated successfully');
    generalDetailsPage.openFirstCompany();
    generalDetailsPage.verifyFieldValue('E Mail', newEmail);
    generalDetailsPage.verifyFieldValue('Address', newAddress);
  });

});