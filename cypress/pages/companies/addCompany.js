// cypress/support/pages/addCompanyPage.js
import { workforceSelector } from "../../support/workforceSelector";
import { addWorkerSelector } from "../../selector/addWorker";

class AddCompanyPage {
  get addCompanyButton() {
    return cy.get('button p').contains('Add Company');
  }
  get companyNameInput() {
    return cy.get('input[placeholder="Enter Company Name"]');
  }
  get phoneNumberInput() {
    return cy.get('input[placeholder="Enter Phone Number"]');
  }
  get emailInput() {
    return cy.get('label').contains('E Mail').parent().find('input');
  }
  get addressInput() {
    return cy.get('label').contains('Address').parent().find('input');
  }
  get zipCodeInput() {
    return cy.get('label').contains('Zip Code').parent().find('input');
  }
  get submitButton() {
    return cy.get(workforceSelector.submitCompanyButton);
  }
  get fileUploadInput() {
    return cy.get('input[type="file"]', { timeout: 5000 });
  }
  get profileImageUploadButton() {
    return addWorkerSelector.profileImageUploadButton();
  }
  get takeAPictureButton() {
    return addWorkerSelector.takeAPictureButton();
  }
  get videoViewer() {
    return cy.get('video.video_viewer');
  }
  get captureButton() {
    return cy.get(workforceSelector.captureButton);
  }
  get submitPhotoButton() {
    return cy.get(workforceSelector.submitPhotoButton);
  }
  get backButton() {
    return cy.get(workforceSelector.backButton);
  }
  get retakePictureButton() {
    return cy.get('.retake_container p').contains('Retake Picture');
  }
  get toastMessage() {
    return cy.get(workforceSelector.toastMessage);
  }
  get workerAddedMessage(){
	return cy.get('[type="info"]')
  }
  get uploadedAvatar() {
    return cy.get('.upload-avatar img');
  }
  get cameraIcon() {
    return cy.get('.upload-button__camera-icon');
  }
  get uploadOptions() {
    return cy.get('.upload-button__upload-options__option');
  }
  get companyDocumentPage() {
    return cy.get(workforceSelector.companyDocumentPage);
  }
  get companyWorkerPage() {
    return cy.get(workforceSelector.companyWorkerPage);
  }
  get dragAndDropZone() {
    return cy.get(workforceSelector.dragAndDrop);
  }
  get certificatesDropdown() {
    return cy.get('[placeholder="Select Certificates"]');
  }
  get primaryTradeDropdown() {
    return cy.get('[placeholder="Select Primary Trade"]');
  }
  get companyBannerTab() {
    return cy.get('.label-active').contains('Company Banner').parent();
  }
  get addWorkerButton() {
    return cy.get('button p').contains('Add Worker');
  }

  clickAddCompany() {
    this.addCompanyButton.click();
  }

  enterCompanyName(name) {
    this.companyNameInput.type(name);
  }

  enterPhoneNumber(phone) {
    this.phoneNumberInput.type(phone);
  }

  enterEmail(email) {
    this.emailInput.type(email);
  }

  enterAddress(address) {
    this.addressInput.type(address);
  }

  enterZipCode(zipCode) {
    this.zipCodeInput.type(zipCode);
  }

  clickSubmit() {
    this.submitButton.click();
  }

  uploadCompanyLogo(filePath) {
    this.fileUploadInput.should('exist').selectFile(filePath, { force: true });
  }

  captureCompanyLogoWithCamera() {
    this.cameraIcon.click();
    this.uploadOptions.eq(1).click();
    this.videoViewer.should('be.visible');
    cy.wait(1000);
    this.captureButton.click();
    this.submitPhotoButton.click();
  }

  verifyImageUploaded() {
    this.uploadedAvatar
      .should('have.attr', 'src')
      .and('match', /^blob:/);
  }

  clickBackWhileCapturing() {
    this.backButton.click();
  }

  retakePicture() {
    this.retakePictureButton.should('be.visible').click();
  }

  verifyVideoViewerVisible() {
    this.videoViewer.should('be.visible');
  }

  verifyVideoViewerNotVisible() {
    this.videoViewer.should('not.exist');
  }

  verifyErrorMessage(message) {
    this.toastMessage.contains(message).should('be.visible');
  }

  verifySuccessMessage(message) {
    this.toastMessage.should('be.visible').and('contain.text', message);
  }

  selectCertificates() {
    cy.selectRandomOption(
      '[placeholder="Select Certificates"]',
      '.select_item_container [role="button"]',
      'certificatesName'
    );
  }

  selectPrimaryTrade() {
    cy.selectRandomOption(
      '[placeholder="Select Primary Trade"]',
      '.select_item_container [role="button"]',
      'primaryTradeName'
    );
  }

  navigateToDocumentTab() {
    this.companyBannerTab.click();
    this.companyDocumentPage.click();
  }

  addCertification(credentialId) {
    addWorkerSelector.addCertificationButton().click();
    cy.selectRandomOption(
      '[name="documentType"]',
      '.select_item_container [role="button"]',
      'documentType'
    );
    addWorkerSelector.credentialIdInput().type(credentialId);
    cy.get('[placeholder="Issued Date"]').click();
  }

  uploadDocument(fileContent, fileName, mimeType) {
    this.dragAndDropZone.attachFile(
      {
        fileContent,
        fileName,
        mimeType
      },
      { subjectType: 'drag-n-drop' }
    );
    addWorkerSelector.submitButton().click();
  }

  navigateToWorkerTab() {
    this.companyWorkerPage.click();
  }

  addWorkerFromCSV(csvPath) {
    this.addWorkerButton.click();
    this.dragAndDropZone.attachFile(
      {
        filePath: csvPath.replace('cypress/fixtures/', ''),
        mimeType: 'text/csv'
      },
      { subjectType: 'drag-n-drop', force: true }
    );
  }

  verifyWorkerAddedMessage(count) {
    this.workerAddedMessage
      .contains(`${count} worker(s) will be added.`)
      .should('be.visible');
  }

  fillMandatoryFields(companyName) {
    this.enterCompanyName(companyName);
    this.companyNameInput.should('have.value', companyName);
  }

  fillAllFields(companyData) {
    this.uploadCompanyLogo('cypress/fixtures/profile.png');
    this.enterEmail(companyData.email);
    this.enterCompanyName(companyData.companyName);
    this.enterZipCode(companyData.zipCode);
    this.selectCertificates();
    this.selectPrimaryTrade();
    this.enterPhoneNumber(companyData.phoneNumber);
    this.enterAddress(companyData.address);
  }
}

export default new AddCompanyPage();