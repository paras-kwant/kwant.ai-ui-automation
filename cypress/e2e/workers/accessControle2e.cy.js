/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import { addWorkerSelector } from "../../selector/addWorker.js";


Cypress.Commands.add('closeUploadDownloadDrawerIfOpen', () => {
  cy.wait(1000)
  cy.get('body').then(($body) => {
    const $icon = $body.find('.sc-krNlru svg, aside button');

    if ($icon.length === 0) {
      cy.log('Drawer icon not found');
      return;
    }
    if (!$icon.is(':visible')) {
      cy.log('Drawer icon found but not visible');
      return;
    }
    cy.wrap($icon).click({ force: true });
  });
});

describe("Worker Module e2e - Access Control Page Tests", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains('JCI - HQ turnstile')
        .click();
    });
    cy.visit(`/projects/106553747/workers`)
  });

  beforeEach(() => {
    cy.cleanUI()
  });
  beforeEach(() => {
    cy.closeUploadDownloadDrawerIfOpen();
  });
  it("Should display red tag when an invalid picture is uploaded", () => {
    cy.get(workforceSelector.searchInput).type('aaron ashton')
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible')
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

    addWorkerSelector.profileImageUploadButton().click();
    cy.wait(2000)
    addWorkerSelector.takeAPictureButton().click();
    cy.wait(2000)
    addWorkerSelector.clickPictureButton().click();
    addWorkerSelector.submitPhotoButton().click();
    cy.get('.upload-avatar img')
      .should('have.attr', 'src')
      .and('not.contain', 'https://uat.kwant.ai/assets/personbg-2f058cfa');
    cy.get('button p').contains('Update').click()
    cy.get('body').click(0, 0);
    workforceSelector.toastMessage()
    .should('contain.text', 'Successfully updated employee');
    cy.reload()
    cy.get(workforceSelector.searchInput).type('aaron ashton')
  

    cy.get(workforceSelector.tableRow).eq(0).within(() => {
        cy.get('.table_td .sc-ecPEgm')
        .find('.tag.default.error')
        .should('exist');
      
    })
  });

  it('Should display green tag when a valid profile image is uploaded', ()=>{
    cy.get(workforceSelector.searchInput).type('aaron ashton')
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible')
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/aaron.png', { force: true });
    cy.get('button p').contains('Update').click()
    cy.get('body').click(0, 0);
    workforceSelector.toastMessage()
    .should('contain.text', 'Successfully updated employee');
    cy.reload()
    cy.get(workforceSelector.searchInput).type('aaron ashton')
  

    cy.get(workforceSelector.tableRow).eq(0).within(() => {
        cy.get('.table_td .sc-ecPEgm')
        .find('.tag.default.success')
        .should('exist');
      
    })
  })
  it("Should validate NFC tag color for each worker row based on NFC value", () => {
    cy.wait(5000)
    cy.get(workforceSelector.tableRow).each(($row) => {

      cy.wrap($row).click({ force: true });
      workforceSelector.AccessControl().click();
  
      cy.getWorkerField('NFC')
        .invoke('text')
        .then((nfcText) => {
          const value = nfcText.trim();
          cy.log(`NFC Text: ${value || '(empty)'}`);
  
          // Check tag color for this row
          if (value === '-' || value === '') {
            cy.wrap($row)
              .find('.sc-ecPEgm.kVJnXL .tag.default.error')
              .should('exist');
          } else {
            cy.wrap($row)
              .find('.sc-ecPEgm.kVJnXL .tag.default.success')
              .should('exist');
          }
        });
  
      cy.get('body').click(0, 0);
    });
  });


  it("Should show red device tag when the device is not assigned to the worker", () => {
    cy.get(workforceSelector.searchInput).type('aaron ashton');
  
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
  
    workforceSelector.AccessControl().click();
  
    // Disable worker (double click as required by UI)
    cy.contains("button p", "Disable").click();
    cy.contains("button p", "Disable").click();
  
    workforceSelector.toastMessage()
      .should("contain.text", "Worker disabled successfully");
  
    // Get NFC text
    cy.getWorkerField('NFC')
      .invoke('text')
      .then((nfcText) => {
        const value = nfcText.trim();
        cy.log(`NFC Text: ${value || '(empty)'}`);
  
        if (value === '-' || value === '') {
          // 🔴 Device should be RED
          cy.get('.sc-ecPEgm.kVJnXL .tag.default.error')
            .should('exist');
        } else {
          // 🟢 Device should be GREEN
          cy.get('.sc-ecPEgm.kVJnXL .tag.default.success')
            .should('exist');
        }
      });
  });

  it("Should assign a valid device to the worker and display sync instructions", ()=>{

    cy.get(workforceSelector.searchInput).type('aaron ashton');
  
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.AccessControl().click();
    cy.get(".hover-hoc-container__input__display-value")
    .eq(0)
    .realHover()
    .find("svg")
    .first()
    .should("be.visible")
    .click();
    cy.get('[placeholder="Select Device"]').click();
    cy.get('.sc-tagGq[role="button"]').click()
    cy.get('button p').contains('Update').click()
    workforceSelector.toastMessage().should("contain", "Press and hold the Kwant logo on the badge for 5 seconds to power it on.");

  })

  it("Should display correct tooltip messages for error device tags", () => {
    cy.visit('https://uat.kwant.ai/projects/70249341/workers')
    cy.wait(4000)
  
    const expectedMessages = [
      'The device is not yet synced to the BOSK Mock',
      'This Device does not have NFC.',
    ]
  
    cy.get('.tag.default.error')
      .should('have.length.at.least', 1)
      .each(($tag, index) => {
        // First, ensure no tooltips are visible
        cy.get('body').realHover({ position: 'topLeft' })
        cy.wait(300)
        
        // Now hover over the tag
        cy.wrap($tag).realHover()
        
        cy.get('.tooltip-content:visible', { timeout: 5000 })
          .should('have.length', 1)
          .first()
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim()
            cy.log(`Tooltip ${index + 1}: "${trimmedText}"`)
            
            const hasExpectedText = expectedMessages.some(msg => 
              trimmedText.includes(msg)
            )
            
            if (!hasExpectedText) {
              cy.log(`⚠️ Unexpected tooltip: "${trimmedText}"`)
            }
            
            expect(hasExpectedText, 
              `Expected tooltip to contain one of the expected messages.\nActual text: "${trimmedText}"`
            ).to.be.true
          })
      })
  })
  
})
