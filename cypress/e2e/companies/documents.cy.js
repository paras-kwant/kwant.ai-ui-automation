/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';
import documents from '../../pages/companies/documents';
import { generateCredentialID } from '../../fixtures/workerData';

describe("Companies Module - Documents Page", () => {

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

    cy.cleanUI()
  });
  



  it("Verify the UI of the company documents page", () => {
    documents.openCompany('AutoQA Labs');
	documents.openCompanyDocumentsPage()
    cy.get("p").contains("Documents").should("be.visible");
    cy.get('button').contains('Add Certification').should("be.visible"); 
    const headers = ["Type", "Expiry Date", "Credential ID", "Actions"];
    documents.validateDocumentTableHeaders(headers);
    documents.openLisencesModule()
    cy.get('button').contains('Add Licence').should("be.visible");
    documents.validateDocumentTableHeaders(headers);
  });

  it("Validate the UI of the company document form", () => {
  documents.openCompany('AutoQA Labs');
  documents.openCompanyDocumentsPage()
   documents.clickAddCertificateButton();
   documents.clickSubmitButton();
   documents.verifyErrorMessage('A document name is required.');
   documents.openIssueDatePicker();
   documents.selectTodaysDate();
   documents.openExpiryDatePicker();
   documents.selectTodaysDate()
   documents.clickBackButton();
  cy.get("p").contains("Documents").scrollIntoView().should("be.visible");
  });



  it('Verify that updating the company details and adding the documents and then refreshing the page should redirect to the company list page without saving', () => {
  documents.openCompany('AutoQA Labs');
  documents.openCompanyDocumentsPage()
  documents.clickAddCertificateButton();
  documents.openIssueDatePicker();
  documents.selectTodaysDate();
  documents.openExpiryDatePicker();
  documents.selectTodaysDate()
  cy.reload();
  cy.get(workforceSelector.addCompanyButton).should('be.visible');
  });



  it("Displays red warning icon for company documents expired or expiring today",() => {
    const credentialId = generateCredentialID();
    documents.openCompany('AutoQA Labs');
    documents.openCompanyDocumentsPage()
    documents.clickAddCertificateButton();
    documents.selectRandomDocumentName();
    documents.typeCredentialID(credentialId);
    documents.openIssueDatePicker();
    documents.selectTodaysDate();
    documents.openExpiryDatePicker();
    cy.get(".sd:visible").first().click({ force: true });

    documents.getExpiryDateValue().as('expiryDate');
    documents.getCredentialIDValue().as('credentialId');

		documents.attachDocument('file.pdf');
		cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible');
    documents.clickSubmitButton();
    cy.get(workforceSelector.documentTableRow).should('be.visible')
    
    cy.get('@credentialId').then((id) => {
    cy.get('@expiryDate').then((expiryDate) => {
      documents.verifyExpiredDocumentWarning({
        credentialId: id,
        expiryDate,
        messageMatcher: 'Expiry Date has ended. Please upload new certificate.'
      });
      cy.get('body').click(0, 0);
      cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
      cy.get(workforceSelector.companyDocumentPage).parent()
        .find('svg path[fill="#DF4242"]')
        .should('exist');
    })
    });
  });



  

  it('Should update an existing company certificate', () => {
    documents.openCompany('AutoQA Labs');
    documents.openCompanyDocumentsPage();
    cy.get(workforceSelector.documentTableRow)
      .eq(0)
      .find(".cell-content")
      .eq(2)
      .invoke("text")
      .then((originalCred) => {
        const origCred = originalCred.trim();
        cy.log(`Original Credential ID: ${origCred}`);

        cy.get(workforceSelector.documentTableRow).eq(0).click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .find('svg')
          .invoke('show')
          .click({ force: true });

        cy.get('[placeholder="Select Expiry date"]')
          .clear({ force: true })
          .type('11/06/2026');
        cy.get('body').click();

        cy.get('.hover-hoc-container__input__display-value')
          .eq(3)
          .should('contain.text', '11/06/2026')
          .invoke('text')
          .then((newDate) => {
            const updatedDate = newDate.trim();
            cy.log(`Updated Expiry Date: ${updatedDate}`);

            cy.contains('button p', 'Update').click();

            documents.verifyToastMessage('Document updated successfully');

            cy.wait(1000);

            cy.get(workforceSelector.tableRow).then($allRows => {
              let matchingIndex = -1;
              $allRows.each((index, row) => {
                const credId = Cypress.$(row).find('.cell-content').eq(2).text().trim();
                if (credId === origCred) {
                  matchingIndex = index;
                  return false;
                }
              });

              cy.log(`Found matching row at index: ${matchingIndex}`);

              cy.get(workforceSelector.tableRow)
                .eq(matchingIndex)
                .scrollIntoView()
                .should('be.visible');

              cy.get(workforceSelector.tableRow)
                .eq(matchingIndex)
                .find('.cell-content')
                .eq(1)
                .scrollIntoView()
                .should('be.visible')
                .should('contain.text', updatedDate);
            });
          });
      });
  });



  it('Send request renewal to the company', () => {
    documents.openCompany('AutoQA Labs');
    documents.openCompanyDocumentsPage();
    documents.getDocumentName({ rowIndex: 0 }).then((docName) => {
      cy.log(`Document name: ${docName}`);
      documents.sendRenewalRequest({ rowIndex: 0 });

      cy.wait(1000)
      documents.verifyToastMessage('Renewal request sent successfully')
      cy.wait(7000);
      documents.validateRenewalEmail();
    });
  });
  
  it("Displays Yellow warning icon for company documents expiring within 7 days", () => {

    const credentialId = generateCredentialID();
    const d = new Date();
  d.setDate(d.getDate() + 4);

  const expiryDate = 
    String(d.getMonth() + 1).padStart(2, '0') + '/' +
    String(d.getDate()).padStart(2, '0') + '/' +
    d.getFullYear();
  
    documents.openCompany('AutoQA Labs');
    documents.openCompanyDocumentsPage();
    documents.clickAddCertificateButton();
    documents.selectRandomDocumentName();
    documents.typeCredentialID(credentialId);
    documents.openIssueDatePicker();
    documents.selectTodaysDate();
    documents.openExpiryDatePicker();
    cy.get('[placeholder="Expiry Date"]').type(expiryDate);

    documents.getExpiryDateValue().as('expiryDate');
    documents.getCredentialIDValue().as('credentialId');
  
    documents.attachDocument('file.pdf');
    cy.get('iframe[src^="blob:https://uat.kwant.ai"]').should('be.visible');
  
    documents.clickSubmitButton();
    cy.get('@credentialId').then((id) => {
      cy.get('@expiryDate').then((expiryDate) => {
  
    documents.verifyExpiringSoonDocument({
      credentialId: id,
      expiryDate,
      messageMatcher: "Expiry Date ends soon. Please upload new certificate."
    });

    cy.get('body').click(0, 0);

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.companyDocumentPage).parent()
      .find('svg path[fill="#DF4242"]')
      .should('exist');
  })
})
  });

  it("Deleting a company certificate", () => {
    documents.openCompany('AutoQA Labs');
    documents.openCompanyDocumentsPage();


    cy.get(workforceSelector.documentTableRow)
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);
        cy.get(workforceSelector.documentTableRow) 
        .eq(0)
       .find('.table_td') 
        .eq(4) //
         .find('svg').eq(1).click(); 
        cy.contains("button p", "Delete").click({ force: true });

      documents.verifyToastMessage('Successfully deleted document.')

        cy.wait(2000);

        cy.get("body").then(($body) => {
          const rows = $body.find(workforceSelector.documentTableRow);

          if (rows.length > 0) {

            cy.get(`${workforceSelector.documentTableRow} .cell-content`)
              .should("not.contain.text", docText)
              .then(() => {
                const hasRedSvg = $body.find('.cell-content svg[fill="#DF4242"]').length > 0;

                if (hasRedSvg) {
                  cy.log("🔴 Red SVG found — verifying lower icon exists");
                  cy.get(workforceSelector.companyDocumentPage)
                  .parent()
                    .find('path[fill="#DF4242"]')
                    .should("exist");
                } else {
                  cy.log('No svg found');
                }
              });
          } else {
            cy.log("✅ No rows exist — document list is empty (deletion confirmed)");
            cy.get(workforceSelector.companyDocumentPage)
              .parent()
              .find('path[fill="#DF4242"]')
              .should("not.exist");
          }
        });
      });
  });

  it("Verify expired company licence shows red color for close date", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()

    cy.get(workforceSelector.licencesTab).click();
    cy.get('button').contains('Add Licence').click({ force: true });

    cy.get('[name="documentType"]').click();

    cy.get('[role="button"]').contains("sd").click();
    cy.get('[name="credentialId"]').type(credID);

    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[placeholder="Expiry Date"]').click();
    cy.get(".sd:visible").first().click({ force: true });

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .then((expiryDate) => {
        cy.fixture("file.pdf", "base64").then((fileContent) => {
          cy.get(workforceSelector.documentUploadInput).attachFile(
            { fileContent, fileName: "file.pdf", mimeType: "application/pdf" },
            { subjectType: "drag-n-drop" }
          );
        });

        cy.get(workforceSelector.submitButton).click({ force: true });

        cy.get(".cell-content")
          .contains(credID)
          .closest(workforceSelector.tableRow)
          .within(() => {
            cy.contains(expiryDate).find('svg[fill="#DF4242"]').should("exist");
          });
      });
    
    cy.get('body').click(0, 0);
	cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).parent()
      .find('svg path[fill="#DF4242"]')
      .should("exist");
  });

  it("Deleting a company licence", () => {
    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()

    cy.get(workforceSelector.licencesTab).click();

    cy.get(workforceSelector.documentTableRow)
      .eq(0)
      .find(".cell-content")
      .invoke("text")
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get(workforceSelector.documentTableRow)
        .parent().find('.table_td').eq(4).find('svg').eq(1).click()

        cy.contains("button p", "Delete").click({ force: true });
        cy.get(workforceSelector.toastMessage)
          .contains("Successfully deleted document.")
          .should("be.visible");

        cy.wait(2000);

        cy.get("body").then(($body) => {
          const rows = $body.find(".sc-eWzREE.bpifwg");
          if (rows.length > 0) {
            cy.get(".sc-eWzREE.bpifwg .cell-content").should(
              "not.contain.text",
              docText
            );

            cy.get("body").then(($body) => {
              const hasRedSvg =
                $body.find('.cell-content svg[fill="#DF4242"]').length > 0;
              if (hasRedSvg) {
                cy.log(
                  "🔴 Red SVG found in .cell-content — verifying lower one exists"
                );
				cy.get(workforceSelector.companyDocumentPage)
                  .find('svg path[fill="#DF4242"]')
                  .should("exist");
              } else {
				cy.get(workforceSelector.companyDocumentPage)
                  .find('svg path[fill="#DF4242"]')
                  .should("not.exist");
              }
            });
          } else {
            cy.log(
              "✅ No rows exist — document list is empty (deletion confirmed)"
            );
          }
        });
      });
  });

  it("Adding company document with invalid file type", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()

    cy.get('button').contains('Add Certification').click();

        cy.fixture("backup.csv", "base64").then((fileContent) => {
          cy.get(workforceSelector.dragAndDrop).attachFile(
            { fileContent, fileName: "backup.csv", mimeType: "text/csv" },
            { subjectType: "drag-n-drop" }
          );

        cy.get(workforceSelector.submitButton).click({ force: true });
        cy.get(workforceSelector.toastMessage).should("contain", "File type unsupported");
      });
  });

  it("Should not allow adding company document which expiry date is already done", () => {
    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()
    cy.get('button').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });

  it("Should not allow adding company document which expiry date is older than issued date", () => {
    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()

    cy.get('button').contains('Add Certification').click();

    cy.get('[placeholder="Issued Date"]').click();
    cy.get(".rmdp-today").first().click();

    cy.get('[placeholder="Expiry Date"]').click();

    cy.get(".rmdp-day")
      .filter(".rmdp-disabled")
      .should("exist");

    cy.get(".rmdp-day.rmdp-disabled").first().click({ force: true });
    cy.get('header p').contains('Add Certification').click();

    cy.get('[placeholder="Expiry Date"]')
      .invoke("val")
      .should("eq", "");
  });



  it("Should not save company document when modal is closed without submitting", () => {
    const credID = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	cy.get(workforceSelector.companyDocumentPage).click()

    cy.get("body").then(($body) => {
      cy.get('button').contains('Add Certification').click();
      cy.selectRandomOption('[name="documentType"]', '.select_item_container [role="button"]', 'documentType');
      cy.get('[name="credentialId"]').type(credID);
      cy.get('[placeholder="Issued Date"]').click();
      cy.get(".rmdp-today").first().click();

      cy.get("body").click(0, 0);
      cy.get("body").should("not.contain", credID);
    });
  });

  it("Download uploaded company document - validate downloaded file name", () => {
    cy.get(workforceSelector.searchInput).clear().type('AutoQA Labs')
    cy.get(workforceSelector.tableRow).contains('AutoQA Labs').click({ force: true });
	  cy.get(workforceSelector.companyDocumentPage).click()
  
    cy.get(workforceSelector.documentTableRow)
      .eq(0)
      .click({ force: true });
  
    cy.get('iframe', { timeout: 30000 })
      .filter('[src*="s3"], [src*="cloudfront"]')
      .should('have.length.greaterThan', 0)
      .first()
      .invoke('attr', 'src')
      .then((src) => {
        const fileName = decodeURIComponent(src.split('/').pop());
        cy.log(`Expected filename from URL: ${fileName}`);
		cy.get('.sc-aXZVg.cjAzbF button')
  .eq(0)
  .scrollIntoView()  // scrolls vertically to bring it into view
  .click();          // normal 
  
        cy.contains('p', 'Download')
          .should('be.visible')
          .click({force: true});
  
        const downloadsFolder = Cypress.config('downloadsFolder');
        const filePath = path.join(downloadsFolder, fileName);
  
        cy.readFile(filePath, { timeout: 20000 }).should('exist');
      });
  });

  it("Editing the existing company document and add a jpeg document", () => {
    documents.openCompany('AutoQA Labs')
    documents.openCompanyDocumentsPage()
    cy.get(workforceSelector.documentTableRow).eq(0).click();

    cy.get(workforceSelector.removeButton).click()
    cy.fixture("document.jpg", "base64").then((fileContent) => {
      cy.get(workforceSelector.dragAndDrop).attachFile(
        { fileContent, fileName: "document.jpg", mimeType: "image/jpeg" },
        { subjectType: "drag-n-drop" }
      );
    });
    cy.get('img[src^="blob:https://uat.kwant.ai"]')
      .scrollIntoView()
      .should('be.visible');
  });

});