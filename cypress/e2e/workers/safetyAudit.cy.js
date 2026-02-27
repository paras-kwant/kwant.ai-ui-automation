/// <reference types="cypress" />
import { workforceSelector } from "../../support/workforceSelector";
import "cypress-real-events/support";
import SafetyAuditPage from "../../pages/workforce/safetyAudit";

describe("Worker Module - Safety Audit", () => {

  before(() => {
    cy.session("userSession", () => {
      cy.login();
      cy.get(".card-title")
        .contains(Cypress.env("PROJECT_NAME"))
        .click();
    });
    cy.visit(`/projects/${Cypress.env('PROJECT_ID')}/workers`);
  });

  before(() => {
    cy.get(workforceSelector.tableRow ).eq(0).should('be.visible');

    cy.get(".icon-button button").first().click();
    cy.contains('button p', "Reset to default").click();
    cy.wait(5000);
    cy.get('[data-rbd-draggable-id="safetyAlert"] [type="checkbox"]').scrollIntoView();
    cy.get('[data-rbd-draggable-id="safetyAlert"] [type="checkbox"]').click({ force: true });
    cy.wait(2000);
    cy.contains("button p", "Save").should('be.visible').click();
    SafetyAuditPage.applyAllSafetyAlertFilters();
  });

  beforeEach(() => {
    cy.wait(500)
    cy.get("body").then(($body) => {
      if($body.find('section').length > 0){
        cy.get('body').click(0,0);
      }

    })
  });



  it("Verify Safety Audit Drawer UI and Default Filters Display Correctly", () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

    cy.get("p").contains("Safety Audit").should("be.visible");
    cy.get('.filter-alert-select-container [label="All Alerts"]').should('be.visible');
    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible');
    cy.get(`.filter-alert-calender-container [label="12/20/2020 - ${formattedDate}"]`).should('be.visible');
    cy.wait(1000);
    cy.get(`${workforceSelector.documentTableRow}`).should('be.visible');
  });


  it('Verify Safety Audit Alert Filters (All, Resolved, Unresolved) Functionality', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();  
    cy.get('section [data-testid="table_tr"] .sc-cvalOF.kKTzpl').should('not.exist');
    cy.get('section [data-testid="table_tr"] .sc-cvalOF.dvyqIw').should('exist');

    cy.get('.filter-alert-select-container [label="Unresolved"]').should('be.visible').click();
    cy.contains('.alert-type-label', 'All').click();
    cy.get('section [data-testid="table_tr"]').should('be.visible');

    cy.get('.filter-alert-select-container [label="All"]').should('be.visible').click();
    cy.contains('.alert-type-label', 'Resolved').click();
    cy.get('section [data-testid="table_tr"] .sc-cvalOF.kKTzpl').should('not.exist');
    cy.wait(3000);

    cy.get('body').then(($body) => {
      if ($body.find('section [data-testid="table_tr"] .sc-cvalOF.kKTzpl').length === 0) {
        cy.get('.empty-body__title').contains('No safety notifications yet!').should('be.visible');
      }
    });
  });


  it('Verify Red Warning Indicator Appears in Safety Audit Section When Alerts Exist', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
    cy.get(workforceSelector.SafetyAuditPage).find('[fill="#DF4242"]').should('exist');
  });


  it('verifies checkbox selection in safety audit updates the alert count correctly', () => {
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

        cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
        cy.get(workforceSelector.SafetyAuditPage).click();

        cy.get(`section ${workforceSelector.tableRow} [type="checkbox"]`).eq(0).check({ force: true });
        cy.get('.label.default__label').should('contain', '1');

        cy.get('[overflow="scroll"] [type="checkbox"]').check({ force: true });
        cy.get('.label.default__label').should('contain', expectedValue.toString());
      });
  });


  it('verifies resolving an alert moves it from Unresolved to Resolved list', () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
  
    cy.get(`section ${workforceSelector.tableRow}`)
      .eq(0)
      .find('.cell-content')
      .invoke('text')
      .then((resolvedAlert) => {
  
        const trimmedAlert = resolvedAlert.trim();
        cy.log(`Original Alert: ${trimmedAlert}`);
  
        cy.get(`section ${workforceSelector.tableRow} [type="checkbox"]`)
          .eq(0)
          .check({ force: true });
  
        cy.contains('button p', 'Resolve').click();
        cy.contains('.delete-dialog-footer button p', 'Resolve').click();
  
        cy.get(workforceSelector.toastMessage)
          .should('contain', 'Resolved successfully');
  
        cy.get('.filter-alert-select-container [label="Unresolved"]')
          .should('be.visible')
          .click();
  
        cy.contains('.alert-type-label', 'Resolved').click();
  
        cy.wait(1000);
  
        cy.get('body').then(($body) => {
  
          if ($body.find(`section ${workforceSelector.tableRow}`).length > 0) {
  
            cy.get('.table-wrapper').eq(1).within(() => {
  
              cy.get(`${workforceSelector.tableRow} .cell-content`)
                .then(($cells) => {
                  const texts = $cells.toArray().map(el => el.innerText.trim());
                  const match = texts.filter(text => text === trimmedAlert);
  
                  cy.log(`Resolved cell texts: ${texts.join(', ')}`);
                  expect(match.length).to.equal(1);
                });
  
            }).scrollTo('bottom', { duration: 1000, ensureScrollable: false });
  
          } else {
  
            cy.get('.empty-body__title')
              .should('contain', 'No safety notifications yet!');
          }
        });
  
        cy.get('.filter-alert-select-container [label="Resolved"]')
          .should('be.visible')
          .click();
  
        cy.contains('.alert-type-label', 'Unresolved').click();
  
        cy.wait(1000);
  
        cy.get('body').then(($body) => {
  
          if ($body.find(`section ${workforceSelector.tableRow}`).length > 0) {
  
            cy.get(`section ${workforceSelector.tableRow}`)
              .find('.cell-content')
              .then(($cells) => {
                const texts = $cells.toArray().map(el => el.innerText.trim());
                const match = texts.filter(text => text === trimmedAlert);
  
                cy.log(`Unresolved cell texts: ${texts.join(', ')}`);
                expect(match.length).to.equal(0);
              });
  
          } else {
  
            cy.get('.empty-body__title')
              .should('contain', 'No safety notifications yet!');
          }
        });
  
      });
  });


  it("Verify that Yellow or Red color is displayed for workers with unsafe security alerts", () => {
    cy.get(workforceSelector.tableRow).each(($row) => {
      cy.wrap($row)
        .find('div.tooltip-container.right-center span')
        .invoke('text')
        .then((text) => {
          const cleanText = text.replace(/\u00a0/g, '').trim();
          expect(cleanText).to.match(/^(Yellow|Red)$/);
        });
    });
  });

  it('should delete a safety alert and verify it is no longer visible in the same list', () => {

    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
  
    cy.get(`section ${workforceSelector.tableRow} .cell-content`)
      .eq(0)
      .invoke('text')
      .then((deletedAlert) => {
  
        const trimmedAlert = deletedAlert.trim();
  
        cy.get(`section ${workforceSelector.tableRow} [type="checkbox"]`)
          .eq(0)
          .check({ force: true });
  
        cy.get('.label.default__label')
          .should('contain', '1');
  
        cy.contains('button p', 'Delete').click();
        cy.contains('.delete-dialog-footer button p', 'Delete').click();
  
        cy.get(workforceSelector.toastMessage)
          .should('contain', 'Deleted successfully');
  
        cy.get('.filter-alert-select-container [label="Unresolved"]')
          .should('be.visible')
          .click();
  
        cy.contains('.alert-type-label', 'Resolved').click();
  
        cy.get('.filter-alert-select-container [label="Resolved"]')
          .should('be.visible')
          .click();
  
        cy.contains('.alert-type-label', 'Unresolved').click();
  
        cy.wait(1000);
  
        cy.get('body').then(($body) => {
  
          if ($body.find(`section ${workforceSelector.tableRow}`).length > 0) {
  
            cy.get(`section ${workforceSelector.tableRow}`)
              .find('.cell-content')
              .then(($cells) => {
  
                const texts = $cells.toArray().map(el => el.innerText.trim());
                const match = texts.filter(text => text === trimmedAlert);
  
                expect(match.length).to.equal(0);
  
              });
  
          } else {
  
            cy.get('.empty-body__title')
              .should('contain', 'No safety notifications yet!');
  
          }
  
        });
  
      });
  
  });

  it('should add a comment to a safety alert and verify it appears in the comment list', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
    cy.get(`section ${workforceSelector.tableRow}`).eq(0).find('svg').last().click();
    SafetyAuditPage.addRandomComment();
  });


  it('validating the ui of add comment', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
    cy.get(`section ${workforceSelector.tableRow}`).eq(0).find('svg').last().click();

    cy.get('.comment-header-container').contains('Comment').should('be.visible');

    cy.get('.comment-item-body__content').eq(0).realHover();
    cy.get('[label="Edit"]', { timeout: 10000 }).should('exist').and('be.visible');
    cy.get('[label="Delete"]', { timeout: 10000 }).should('exist').and('be.visible');
  });


  it('should edit a comment to a safety alert and verify it appears in the comment list', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();
    cy.get(`section ${workforceSelector.tableRow}`).eq(0).find('svg').last().click();

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
        SafetyAuditPage.addRandomComment().then(() => {
          editComment();
        });
      }
    });
  });


  it('should delete a comment from a safety alert and verify it is removed from the comment list', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();

    cy.get(`section ${workforceSelector.tableRow}`).eq(0).find('svg').last().click();
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

              cy.get(workforceSelector.toastMessage).contains('Comment deleted successfully!');

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
        SafetyAuditPage.addRandomComment().then(() => {
          deleteComment();
        });
      }
    });
  });


  it('Should verify all safety alert filters display the correct alert types', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();

    const verifyAlertFilter = (filterLabel, alertType) => {
      const today = new Date();
      const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

      cy.get(`[label="${filterLabel}"]`).click();
      cy.contains('.alert-type-label', alertType).click();
      cy.get(`.filter-alert-calender-container [label="12/20/2020 - ${formattedDate}"]`).should('be.visible');
      cy.wait(5000);

      cy.get('body').then(($body) => {
        if ($body.find(`section ${workforceSelector.tableRow}`).length > 0) {
          cy.get('.table-wrapper').eq(1).each(($table) => {
            cy.wrap($table).within(() => {
              cy.get(`${workforceSelector.tableRow} .label.default__label`).contains(alertType).should('be.visible');
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


  it('should verify that safety alerts are displayed in descending order by date', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();

    cy.get(`section ${workforceSelector.tableRow} .cell-content`)
      .then(($dates) => {
        const dateArray = $dates.toArray().map(el => new Date(el.innerText.trim()));

        for (let i = 0; i < dateArray.length - 1; i++) {
          expect(dateArray[i].getTime()).to.be.gte(dateArray[i + 1].getTime());
        }

        cy.log('All alerts are in descending order by date');
      });
  });


  it('Verify Comment has no character limit', () => {
    cy.get(workforceSelector.tableRow).eq(0).click({ force: true });
    cy.get(workforceSelector.SafetyAuditPage).click();

    cy.get(`section ${workforceSelector.tableRow}`).eq(0).find('svg').last().click();

    const longComment = 'A'.repeat(5000);

    cy.get('textarea')
      .should('be.visible')
      .clear()
      .type(longComment, { delay: 0 });
    cy.contains('button p', 'Add Comment').click();

    cy.get('.comment-item-body__content').should('be.visible');

    cy.get('.comment-item-body__content')
      .first()
      .invoke('text')
      .then((text) => {
        expect(text.length).to.eq(longComment.length);
        expect(text).to.eq(longComment);
      });
  });


  it("Verify Selected Safety Audit Alerts Count Matches Worker Alerts Summary", () => {


    cy.get(workforceSelector.tableRow).eq(1).within(() => {
      cy.get('.personal-info-content__title')
        .invoke('text')
        .then((name) => {
          cy.log(`Worker Name: ${name.trim()}`);
          console.log(`Worker Name: ${name.trim()}`);
        });
    });

    let totalSafetyAuditCount = 0;

    cy.get(workforceSelector.tableRow).eq(1).within(() => {
      cy.get('.default__label:visible').each(($el) => {
        const text = $el.text().trim();
        cy.log(`Found label: ${text}`);

        const numberMatch = text.match(/\+\s*(\d+)/);

        if (numberMatch) {
          totalSafetyAuditCount += Number(numberMatch[1]);
        } else if (text.length > 0) {
          totalSafetyAuditCount += 1;
        }
      });
    }).then(() => {
      cy.log(`Total Safety Audit Count: ${totalSafetyAuditCount}`);
      console.log('Total Safety Audit Count:', totalSafetyAuditCount);

      cy.get(workforceSelector.tableRow).eq(1).click({ force: true });
      cy.get(workforceSelector.SafetyAuditPage).click();

      cy.get('p').contains('Safety Audit').should('be.visible');
      cy.get(`section ${workforceSelector.tableRow}`).should('be.visible');

      cy.get('section .header-checkbox-container [type="checkbox"]').first()
        .check({ force: true });

      cy.get('.selected-container .default__label')
        .invoke('text')
        .then((selectedText) => {
          const selectedMatch = selectedText.match(/(\d+)/);
          const selectedCount = selectedMatch ? Number(selectedMatch[1]) : 0;

          cy.log(`Selected Alerts Count: ${selectedCount}`);
          console.log('Selected Alerts Count:', selectedCount);

          expect(selectedCount).to.equal(totalSafetyAuditCount);
        });
    });
  });

});