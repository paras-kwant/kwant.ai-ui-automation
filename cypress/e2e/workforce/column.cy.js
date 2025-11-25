/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  

Cypress.Commands.add('closeColumnDrawerIfOpen', () => {
  cy.wait(500)
  cy.get('body').then(($body) => {
    const $icon = $body.find('.sc-krNlru svg');

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





describe("Worker Module - Column", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains(Cypress.env('PROJECT_NAME')).click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });

  beforeEach(() => {
    cy.closeColumnDrawerIfOpen();
  });


  it('Validate adding and updating column settings', () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Reset to default').click();
    cy.wait(2000);
    cy.get('[data-rbd-draggable-id="email"] [type="checkbox"]').click();
  
    cy.get('button p').contains('Save').click();
    cy.get('.sc-kOPcWz').should('have.text', 'Column settings updated successfully! ');
    cy.get(workforceSelector.tableColumn).should('have.length', 12);
    cy.get(workforceSelector.tableColumn).invoke('text').then((text) => {
      expect(text.trim()).to.eq(
        'S.NoNameCompany NameJob TitleSite StatusPhoneDeviceLast Seen LocationEmail'
      );
    });
  });

  it('Validate drag and drop column feature', () => {
    cy.get('.icon-button button').eq(0).click();
    cy.wait(1000);

    cy.get('.columns-drawer-content__column-option__left')
      .then($els => $els.map((i, el) => el.innerText.trim()).get())
      .then(orderBefore => {
        cy.log('Initial Order:', orderBefore);

        cy.get('[data-rbd-draggable-id="projectTaskTradeName"]').then($draggable => {
          cy.get('.columns-drawer-content__column-option').eq(1).then($target => {
            const sourceRect = $draggable[0].getBoundingClientRect();
            const targetRect = $target[0].getBoundingClientRect();

            const startX = sourceRect.left + sourceRect.width / 2;
            const startY = sourceRect.top + sourceRect.height / 2;
            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;

            cy.wrap($draggable).trigger('touchstart', {
              touches: [{ clientX: startX, clientY: startY }],
              targetTouches: [{ clientX: startX, clientY: startY }],
              changedTouches: [{ clientX: startX, clientY: startY }],
              force: true
            }).wait(200);

            for (let i = 1; i <= 8; i++) {
              const currentX = startX + ((endX - startX) * i / 8);
              const currentY = startY + ((endY - startY) * i / 8);

              cy.wrap($draggable).trigger('touchmove', {
                touches: [{ clientX: currentX, clientY: currentY }],
                targetTouches: [{ clientX: currentX, clientY: currentY }],
                changedTouches: [{ clientX: currentX, clientY: currentY }],
                force: true
              }).wait(100);
            }

            cy.wrap($draggable).trigger('touchend', {
              touches: [],
              targetTouches: [],
              changedTouches: [{ clientX: endX, clientY: endY }],
              force: true
            });

            cy.wait(1000)
            cy.get('.columns-drawer-content__column-option__left')
              .should($els => {
                const orderAfter = $els.map((i, el) => el.innerText.trim()).get();
                expect(orderAfter, 'Column order should change').to.not.deep.equal(orderBefore);
              });
          });
        });
        cy.wait(1000);
        cy.get(workforceSelector.saveButton).click()
        cy.get('.sc-bXWnss').eq(4).invoke('text').then((text) => {
          expect(text.trim()).to.not.eq('Company Name');
        })
        cy.get('.sc-bXWnss').eq(5).invoke('text').then((text) => {
          expect(text.trim()).to.eq('Company Name');
        })
    });


  });


  it('Verify Column settings reset functionality', () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Reset to default').click();
    cy.get('button.sc-krNlru').click();
    cy.get('.sc-kOPcWz').should('have.text', 'Column settings reset successfully! ');
    cy.get(workforceSelector.tableColumn).should('have.length', 11);
    cy.get(workforceSelector.tableColumn).invoke('text').then((text) => {
      cy.log('Column Text:', text);
      cy.get(workforceSelector.tableColumn).should('contain.text', 'S.NoNameCompany NameJob TitleSite StatusPhoneDeviceLast Seen Location');
    });
  });

  it('Validate Add Column UI shows disabled Clear and Add buttons initially', () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click();
    cy.get('div[label="Clear"]').should('have.attr', 'disabled');
    cy.get('div[label="Add"]').should('have.attr', 'disabled');

    cy.get('[placeholder="Select"]').eq(0).click();
    ['Free Text', 'Numeric', 'Calendar', 'Boolean', 'Dropdown'].forEach(text => {
      cy.contains('[role="button"]', text).should('be.visible');
    });
    cy.get('[role="button"]').contains('Numeric').click();

    cy.get('[placeholder="Select"]').eq(1).click();
    ['Personal Details', 'Job Profile'].forEach(text => {
      cy.contains('[role="button"]', text).should('be.visible');
    });
    cy.get('[role="button"]').contains('Personal Details').click();

    cy.get('div[label="Clear"]').click();
    cy.get('div[label="Clear"]').should('have.attr', 'disabled');
  });

  it("Validate the Save button is disabled initially in Add Column settings", () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('div[label="Save"]').should('have.attr', 'disabled');
  });

  it("Validate Clear and Add buttons are disabled initially in Add New Column settings", () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click();
    cy.get('div[label="Clear"] button').should('have.attr', 'disabled');
    cy.get('div[label="Add"] button').should('have.attr', 'disabled');
  });

  it("Verify clicking on 'X' cancels the Add New Column drawer", () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click();
    cy.get('.sc-krNlru svg').click();
    cy.get('.columns-drawer-header').should('not.exist');
  });

  it("Verify clicking on Back navigates back to Column Settings page", () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click();
    cy.get('span').contains('Back').click();
    cy.get('button p').contains('Add New Column').should('be.visible');
  });

  it("Verify clicking on ‘Clear’ clears the entered input from the inputs fields.", () => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Add New Column').click();
    cy.get('[placeholder="Select"]').eq(0).click();
    cy.get('[role="button"]').contains('Free Text').click();
    cy.get('[placeholder="Select"]').eq(1).click();
    cy.get('[role="button"]').contains('Personal Details').click();
    cy.get('input[placeholder="Add Field Name"]').type('Test Column');
    cy.get('div[label="Clear"] button').click();
    cy.get('[placeholder="Select"]').eq(0).should('have.value', '');
    cy.get('[placeholder="Select"]').eq(1).should('have.value', '');
    cy.get('input[placeholder="Add Field Name"]').should('have.value', '');
  })



});
