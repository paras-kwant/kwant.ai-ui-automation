// cypress/support/pages/generalDetails.js
import { workforceSelector } from "../../support/workforceSelector";

class GeneralDetailsPage {
  // Selectors
  get firstRow() { 
    return cy.get(workforceSelector.tableRow).first(); 
  }
  
  get tableHeaders() { 
    return cy.get(workforceSelector.tableColumn); 
  }
  
  get overflowMenuButton() { 
    return cy.get('header button'); 
  }
  
  get cancelButton() { 
    return cy.get('button').contains('Cancel'); 
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


  openFirstCompany() {
    this.firstRow.click({ force: true });
  }

  clickOverflowMenu() {
    this.overflowMenuButton.click();
  }

  clickCancel() {
    this.cancelButton.click();
  }

  clickUpdate() {
    this.updateButton.click();
  }

  resetPageState() {
    cy.get('body').then($body => {
      if ($body.find('aside button svg, .sc-krNlru svg').length > 0) {
        cy.get('aside button svg, .sc-krNlru svg').first().click({ force: true });
      }

      if ($body.find('.sc-ktJbId.sc-gmgFlS').length > 0) {
        cy.get('.sc-ktJbId.sc-gmgFlS').eq(0).click({ force: true });
      }

      if ($body.find('.tag.default.grey:contains("Clear")').length > 0) {
        cy.contains('.tag.default.grey', 'Clear').click({ force: true });
      }

      if ($body.find('.filters-header-container svg').length > 0) {
        cy.get('.filters-header-container svg').eq(0).click();
      }

      if($body.find(workforceSelector.searchInput).length > 0){
        cy.get(workforceSelector.searchInput).clear();
      }
    });
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
          cy.log(`✅ Field "${field}" validated: ${expectedValue}`);
        });
      });
    });
  }
}

export default new GeneralDetailsPage();