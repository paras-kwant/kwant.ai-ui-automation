/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import workerHelper from "../../support/helper/workerHelper";

describe("Worker Module - Safety Alert", () => {

  before(() => {
    // Create session
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title")
        .contains(Cypress.env("PROJECT_NAME"))
        .click();
    });
  
    workerHelper.visitWorkersPage();
  
        cy.get(".icon-button button").first().click();
        cy.contains('button p', "Reset to default").then(($reset) => {
          if ($reset.length) {
            cy.wrap($reset).click();
          }
        });
        cy.get('[data-rbd-draggable-id="safetyAlert"] [type="checkbox"]').click();
        cy.contains("button p", "Save").should('be.visible').click({force: true});

    });
  

  beforeEach(() => {
    cy.cleanUI();
  });

  it("Verify Safety Audit Drawer UI and Default Filters Display Correctly", () => {
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

    workerHelper.openSafteyAuditModel();

    cy.get("p").contains("Safety Audit").should("be.visible");

    cy.get('.filter-alert-select-container [label="All Alerts"]').should('be.visible');
    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible');
    cy.get(`.filter-alert-calender-container [label="12/20/2020 - ${formattedDate}"]`).should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('.sc-cRmqLi.dEhqLz').length === 0) {
        cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible');
      }
    });
  });

  it('Verify Safety Audit Alert Filters (All, Resolved, Unresolved) Functionality', () => {
    workerHelper.openSafteyAuditModel();

    cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.keQdsQ').should('not.exist');
    cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.PkGul').should('exist');

    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible').click();
    cy.contains('.alert-type-label', 'All').click();
    cy.get('.sc-cRmqLi.dEhqLz').should('be.visible');

    cy.get('.filter-alert-select-container [label="All"]').should('be.visible').click();
    cy.contains('.alert-type-label', 'Resolved').click();
    cy.get('.sc-cRmqLi.dEhqLz .sc-cQCQeq.PkGul').should('not.exist');
    cy.wait(3000);
    
    cy.get('body').then(($body) => {
      if ($body.find('.sc-cRmqLi.dEhqLz .sc-cQCQeq.keQdsQ').length === 0) {
        cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible');
      }
    });
  });

  it('Verify Red Warning Indicator Appears in Safety Audit Section When Alerts Exist', () => {
   workerHelper.openSafteyAuditModel();
    workforceSelector.SafetyAudit().find('[fill="#DF4242"]').should('exist');
  });

  it('verifies checkbox selection in safety audit updates the alert count correctly', () => {
    cy.get('.table-header-filter-btn').eq(7).click();
    
      // Check all filters except "None"
      cy.get('.sc-esYiGF').each(($el) => {
        const label = $el.find('span').text().trim();
        if (label !== 'None') {
          cy.wrap($el).find('[type="checkbox"]').check({ force: true });
        }
      });
    
      cy.wait(3000);
    
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
    workerHelper.openSafteyAuditModel();
  
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
      
      cy.get('.sc-cRmqLi.dEhqLz').find('.cell-content').then(($cells) => {
        const texts = $cells.toArray().map(el => el.innerText.trim());
        const matchingCells = texts.filter(text => text === trimmedAlert);
        
        cy.log(`All cell texts: ${texts.join(', ')}`);
        cy.log(`Found ${matchingCells.length} matching cell(s) for "${trimmedAlert}"`);
        
        expect(matchingCells.length).to.equal(1, `Expected exactly one cell with text "${trimmedAlert}"`);
      });
      
      cy.get('.filter-alert-select-container [label="Resolved"]').should('be.visible').click();
      cy.contains('.alert-type-label', 'Unresolved').click();
      cy.wait(1000);
      
      cy.get('.table-wrapper:last-child').scrollTo('bottom', { duration: 1000, ensureScrollable: false });
      
      cy.get('.sc-cRmqLi.dEhqLz').find('.cell-content').then(($cells) => {
        const texts = $cells.toArray().map(el => el.innerText.trim());
        const matchingCells = texts.filter(text => text === trimmedAlert);
        
        cy.log(`Unresolved cell texts: ${texts.join(', ')}`);
        cy.log(`Found ${matchingCells.length} matching cell(s) in unresolved for "${trimmedAlert}"`);
        
        expect(matchingCells.length).to.equal(0, `Expected NO cells with text "${trimmedAlert}" in unresolved list`);
      });
    });
  });

  it('should delete a safety alert and verify it is no longer visible in the same list', () => {
    workerHelper.openSafteyAuditModel();
  
    cy.get('.sc-cRmqLi.dEhqLz .cell-content').eq(0).invoke('text').then((deletedAlert) => {
      const trimmedAlert = deletedAlert.trim();
  
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
   workerHelper.openSafteyAuditModel();


   cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();
   workerHelper.addRandomComment()
  });

  it('validating the ui of add comment', () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    
   workerHelper.openSafteyAuditModel();
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();

    cy.get('.comment-header-container').contains('Comment').should('be.visible');

    cy.get('.filter-alert-calender-container').find(`[label="12/20/2020 - ${today}"]`).should('be.visible');

    cy.get('.comment-item-body__content').eq(0).realHover();
  
    cy.get('[label="Edit"]', { timeout: 10000 }).should('exist').and('be.visible');

    cy.get('[label="Delete"]', { timeout: 10000 }).should('exist').and('be.visible');
  });

  it('should edit a comment to a safety alert and verify it appears in the comment list', () => {
    workerHelper.openSafteyAuditModel();
  
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();
  
    const editComment = () => {
      const randomEditedComment = `Edited comment - ${Cypress._.random(1000, 9999)}`;
      cy.log(`Generated Edited Comment: ${randomEditedComment}`);
  
      cy.get('.comment-body-container__display-comment-container')
        .scrollTo('top', { duration: 1000, ensureScrollable: false });
  
      cy.get('.comment-item-body__content').eq(0).realHover();
      cy.get('button p').contains('Edit').click({ force: true });
  
      cy.get('.comment-body-container__display-comment-container')
        .scrollTo('top', { duration: 1000, ensureScrollable: false });
  
      cy.get('[placeholder="comment"]').clear().type(randomEditedComment);
      cy.contains('button p', 'Update').click();
  
      cy.get('.comment-body-container__display-comment-container')
        .scrollTo('top', { ensureScrollable: false });
  
      cy.get('.comment-item-body__content').eq(0)
        .should('contain.text', randomEditedComment);
    };
  
    cy.get('body').then(($body) => {
      const commentExists = $body.find('.comment-item-body__content').length > 0;
  
      if (commentExists) {
        editComment();
      } else {
       workerHelper.addRandomComment()
          .then(() => {
            editComment();
          });
      }
    });
  });
  

  it('should delete a comment from a safety alert and verify it is removed from the comment list', () => {
    workerHelper.openSafteyAuditModel();
  
    cy.get('.sc-cRmqLi.dEhqLz').eq(0).find('svg').last().click();    
    cy.wait(3000);
  
    cy.get('body').then(($body) => {
      const commentExists = $body.find('.comment-item-body__content').length > 0;
  
      const deleteComment = () => {
        cy.get('.comment-body-container__display-comment-container')
          .scrollTo('top', { ensureScrollable: false });
  
        cy.get('body').then(($b) => {
          if ($b.find('.comment-item-body__content').length > 0) {
            cy.get('.comment-item-body__content').eq(0).invoke('text').then((commentText) => {
              const trimmedComment = commentText.trim();
  
              cy.get('.comment-body-container__display-comment-container')
                .scrollTo('top', { ensureScrollable: false });
              cy.get('.comment-item-body__content').eq(0).realHover();
              cy.get('button p').contains('Delete').click({ force: true });
              cy.contains('.delete-dialog-footer button p', 'Delete').click();
  
              workforceSelector.toastMessage()
                .contains('Comment deleted successfully!');
              cy.get('.comment-body-container__display-comment-container')
                .scrollTo('top', { ensureScrollable: false });
              cy.wait(2000);
  
              cy.get('body').then(($b2) => {
                if ($b2.find('.comment-item-body__content').length > 0) {
                  cy.get('.comment-item-body__content').each(($el) => {
                    expect($el.text().trim()).not.to.equal(trimmedComment);
                  });
                } else {
                  cy.log('No comment found');
                }
              });
            });
          } else {
            cy.log('No comment found');
          }
        });
      };
  
      if (commentExists) {
        deleteComment();
      } else {
        workerHelper.addRandomComment()
            .then(() => {
              deleteComment();
            });
      }
    });
  });
  

  it('Should verify all safety alert filters display the correct alert types', () => {
   workerHelper.openSafteyAuditModel();
  
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
  
    verifyAlertFilter('All Alerts', 'SOS');
    verifyAlertFilter('SOS', 'Fatigue');
    verifyAlertFilter('Fatigue', 'Fall');
    verifyAlertFilter('Fall', 'Unsafe');
    verifyAlertFilter('Unsafe', 'Near Miss');
    verifyAlertFilter('Near Miss', 'Restricted');
  });

});