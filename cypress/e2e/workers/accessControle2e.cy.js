/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from '../../support/helper/workerHelper.js';
import { addWorkerSelector } from "../../selector/addWorker.js";
import accessControle2e from "../../pages/workforce/accessControle2e.js";


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
  it("Should display red tag when an invalid picture is uploaded", () => {
    cy.get(workforceSelector.searchInput).clear().type('aaron ashton')
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible').click({force:true})

    addWorkerSelector.profileImageUploadButton().click();
    cy.wait(2000)
    addWorkerSelector.takeAPictureButton().click();
    cy.wait(2000)
    accessControle2e.captureAndSubmitPhoto()
    cy.get('.upload-avatar img')
      .should('have.attr', 'src')
      .and('not.contain', 'https://uat.kwant.ai/assets/personbg-2f058cfa');
    cy.get('button p').contains('Update').click()
    cy.get('body').click(0, 0);
    cy.get(workforceSelector.toastMessage).contains('Successfully updated worker').should('be.visible')
    cy.reload()
    cy.get(workforceSelector.searchInput).clear().type('aaron ashton')
  

    cy.get(workforceSelector.tableRow).eq(0).within(() => {
        cy.get('.table_td')
        .find('.tag.default.error')
        .should('exist');
      
    })
  });

  it('Should display green tag when a valid profile image is uploaded', ()=>{
    cy.get(workforceSelector.searchInput).clear().type('aaron ashton')
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible')
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });

    cy.get('.upload-button__camera-icon').click();
    cy.get('#worker_image_uploader').selectFile('cypress/fixtures/aaron.png', { force: true });
    cy.get('button p').contains('Update').click()
    cy.get('body').click(0, 0);
    cy.get(workforceSelector.toastMessage).contains('Successfully updated worker').should('be.visible')

    cy.reload()
    cy.get(workforceSelector.searchInput).clear().type('aaron ashton')
  

    cy.get(workforceSelector.tableRow).eq(0).within(() => {
        cy.get('.table_td')
        .find('.tag.default.success')
        .should('exist');
      
    })
  })
  it("Should validate NFC tag color for each worker row based on NFC value", () => {
    cy.wait(2000)
    cy.get(workforceSelector.tableRow).each(($row) => {

      cy.wrap($row).click({ force: true });
      cy.wait(1000)
      cy.get(workforceSelector.accessControlPage).click();
  
      cy.getWorkerField('NFC')
        .invoke('text')
        .then((nfcText) => {
          const value = nfcText.trim();
          cy.log(`NFC Text: ${value || '(empty)'}`);
  
          // Check tag color for this row
          if (value === '-' || value === '') {
            cy.wrap($row)
              .find('.tag.default.error')
              .should('exist');
          } else {
            cy.wrap($row)
              .find('.tag.default.success')
              .should('exist');
          }
        });
  
      cy.get('body').click(0, 0);
    });
  });

  it("Should show red device tag when the device is not assigned to the worker", () => {
    cy.get(workforceSelector.searchInput).clear().type('aaron ashton');
  
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
  
    cy.get(workforceSelector.accessControlPage).click();
  
    // Check if a device is already assigned by looking at the device field value
    cy.get(".hover-hoc-container__input__display-value")
      .eq(0)
      .invoke('text')
      .then((deviceText) => {
        const deviceValue = deviceText.trim();
        cy.log(`Device value: ${deviceValue || '(empty)'}`);
  
        if (deviceValue === '-' || deviceValue === '' || deviceValue === 'None') {
          cy.log('No device assigned — assigning one first');
  
          // Assign a device
          cy.get(".hover-hoc-container__input__display-value")
            .eq(0)
            .realHover()
            .find("svg")
            .first()
            .should("be.visible")
            .click();
  
          cy.get('[placeholder="Select Device"]').click();
          cy.get('.select_item_container [role="button"]').first().click();
          cy.get('button p').contains('Update').click();
  
          cy.get(workforceSelector.toastMessage)
            .should("contain", "Press and hold the Kwant logo on the badge for 5 seconds to power it on.");
  
          cy.wait(1000);
        } else {
          cy.log('Device already assigned — proceeding to disable');
        }
  
        cy.contains("button p", "Disable").click();
        cy.contains("button p", "Disable").click();
  
        cy.get(workforceSelector.toastMessage)
          .should("contain.text", "Worker disabled successfully");

        cy.get(workforceSelector.tableRow).eq(0).within(() => {
          cy.get('.tag.default.error').should('exist');
        });
  
      });
  });



  // it("Should display correct tooltip messages for error device tags", () => {

  
  //   const expectedMessages = [
  //     'The device is not yet synced to the BOSK Mock',
  //     'This Device does not have NFC.',
  //   ]
  
  //   cy.get('img[src="/assets/cardNotSync-ab10623a.svg"]')
  //     .should('have.length.at.least', 1)
  //     .each(($tag, index) => {
  //       cy.get('body').realHover({ position: 'topLeft' })
  //       cy.wait(300)
        
  //       // Now hover over the tag
  //       cy.wrap($tag).realHover()
        
  //       cy.get('.tooltip-content', { timeout: 5000 })
  //         // .should('have.length', 1)
  //         .first()
  //         .invoke('text')
  //         .then((text) => {
  //           const trimmedText = text.trim()
  //           cy.log(`Tooltip ${index + 1}: "${trimmedText}"`)
            
  //           const hasExpectedText = expectedMessages.some(msg => 
  //             trimmedText.includes(msg)
  //           )
            
  //           if (!hasExpectedText) {
  //             cy.log(`⚠️ Unexpected tooltip: "${trimmedText}"`)
  //           }
            
  //           expect(hasExpectedText, 
  //             `Expected tooltip to contain one of the expected messages.\nActual text: "${trimmedText}"`
  //           ).to.be.true
  //         })
  //     })
  // })
  
  
})
