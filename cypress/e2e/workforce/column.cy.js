/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - column", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Verify Colum settings reset functionality', () => {
    cy.visit('/projects/94049707/workers');
  cy.get('.icon-button button').eq(0).click();
  cy.get('button p').contains('Reset to default').click();
  cy.get('button.sc-krNlru').click();
  cy.get('.sc-kOPcWz').should('have.text', 'Column settings reset successfully! ');
  cy.get(workforceSelector.tableColumn).should('have.length', 11);
  cy.get(workforceSelector.tableColumn).invoke('text').then((text) => {
    cy.log('Column Text:', text);
    cy.get(workforceSelector.tableColumn).should('contain.text', 'S.NoNameCompany NameJob TitleSite StatusPhoneDeviceLast Seen Location');
  });
})


it('Validate adding and updating column settings', () => {
    cy.visit('/projects/94049707/workers');
  cy.get('.icon-button button').eq(0).click();
  cy.get('button p').contains('Reset to default').click();
  cy.wait(5000)
  cy.get('[data-rbd-draggable-id="automation_test_filter"] [type="checkbox"]').click()
  cy.get('button p').contains('Save').click();
  cy.get('.sc-kOPcWz').should('have.text', 'Column settings updated successfully! ');
  cy.get(workforceSelector.tableColumn).should('have.length', 12);

  cy.get(workforceSelector.tableColumn).invoke('text').then((text) => {
    expect(text.trim()).to.eq(
      'S.NoNameCompany NameJob TitleSite StatusPhoneDeviceLast Seen Locationautomation test filter'
    );
  });
})
it('Validate drag and drop colum feature)', () => {
  cy.visit('/projects/94049707/workers');

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

          cy.get('.columns-drawer-content__column-option__left')
            .should($els => {
              const orderAfter = $els.map((i, el) => el.innerText.trim()).get();
              expect(orderAfter, 'Column order should change').to.not.deep.equal(orderBefore);
            });
        });
      });
      cy.get('button p').contains('Reset to default').click();    });
    
});

it('should validate add column settings UI displays disabled Clear and Add buttons initially', () => {
  cy.visit('/projects/94049707/workers');
  cy.get('.icon-button button').eq(0).click();
  cy.wait(1000);
  cy.get('button p').contains('Add New Column').click();
  cy.get('div[label="Clear"]').should('have.attr', 'disabled')
  cy.get('div[label="Add"]').should('have.attr', 'disabled')

  cy.get('[placeholder="Select"]').eq(0).click()
  const buttonTexts = ['Free Text', 'Numeric', 'Calendar', 'Boolean', 'Dropdown']
buttonTexts.forEach(text => {
  cy.contains('[role="button"]', text).should('be.visible')
})

cy.get('[role="button"]').contains('Numeric').click()


cy.get('[placeholder="Select"]').eq(1).click()
  const placeholder = ['Personal Details', 'Job Profile']
placeholder.forEach(text => {
  cy.contains('[role="button"]', text).should('be.visible')
})
cy.get('[role="button"]').contains('Personal Details').click()

cy.get('div[label="Clear"]').click()
cy.get('div[label="Clear"]').should('have.attr', 'disabled')

})

})
