// cypress/support/pages/generalDetails.js
import { workforceSelector } from "../../support/workforceSelector";


class GeneralDetailsPage {
  get searchInput() { 
    return cy.get(workforceSelector.searchInput) 
  }
  get companyname () { 
    return cy.get(workforceSelector.tableRow); 
  }
  get companyDocumentsPage(){
	return cy.get(workforceSelector.companyDocumentPage)
  }
  get documentTableHeaders() {
	return   cy.get(`[overflow="scroll"] ${workforceSelector.tableColumn}`); 
  }
  get licencesTab(){
	return cy.get(workforceSelector.licencesTab)
  }
  get AddCertificateButton(){
    return cy.get(workforceSelector.addCertificationButton)
  }
  get submitButton(){
    return cy.get(workforceSelector.submitButton)
  }

  get errorMessage() {
    return cy.get('[type="error"]')

  }

  get issueDateInput() {
    return cy.get('[placeholder="Issued Date"]');
  }

  get ExpiryDateInput() {
    return cy.get('[placeholder="Expiry Date"]');
  }
  get TodaysDate() {
    return cy.get(".rmdp-today").first();
  }
  get backButton(){
    return cy.get(workforceSelector.backButton)
  }

  get documentNameInput(){
    return cy.get('[name="documentType"]')
  }
  get documentOptions(){
    return cy.get('.select_item_container [role="button"]')
  }
  get credentialIDInput(){
    return cy.get('[name="credentialId"]')
  }
  
  get attachDocumentInput(){
   return cy.get(workforceSelector.dragAndDrop)
  }


 get documentRow(){
  return cy.get(workforceSelector.documentTableRow)
 }

 getExpiryDateValue() {
  return this.ExpiryDateInput.invoke('val').then(val => val.trim());
}

getCredentialIDValue() {
  return this.credentialIDInput.invoke('val').then(val => val.trim());
}

 





  verifyToastMessage(message) {
  cy.contains(message, { timeout: 10000 }).should('exist');
}



  


  VerifySidebarDocumentWarning({ companyName }) {
    cy.get('body').click(0, 0);
    this.openCompany(companyName);
    this.companyDocumentsPage
      .parent()
      .find('svg path[fill="#DF4242"]')
      .should('exist');
    }


   verifyExpiredDocumentWarning({credentialId, expiryDate, messageMatcher}) {
    cy.get('.cell-content')
      .contains(credentialId)
      .closest(workforceSelector.documentTableRow)
      .within(() => {
  

        cy.contains(expiryDate)
          .find('svg[fill="#DF4242"]')
          .should('exist');
  
        cy.contains(messageMatcher).should('exist');
  
      });
  }

  verifyExpiringSoonDocument({ credentialId, expiryDate, messageMatcher }) {
    cy.get('.cell-content')
      .contains(credentialId)
      .closest(workforceSelector.documentTableRow)
      .within(() => {
        cy.contains(expiryDate)
          .find('svg[fill="#DF4242"], svg[fill="#FFC107"]') // red 
          .should('exist');
  
        if (messageMatcher) {
          cy.contains(messageMatcher).should('exist');
        }
      });
  }


  attachDocument(filePath){
    cy.fixture(filePath, 'base64').then((fileContent) => {
			this.attachDocumentInput.attachFile(
			  {
				fileContent,
				fileName: 'file.pdf',
				mimeType: 'application/pdf',
			  },
			  { subjectType: 'drag-n-drop' }
			);
    })
  }

  typeCredentialID(credentialId){
    this.credentialIDInput.type(credentialId);
  }


selectRandomDocumentName(){
   cy.selectRandomOption('[name="documentType"]', '.select_item_container [role="button"]', 'document name');
  }



clickBackButton(){
  this.backButton.click();
}

  openExpiryDatePicker() {
    this.ExpiryDateInput.click();
  }



 openIssueDatePicker() {
    this.issueDateInput.click();
 }
  selectTodaysDate() {
    this.TodaysDate.click();
  }



  verifyErrorMessage(message) {
    this.errorMessage.contains(message).should('be.visible');
  }



clickAddCertificateButton(){
  this.AddCertificateButton.click();
}
clickSubmitButton(){
  this.submitButton.click();
}

  validateDocumentTableHeaders(headers = []) {
	cy.get(`[overflow="scroll"] ${workforceSelector.tableColumn}`)
	  .should('exist')
	  .then(($els) => {
		const texts = [...$els].map(el => el.innerText.trim());
  
		headers.forEach((header) => {
		  expect(
			texts,
			`Header "${header}" should be present`
		  ).to.include(header);
		});
	  });
  }
  getDocumentName({ rowIndex = 0 }) {
    return cy.get(workforceSelector.documentTableRow)
      .eq(rowIndex)
      .find('.cell-content')
      .invoke('text')
      .then(text => text.trim());
  }
  sendRenewalRequest({ rowIndex = 0 }) {
    cy.get(workforceSelector.documentTableRow)
      .eq(rowIndex)
      .find('.table_td')           // column containing action buttons
      .eq(4)                        // renewal button column
      .find('svg')                  // the icon itself
      .eq(0)
      .click();

  }

  validateRenewalEmail() {
    cy.task('getMostRecentEmail').then((email) => {
      if (!email) throw new Error("❌ NO EMAIL RECEIVED");
  
      const body = email.body
        .toLowerCase()
        .replace(/=\r\n/g, '')
        .replace(/\r\n/g, ' ')
        .replace(/=3d/g, '=')
        .replace(/=e2=80=8b/g, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
  
      const subject = email.subject.toLowerCase();
  
      expect(subject).to.include("document renewal request");
      expect(body).to.include("certificate has expired");
      expect(body).to.include("needs to be renewed");
      expect(body).to.include("contact your project manager");
  
      cy.log("✅ All email validations passed!");
    });
  }

  
openLisencesModule(){
	this.licencesTab.contains('Licences').click();
}
resetPageState() {
  cy.get('body').click(0,0)

}
  openCompany(companyName) {
    this.searchInput.clear().type(companyName);
	this.companyname.contains(companyName).click({ force: true });
  }

  openCompanyDocumentsPage(){
	this.companyDocumentsPage.click();
  }

  clickCancel() {
    this.cancelButton.click();
  }

  clickUpdate() {
    this.updateButton.click();
  }


  updateEmail(email) {
    cy.getWorkerField('E Mail')
    .scrollIntoView()
      .realHover()
      .find('svg')
      .should('be.visible')
      .click();
    workforceSelector.emailInput().click().clear().type(email);
  }

  updateAddress(address) {
    cy.getWorkerField('Address')
    .scrollIntoView()
      .realHover()
      .find('svg')
      .should('be.visible')
      .click();
    workforceSelector.addressInput().click().clear().type(address);
  }


  verifySuccessMessage(message) {
    this.successMessage.contains(message).should('be.visible');
  }

  verifyFieldValue(fieldName, value) {
    cy.getWorkerField(fieldName).should('have.text', value);
  }

  verifyGeneralDetailsVisible() {
    this.generalDetailsTitle.should('be.visible');
  }

  verifyGeneralDetailsNotVisible() {
    this.generalDetailsTitle.should('not.exist');
  }

  verifyEmailAndPhoneVisible() {
    cy.get('p span').then(($spans) => {
      const spanArray = [...$spans];
      
      const emailSpan = spanArray.find(el => el.innerText.includes('@'));
      const phoneSpan = spanArray.find(el => /\d{6,}/.test(el.innerText));

      if (emailSpan) {
        cy.log(`Email found: ${emailSpan.innerText}`);
        cy.wrap(emailSpan).should('be.visible');
      } else {
        cy.log('No email found');
      }

      if (phoneSpan) {
        cy.log(`Phone found: ${phoneSpan.innerText}`);
        cy.wrap(phoneSpan).should('be.visible');
      } else {
        cy.log('No phone number found');
      }
    });
  }

  validateTableMatchesDetails(fieldsToCheck) {
    let columnMap = {};
    let tableRowData = {};

    this.tableHeaders.then(($headers) => {
      $headers.each((i, el) => {
        const headerText = el.innerText.trim();
        if (fieldsToCheck.includes(headerText)) {
          columnMap[headerText] = i;
        }
      });

      cy.get(workforceSelector.tableRow).first().within(() => {
        Object.entries(columnMap).forEach(([field, index]) => {
          cy.get('.table_td').eq(index).invoke('text').then(text => {
            tableRowData[field] = text.trim();
          });
        });
      }).then(() => {
        this.openFirstCompany();

        Object.entries(tableRowData).forEach(([field, tableValue]) => {
          const expectedValue = tableValue === '' ? '-' : tableValue;
          this.verifyFieldValue(field, expectedValue);
          cy.log(` Field "${field}" validated: ${expectedValue}`);
        });
      });
    });
  }
}

export default new GeneralDetailsPage();