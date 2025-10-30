/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';

describe("Worker Module - Documents Page", () => {

  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  it('Verify the UI of the document', () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get('p').contains('Documents').should('be.visible');
    workforceSelector.AddCertificationButton().should('be.visible');

    const headers = ['Type', 'Expiry Date', 'Credential ID', 'Actions'];

    cy.get('.sc-dhKdcB.gqyqmk').then(($els) => {
      const texts = [...$els].map(el => el.innerText.trim());
      headers.forEach(header => {
        expect(texts).to.include(header);
      });
    });

    cy.get('.sc-YysOf').contains('Licences').click();
    workforceSelector.AddLicenceButton().should('be.visible');
    
  const headerLicences = ['Type', 'Expiry Date', 'Credential ID', 'Actions'];

cy.get('.sc-dhKdcB.gqyqmk').then(($els) => {
  const texts = [...$els].map(el => el.innerText.trim());
  headerLicences.forEach(header => {
    expect(texts).to.include(header);
  });
});

  });

  it('Verify expired document shows red color for close date', () => {
    const credID = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    // Add Certification
    workforceSelector.AddCertificationButton().click();
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains('CA').click();
    cy.get('[name="credentialId"]').type(credID);

    // Set Dates
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('body').click()
    cy.get('[name="expiresInPeriods"]').click(); 
    cy.get('.sc-kdBSHD > :nth-child(2)').click();
    cy.get('input[type="number"]').type('2');


    // Upload document and submit
    cy.get('[placeholder="Expiry Date"]').invoke('val').then((expiryDate) => {
      cy.fixture('file.pdf', 'base64').then(fileContent => {
        cy.get('.sc-gObJpS').attachFile(
          { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
          { subjectType: 'drag-n-drop' }
        );
      });

      cy.get('button > p').contains('Submit').click({ force: true });

      // Validate red SVG for expiry
      cy.get('.cell-content')
        .contains(credID)
        .closest('.sc-cRmqLi')
        .within(() => {
          cy.contains(expiryDate)
            .find('svg[fill="#DF4242"]')
            .should('exist');
        });
    });

    cy.get('.sc-jXbUNg.gDlPVv')
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should('exist');
  });

  it('Deleting a certificate', () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get('.sc-jXbUNg.gDlPVv'
    )
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should('exist');

    cy.get('.sc-cRmqLi.bpifwg')
      .eq(0)
      .find('.cell-content')
      .invoke('text')
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get('.sc-cRmqLi.bpifwg')
          .eq(0)
          .find('.sc-jXbUNg.jnXMtv')
          .eq(1)
          .click();

        cy.contains('button p', 'Delete').click({ force: true });
        workforceSelector.toastMessage()
          .contains('Successfully deleted document.')
          .should('be.visible');

        cy.wait(2000);

        cy.get('body').then(($body) => {
          const rows = $body.find('.sc-cRmqLi.bpifwg');
          if (rows.length > 0) {
            cy.get('.sc-cRmqLi.bpifwg .cell-content').should('not.contain.text', docText);

            
            cy.get('body').then(($body) => {
              const hasRedSvg = $body.find('.cell-content svg[fill="#DF4242"]').length > 0;
              if (hasRedSvg) {
                cy.log('🔴 Red SVG found in .cell-content — verifying lower one exists');
                cy.get('.sc-jXbUNg.gDlPVv')
                  .eq(4)
                  .find('svg path[fill="#DF4242"]')
                  .should('exist');
              } else {
                cy.get('.sc-jXbUNg.gDlPVv')
                .eq(4)
                .find('svg path[fill="#DF4242"]')
                .should('not.exist');
                
              }
            });

          } else {
            cy.log('✅ No rows exist — document list is empty (deletion confirmed)');
            cy.get('.sc-jXbUNg.gDlPVv')
              .eq(4)
              .find('svg path[fill="#DF4242"]')
              .should('not.exist');
          }
        });
      });
  });


  it('Verify expired licence shows red color for close date', () => {
    const credID = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();
    cy.wait(4000)

    // Add Licence
     cy.get('.sc-YysOf').contains('Licences').click();
     workforceSelector.AddLicenceButton().click({force:true})
    cy.get('[name="documentType"]').click();
    cy.get('[role="button"]').contains('Training').click();
    cy.get('[name="credentialId"]').type(credID);

    // Set Dates
    cy.get('[placeholder="Issued Date"]').click();
    cy.get('[placeholder="Expiry Date"]').click();
    cy.get('.sd:visible').first().click({force:true});


    cy.get('[placeholder="Expiry Date"]').invoke('val').then((expiryDate) => {

      cy.fixture('file.pdf', 'base64').then(fileContent => {
        cy.get('.sc-gObJpS').attachFile(
          { fileContent, fileName: 'file.pdf', mimeType: 'application/pdf' },
          { subjectType: 'drag-n-drop' }
        );
      });

      cy.get('button > p').contains('Submit').click({ force: true });

      // Validate red SVG for expiry
      cy.get('.cell-content')
        .contains(credID)
        .closest('.sc-cRmqLi.bpifwg')
        .within(() => {
          cy.contains(expiryDate)
            .find('svg[fill="#DF4242"]')
            .should('exist');
        });
    });

    cy.get('.sc-jXbUNg.gDlPVv')
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should('exist');
  });

  it('Deleting a certificate', () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.DocumentsPage().click();

    cy.get('.sc-jXbUNg.gDlPVv')
      .eq(4)
      .find('svg path[fill="#DF4242"]')
      .should('exist');
      cy.get('.sc-YysOf').contains('Licences').click();

    cy.get('.sc-cRmqLi.bpifwg')
      .eq(0)
      .find('.cell-content')
      .invoke('text')
      .then((documentName) => {
        const docText = documentName.trim();
        cy.log(`Deleting document: ${docText}`);

        cy.get('.sc-cRmqLi.bpifwg')
          .eq(0)
          .find('.sc-jXbUNg.jnXMtv')
          .eq(1)
          .click();

        cy.contains('button p', 'Delete').click({ force: true });
        workforceSelector.toastMessage()
          .contains('Successfully deleted document.')
          .should('be.visible');

        cy.wait(2000);

        cy.get('body').then(($body) => {
          const rows = $body.find('.sc-cRmqLi.bpifwg');
          if (rows.length > 0) {
            cy.get('.sc-cRmqLi.bpifwg .cell-content').should('not.contain.text', docText);

            
            cy.get('body').then(($body) => {
              const hasRedSvg = $body.find('.cell-content svg[fill="#DF4242"]').length > 0;
              if (hasRedSvg) {
                cy.log('🔴 Red SVG found in .cell-content — verifying lower one exists');
                cy.get('.sc-jXbUNg.gDlPVv')
                  .eq(4)
                  .find('svg path[fill="#DF4242"]')
                  .should('exist');
              } else {
                cy.get('.sc-jXbUNg.gDlPVv')
                .eq(4)
                .find('svg path[fill="#DF4242"]')
                .should('not.exist');
                
              }
            });

          } else {
            cy.log('✅ No rows exist — document list is empty (deletion confirmed)');
            cy.get('.sc-jXbUNg.gDlPVv')
              .eq(4)
              .find('svg path[fill="#DF4242"]')
              .should('not.exist');
          }
        });
      });
  });

});
