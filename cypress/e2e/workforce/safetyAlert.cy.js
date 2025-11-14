/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";

describe("Worker Module - Safety Alert", () => {


  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });

    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
    cy.get('.icon-button button').eq(0).click();
    cy.get('button p').contains('Reset to default').click();
    cy.wait(5000);
    cy.get('[data-rbd-draggable-id="safetyAlert"] [type="checkbox"]').click();
    cy.get('button p').contains('Save').click();
  });
  
  beforeEach(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title").contains(Cypress.env("PROJECT_NAME")).click();
    });

    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });


  it("Verify Safety Audit Drawer UI and Default Filters Display Correctl", () => {
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today
  .getDate()
  .toString()
  .padStart(2, '0')}/${today.getFullYear()}`;
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    workforceSelector.SafetyAudit().click();

    cy.get("p").contains("Safety Audit").should("be.visible");


    cy.get('.filter-alert-select-container [label="All Alerts"]').should('be.visible')
    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible')
    cy.get(`.filter-alert-calender-container [label="12/20/2020 - ${formattedDate}"]`).should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.find('.sc-cRmqLi.dEhqLz').length > 0) {
        
      } else {
      cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible')
      }
    });
    
  });

  it('Verify Safety Audit Alert Filters (All, Resolved, Unresolved) Functionality', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();

    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();

    cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.keQdsQ').should('not.exist')
    cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.PkGul').should('exist');

    // Unresolved -> All
    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible').click();
    cy.contains('.alert-type-label', 'All').click();
    cy.get('.sc-cRmqLi.dEhqLz').should('be.visible');

    // All -> Resolved
        cy.get('.filter-alert-select-container [label="All"]').should('be.visible').click();
        cy.contains('.alert-type-label', 'Resolved').click();
        cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.PkGul').should('not.exist')
        cy.wait(3000)
    cy.get('body').then(($body) => {
      if ($body.find('.sc-cRmqLi.dEhqLz .sc-cQCQeq.keQdsQ').length > 0) {
 
      } else {
      cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible')
      }
    });
    
  });




  it('Verify Red Warning Indicator Appears in Safety Audit Section When Alerts Exist', ()=>{
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });

  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();

    workforceSelector.SafetyAudit().find('[fill="#DF4242"]').should('exist');
    });

    it('verifies checkbox selection in safety audit updates the alert count correctly', () => {
      cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
      cy.get('.table-header-filter-btn').eq(7).click();
    
      // Check all filters except "None"
      cy.get('.sc-esYiGF').each(($el) => {
        const label = $el.find('span').text().trim();
        if (label !== 'None') {
          cy.wrap($el).find('[type="checkbox"]').check({ force: true });
        }
      });
    
      cy.wait(3000);
    
      // Handle alert count cell, default to 0 if not present
      cy.get(workforceSelector.tableRow)
        .eq(1)
        .then(($row) => {
          const $cell = $row.find('.table_td:nth-child(12) .default__label:nth-child(1)');
          let numericValue = 0;
    
          if ($cell.length > 0) {
            numericValue = parseInt($cell.text().trim().replace('+', ''), 10);
          }
    
          const expectedValue = numericValue + 1;
          cy.log(`Current value: ${numericValue}, Expected after increment: ${expectedValue}`);
    
          // Open Safety Audit drawer
          cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
          workforceSelector.SafetyAudit().click();
          cy.wait(3000);
    
          // Check first alert checkbox and verify count = 1
          cy.get('.sc-cRmqLi.dEhqLz [type="checkbox"]').eq(0).check({ force: true });
          cy.get('.label.default__label').should('contain', '1');
    
          // Check remaining alerts and verify count = expectedValue
          cy.get('[overflow="scroll"] [type="checkbox"]').check({ force: true });
          cy.get('.label.default__label').should('contain', expectedValue.toString());
        });
    });
    

  it('verifies resolving an alert moves it from Unresolved to Resolved list', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
    
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('.cell-content').invoke('text').then((resolvedAlert) => {
      const trimmedAlert = resolvedAlert.trim();
      cy.log(`Original Alert: ${trimmedAlert}`);
      
      cy.get('.sc-cRmqLi.dEhqLz [type="checkbox"]').eq(0).check({ force: true });
      cy.contains('button p', 'Resolve').click();
      cy.contains('.delete-dialog-footer button p', 'Resolve').click();
      workforceSelector.toastMessage().contains('Resolved successfully');
      
      cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible').click();
      cy.contains('.alert-type-label', 'Resolved').click();
      
      cy.get('.table-wrapper:last-child').scrollTo('bottom', { duration: 1000, ensureScrollable: false });

      cy.get('.sc-cRmqLi.dEhqLz').find('.cell-content').then(($cells) => {
        $cells.each((index, el) => {
          cy.log(`Cell ${index}: "${el.innerText.trim()}"`);
        });
      });
      
      cy.get('.sc-cRmqLi.dEhqLz')
        .find('.cell-content')
        .then(($cells) => {
          const texts = $cells.toArray().map(el => el.innerText.trim());
          const matchingCells = texts.filter(text => text === trimmedAlert);
          
          cy.log(`All cell texts: ${texts.join(', ')}`);
          cy.log(`Found ${matchingCells.length} matching cell(s) for "${trimmedAlert}"`);
          
          expect(matchingCells.length).to.equal(1, `Expected exactly one cell with text "${trimmedAlert}"`);
        });
      
      // Switch back to Unresolved and verify the alert is NOT there
      cy.get('.filter-alert-select-container [label="Resolved"]').should('be.visible').click();
      cy.contains('.alert-type-label', 'Unresolved').click();
      cy.wait(1000);
      
      cy.get('.table-wrapper:last-child').scrollTo('bottom', { duration: 1000, ensureScrollable: false });
      cy.get('.sc-cRmqLi.dEhqLz')
        .find('.cell-content')
        .then(($cells) => {
          const texts = $cells.toArray().map(el => el.innerText.trim());
          const matchingCells = texts.filter(text => text === trimmedAlert);
          
          cy.log(`Unresolved cell texts: ${texts.join(', ')}`);
          cy.log(`Found ${matchingCells.length} matching cell(s) in unresolved for "${trimmedAlert}"`);
          
          expect(matchingCells.length).to.equal(0, `Expected NO cells with text "${trimmedAlert}" in unresolved list`);
        });
    });
  });

  it('should delete a safety alert and verify it is no longer visible in the same list', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
  
    cy.get('.sc-cRmqLi.dEhqLz .cell-content')
      .eq(0)
      .invoke('text')
      .then((deletedAlert) => {
        const trimmedAlert = deletedAlert.trim();
  
        // Select and delete the alert
        cy.get('.sc-cRmqLi.dEhqLz [type="checkbox"]').eq(0).check({ force: true });
        cy.get('.label.default__label').should('contain', '1');
        cy.contains('button p', 'Delete').click();
        cy.contains('.delete-dialog-footer button p', 'Delete').click();
        workforceSelector.toastMessage().contains('Deleted successfully');

        cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible').click();
        cy.contains('.alert-type-label', 'Resolved').click();
        cy.get('.filter-alert-select-container [label="Resolved"]').should('be.visible').click();
        cy.contains('.alert-type-label', 'Unresolved').click();

        cy.get('.sc-cRmqLi.dEhqLz .cell-content').each(($cell) => {
          const cellText = $cell.text().trim();
          expect(cellText).not.to.equal(trimmedAlert, `Alert "${trimmedAlert}" should not be visible after deletion`);
        });
      });
  });
  



  it('should add a comment to a safety alert and verify it appears in the comment list', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
  
    const randomComment = `Auto comment - ${Cypress._.random(1000, 9999)}`;
    cy.log(`Generated Comment: ${randomComment}`);
  
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();
    cy.get('textarea').type(randomComment);
    cy.contains('button p', 'Add Comment').click();
  
    cy.get('.comment-item-body__content').eq(0).should('contain.text', randomComment);
  });

  it('validateting the ui of add comment', ()=>{
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click()

    cy.get('.comment-header-container').contains('Comment').should('be.visible')

    cy.get('.filter-alert-calender-container')
    .find(`[label="12/20/2020 - ${today}"]`)
    .should('be.visible');

    cy.get('.comment-item-body__content')
    .eq(0)
    .realHover();
  
  cy.get('[label="Edit"]', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

    cy.get('[label="Delete"]', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

  })

  

  it('should edit a comment to a safety alert and verify it appears in the comment list', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
  
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();
  
    const randomEditedComment = `Edited comment - ${Cypress._.random(1000, 9999)}`;
    cy.log(`Generated Edited Comment: ${randomEditedComment}`);
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { duration: 1000, ensureScrollable: false });
  
      cy.get('.comment-item-body__content').eq(0).realHover()
        cy.get('button p').contains('Edit')
          .click({ force: true });

          cy.get('.comment-body-container__display-comment-container')
          .scrollTo('top', { duration: 1000, ensureScrollable: false });

  
    cy.get('[placeholder="comment"]').clear().type(randomEditedComment);
    cy.contains('button p', 'Update').click();
  
    cy.get('.comment-body-container__display-comment-container')
      .scrollTo('top', { ensureScrollable: false });
  
    cy.get('.comment-item-body__content')
      .eq(0)
      .should('contain.text', randomEditedComment);
  });

  it('should delete a comment from a safety alert and verify it is removed from the comment list', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    
    cy.get('.table-header-filter-btn').eq(7).click();
  
    // Check all filters except "None"
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    // Open Safety Audit drawer
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
    
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();    
    cy.wait(3000)  
    cy.get('body').then(($body) => {
      if ($body.find('.comment-item-body__content').length > 0) {
        cy.get('.comment-body-container__display-comment-container')
        .scrollTo('top', { ensureScrollable: false });
  
        cy.get('.comment-item-body__content').eq(0).invoke('text').then((commentText) => {
          const trimmedComment = commentText.trim();
          cy.log(`Deleting comment: ${trimmedComment}`);
  
          // Hover and click Delete
          cy.get('.comment-body-container__display-comment-container')
          .scrollTo('top', { ensureScrollable: false });
          cy.get('.comment-item-body__content').eq(0).realHover();
          cy.get('button p').contains('Delete').click({ force: true })
  
          cy.contains('.delete-dialog-footer button p', 'Delete').click();
  
          // Verify toast
          workforceSelector.toastMessage().contains('Comment deleted successfully!');
          cy.get('.comment-body-container__display-comment-container')
          .scrollTo('top', { ensureScrollable: false });
          cy.wait(2000)
  
          cy.get('.comment-item-body__content').each(($el) => {
            expect($el.text().trim()).not.to.equal(trimmedComment);
          });
        });
  
      } else {
        cy.log('❗ No comments found, skipping deletion');
      }
    });
  });
  
  

  it('Should verify all safety alert filters display the correct alert types', () => {
    cy.visit(`/projects/${Cypress.env("PROJECT_ID")}/workers`);
    cy.get('.table-header-filter-btn').eq(7).click();
  
    cy.get('.sc-esYiGF').each(($el) => {
      const label = $el.find('span').text().trim();
      if (label !== 'None') {
        cy.wrap($el).find('[type="checkbox"]').check({ force: true });
      }
    });
  
    cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
    workforceSelector.SafetyAudit().click();
  
    // Reusable function
    const verifyAlertFilter = (filterLabel, alertType) => {
      cy.get(`[label="${filterLabel}"]`).click();
      cy.contains('.alert-type-label', alertType).click();
      cy.wait(5000);
  
      cy.get('body').then(($body) => {
        if ($body.find('.sc-cRmqLi.dEhqLz').length > 0) {
          cy.get('.table-wrapper').each(($table) => {
            cy.wrap($table).within(() => {
              cy.get('.label.default__label').should('contain.text', alertType);
            }).scrollTo('bottom', { duration: 1000, ensureScrollable: false });
          });
        } else {
          cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible');
        }
      });
    };
  
    // Use the function for each filter
    verifyAlertFilter('All Alerts', 'SOS');
    verifyAlertFilter('SOS', 'Fatigue');
    verifyAlertFilter('Fatigue', 'Fall');
    verifyAlertFilter('Fall', 'Unsafe');
    verifyAlertFilter('Unsafe', 'Near Miss');
    verifyAlertFilter('Near Miss', 'Restricted');



  });
})