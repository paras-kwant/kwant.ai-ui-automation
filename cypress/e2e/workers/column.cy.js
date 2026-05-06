/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper.js';
import { env } from 'process';
const PROJECT_ID = Cypress.env('PROJECT_ID');

describe(
  "Worker Module - Column",
  { tags: ["Epic:WorkForce", "Feature:Column Settings", "Module:Workforce-Worker"] },
  () => {

  beforeEach(() => {
    cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject(PROJECT_ID));
    cy.cleanUI();
  });

  beforeEach(() => {
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Reset to default').click();
    cy.wait(2000);
    cy.get('body').click('bottomLeft');
  });

  const getCleanColumns = ($cols) =>
    [...$cols]
      .map((el) => el.innerText.trim())
      .filter((text) => text !== '' && !text.includes('\n'));

  it('Validate adding and updating column settings', 
    { tags: ['@smoke'] },
    () => {
      const expectedColumns = [
        'S.No', 'Name', 'Company Name', 'Job Title',
        'Site Status', 'Phone', 'Device',
        'Last Seen Location', 'Email'
      ];

      cy.get('.icon-button button').eq(0).click();
      cy.get('button p').contains('Reset to default').click();
      cy.wait(2000);
      cy.get('[data-rbd-draggable-id="email"] [type="checkbox"]').click();
      cy.get('button p').contains('Save').click();
      cy.wait(2000);

      cy.get(workforceSelector.toastMessage)
        .contains('Column settings updated successfully!');

      cy.get(`${workforceSelector.tableColumn}`)
        .then(($cols) => {
          const actualColumns = getCleanColumns($cols);
          expectedColumns.forEach((col) => {
            expect(actualColumns, `Missing column: "${col}"`).to.include(col);
          });
        });
  });

  it('Validate drag and drop column feature', 
    { tags: ["Story:Drag & Drop Columns", "Severity:critical", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.wait(1000);
    
      let companyNameIndexBefore;
    
      cy.get('.columns-drawer-content__column-option__left')
        .then($els => $els.map((i, el) => el.innerText.trim()).get())
        .then(orderBefore => {
          companyNameIndexBefore = orderBefore.indexOf('Company Name');
          cy.log('Initial Order:', orderBefore);
          cy.log('Company Name index before:', companyNameIndexBefore);
    
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
    
              cy.wait(1000);
    
              cy.get('.columns-drawer-content__column-option__left')
                .should($els => {
                  const orderAfter = $els.map((i, el) => el.innerText.trim()).get();
                  expect(orderAfter, 'Column order should change').to.not.deep.equal(orderBefore);
                });
            });
          });
    
          cy.wait(1000);
          cy.get(workforceSelector.saveButton).click();
          cy.wait(2000);
    
          cy.get(workforceSelector.tableColumn).then(($cols) => {
            const actualColumns = getCleanColumns($cols);
            const companyNameIndexAfter = actualColumns.indexOf('Company Name');
    
            cy.log('Company Name index after:', companyNameIndexAfter);
    
            expect(companyNameIndexAfter, 'Company Name should still exist in the table').to.not.eq(-1);
            expect(companyNameIndexAfter, 'Company Name should have moved to a different position').to.not.eq(companyNameIndexBefore);
          });
      });
  });

  it('Verify Column settings reset functionality', 
    { tags: ['@smoke'] },
    () => {
      const expectedDefaultColumns = [
        'S.No', 'Name', 'Company Name', 'Job Title',
        'Site Status', 'Phone', 'Device', 'Last Seen Location'
      ];

      cy.get('.icon-button button').eq(0).click();
      cy.get('button p').contains('Reset to default').click();
      cy.get('body').click('bottomLeft');
      cy.wait(2000);

      cy.get(workforceSelector.toastMessage)
        .contains('Column settings reset successfully!');

      cy.get(`${workforceSelector.tableColumn}`)
        .then(($cols) => {
          const actualColumns = getCleanColumns($cols);
          expectedDefaultColumns.forEach((col) => {
            expect(actualColumns, `Missing default column: "${col}"`).to.include(col);
          });
      });
  });

  it('Validate Add Column UI shows disabled Clear and Add buttons initially', 
    { tags: ["Story:Add Column UI", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
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

  it('Verify the availability of Emergency Contact fields on Column settings page', 
    { tags: ["Story:Emergency Contact Fields", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('[data-rbd-draggable-id="emergencyContactName"] [type="checkbox"]').should('exist');
      cy.get('[data-rbd-draggable-id="emergencyContactPhone"] [type="checkbox"]').should('exist');
      cy.get('[data-rbd-draggable-id="emergencyContactAddress"] [type="checkbox"]').should('exist');
  });

  it('Verify toggling a column OFF does not display it in the workers table', 
    { tags: ["Story:Toggle Column OFF", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('[data-rbd-draggable-id="projectTaskTradeName"] [type="checkbox"]').click();
      cy.get('[data-rbd-draggable-id="projectTaskTradeName"] [type="checkbox"]').should('not.be.checked');
      cy.get('button p').contains('Save').click();
      cy.wait(2000);

      cy.get(workforceSelector.tableColumn).then(($cols) => {
        const actualColumns = getCleanColumns($cols);
        expect(actualColumns).not.to.include('Company Name');
      });
  });

  it("Validate the Save button is disabled initially in Column settings", 
    { tags: ["Story:Save Button Disabled", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('div[label="Save"]').should('have.attr', 'disabled');
  });

  it("Validate Clear and Add buttons are disabled initially in Add New Column settings", 
    { tags: ["Story:Clear/Add Buttons Disabled", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('button p').contains('Add New Column').click();
      cy.get('div[label="Clear"] button').should('have.attr', 'disabled');
      cy.get('div[label="Add"] button').should('have.attr', 'disabled');
  });

  it("Verify clicking 'X' cancels the Add New Column drawer", 
    { tags: ["Story:Cancel Add Column", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('button p').contains('Add New Column').click();
      cy.get('header button svg').click();
      cy.get('.columns-drawer-header').should('not.exist');
  });

  it("Verify clicking Back navigates back to Column Settings page", 
    { tags: ["Story:Back Button Navigation", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('button p').contains('Add New Column').click();
      cy.get('span').contains('Back').click();
      cy.get('button p').contains('Add New Column').should('be.visible');
  });

  it("Verify clicking Clear resets all input fields in Add New Column", 
    { tags: ["Story:Clear Input Fields", "Severity:normal", "UI", "Module:Workforce-Worker"] },
    () => {
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
  });

  it('Turn on all columns and verify they appear in the table', 
    { tags: ['@smoke'] },
    () => {
      cy.get('.icon-button button').eq(0).click();
      cy.get('.columns-drawer-header').contains('Column Settings').should('be.visible');

      const allColumnNames = [];

      cy.get('.columns-drawer-content').scrollTo('bottom', { duration: 500 });
      cy.wait(100);

      cy.get('[data-rbd-draggable-id]').each(($draggable, index) => {
        cy.wrap($draggable).scrollIntoView({ offset: { top: -100, left: 0 } });
        cy.wait(100);

        cy.wrap($draggable).should('be.visible').within(() => {
          cy.get('.columns-drawer-content__column-option__left')
            .invoke('text')
            .then((text) => {
              const columnName = text.trim();
              allColumnNames.push(columnName);
              cy.log(`Processing column ${index + 1}: ${columnName}`);
            });

          cy.get('input[type="checkbox"]').then(($checkbox) => {
            if (!$checkbox.is(':checked')) {
              cy.wrap($checkbox).check({ force: true });
            }
          });
        });
      }).then(() => {
        cy.log(`Total columns processed: ${allColumnNames.length}`);

        cy.get('button p').contains('Save').click();
        cy.wait(2000);

        cy.get(workforceSelector.toastMessage)
          .contains('Column settings updated successfully');

        cy.get(`${workforceSelector.tableColumn}`).then(($cols) => {
          const actualColumns = getCleanColumns($cols);
          allColumnNames.forEach((columnName) => {
            expect(actualColumns, `Missing column: "${columnName}"`).to.include(columnName);
          });
          cy.log(`Verified all ${allColumnNames.length} columns are visible in the table`);
        });
      });
  });

});