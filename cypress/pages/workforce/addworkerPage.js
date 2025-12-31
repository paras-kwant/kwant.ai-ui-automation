// cypress/pages/workforce/addWorkerPage.js
import { addWorkerSelector } from '../../selector/addWorker.js';
import { workforceSelector } from '../../support/workforceSelector';
import { generateWorkerData } from '../../fixtures/workerData.js';

class addworkerPage {
  
  openAddWorkerForm() {
    addWorkerSelector.addWorkerButton().click();
  }

  uploadProfileImage(fileName = 'profile.png') {
    addWorkerSelector.profileImageUploadButton().click();
    cy.get('#worker_image_uploader').selectFile(`cypress/fixtures/${fileName}`, { force: true });
  }

  verifyMandatoryButtonsAreDisabled() {
    addWorkerSelector.submitWorkerButton()
      .should('be.disabled');

    addWorkerSelector.addMoreDetail()
      .should('be.disabled');
  }

  fillMandatoryFields(workerData = generateWorkerData()) {
    addWorkerSelector.firstNameInput().type(workerData.firstName);
    addWorkerSelector.lastNameInput().type(workerData.lastName);
    cy.selectRandomOption('input[name="company"]', '.sc-tagGq[role="button"]', 'company');
    return workerData; 
  }

  fillPersonalDetails({ phone = '9779868757376', email = 'paras+45@kwant.ai', address = 'Kathmandu', zipcode = '44600', dob = '01/01/2001' } = {}) {
    addWorkerSelector.addMoreDetail().click();
    addWorkerSelector.phoneInput().type(phone);
    addWorkerSelector.emailInput().type(email);
    workforceSelector.addressInput().type(address);
    addWorkerSelector.zipcodeInput().type(zipcode);
    addWorkerSelector.dobInput().first().clear({ force: true }).type(dob, { force: true });
  }

  assertToastMessage(expectedText) {
    addWorkerSelector.toastMessage()
      .should('be.visible')
      .and('contain.text', expectedText);
  }

  fillWorkerName(workerData) {
    addWorkerSelector.firstNameInput()
      .clear()
      .type(workerData.firstName);
  
    addWorkerSelector.lastNameInput()
      .clear()
      .type(workerData.lastName);
  }

  uploadProfileImage(fileName = 'profile.png') {
    addWorkerSelector.profileImageUploadButton().click();
  
    cy.get('#worker_image_uploader').selectFile(
      `cypress/fixtures/${fileName}`,
      { force: true }
    );
  }
  
  

  submitWorker() {
    addWorkerSelector.submitWorkerButton().click();
    addWorkerSelector.toastMessage()
    .should('be.visible')
    .and('contain.text', ' Successfully added employee.').should('be.visible'); 
  }

}


export default new addworkerPage();
