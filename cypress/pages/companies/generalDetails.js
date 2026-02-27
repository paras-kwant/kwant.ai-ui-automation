// cypress/support/pages/generalDetails.js
import { workforceSelector } from "../../support/workforceSelector";

class GeneralDetailsPage {
  get firstRow() { 
    return cy.get(workforceSelector.tableRow).eq(0); 
  }
  get tableHeaders() { 
    return cy.get(workforceSelector.tableColumn); 
  }
  get threeDotMenu() { 
    return cy.get('header button'); 
  }
  get cancelButton() { 
    return cy.get(workforceSelector.cancelButton); 
  }
  get updateButton() { 
    return cy.get(workforceSelector.updateButton); 
  }
  get generalDetailsTitle() { 
    return cy.get('p').contains('General Details'); 
  }
  get successMessage() { 
    return cy.get(workforceSelector.toastMessage); 
  }
  





  resetPageState() {
    cy.get('body').click(0,0);
    cy.get(workforceSelector.searchInput).clear();

}
  openFirstCompany() {
    this.firstRow.click({ force: true });
  }

  clickThreeDotMenu() {
    this.threeDotMenu.click();
  }

  clickCancel() {
    this.cancelButton.click();
  }

  clickUpdate() {
    this.updateButton.click();
  }


  updateEmail(email) {
    cy.getWorkerField('E Mail')
      .find('svg')
      .should('exist')
      .click({force:true});
    workforceSelector.emailInput().click().clear().type(email);
  }

  updateAddress(address) {
    cy.getWorkerField('Address')
    .scrollIntoView()
      .find('svg')
      .should('exist')
      .click({force:true});
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
          columnMap[headerText] = i-1;
        }
      });

      cy.get(workforceSelector.tableRow).eq(0).within(() => {
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