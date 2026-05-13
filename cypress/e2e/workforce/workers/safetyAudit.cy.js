/// <reference types="cypress" />
import { workforceSelector } from "../../../support/workforceSelector";
import "cypress-real-events/support";
import SafetyAuditPage from "../../../pages/workforce/safetyAudit";
const PROJECT_ID = Cypress.env('PROJECT_ID');

describe(
  "Worker Module - Safety Audit",
  { tags: ["Epic:WorkForce", "Feature:SafetyAudit", "Module:Workforce-Worker"] },
  () => {

    before(() => {
      cy.loginAndVisit(() => cy.visit(`/projects/${PROJECT_ID}/workers`));

      cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
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
      cy.wait(2000);
      cy.get("body").then(($body) => {
        if ($body.find('section').length > 0) {
          cy.get('body').click(0, 0);
        }
      });
    });

    it(
      "Verify Safety Audit Drawer UI and Default Filters Display Correctly",
      { tags: ["Story:Safety Audit Drawer UI And Default Filters", "Severity:normal", "UI", "@smoke"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        const today = new Date();
        const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

        cy.get("p").contains("Safety Audit").should("be.visible");
        cy.get(SafetyAuditPage.selectors.alertTypeFilter('All Alerts')).should('be.visible');
        cy.get(SafetyAuditPage.selectors.alertTypeFilter('Unresolved')).should('be.visible');
        cy.get(SafetyAuditPage.selectors.calendarContainer)
          .should('be.visible')
          .and('contain.text', formattedDate);
        cy.wait(1000);
        cy.get(workforceSelector.documentTableRow).should('be.visible');
      }
    );

    it(
      'Verify Safety Audit Alert Filters (All, Resolved, Unresolved) Functionality',
      { tags: ["Story:Safety Audit Alert Filter All Resolved Unresolved", "Severity:critical", "UI", "@smoke"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        SafetyAuditPage.verifyResolvedRowsNotExist();
        SafetyAuditPage.verifyUnresolvedRowsExist();

        SafetyAuditPage.switchAlertFilter('Unresolved', 'All');
        cy.get(SafetyAuditPage.selectors.auditTableRow).should('be.visible');

        SafetyAuditPage.switchAlertFilter('All', 'Resolved');
        cy.wait(1500);
        SafetyAuditPage.verifyResolvedRowsOrEmpty();
      }
    );

    it(
      'Verify Red Warning Indicator Appears in Safety Audit Section When Alerts Exist',
      { tags: ["Story:Safety Audit Red Warning Indicator Visible", "Severity:critical", "UI", "@smoke"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        cy.get(workforceSelector.SafetyAuditPage).find('[fill="#DF4242"]').should('exist');
      }
    );

    it(
      'verifies checkbox selection in safety audit updates the alert count correctly',
      { tags: ["Story:Safety Audit Checkbox Selection Updates Alert Count", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(1).then(($row) => {
          const $cell = $row.find('.table_td:nth-child(12) .default__label:nth-child(1)');
          let numericValue = 0;

          if ($cell.length > 0) {
            numericValue = parseInt($cell.text().trim().replace('+', ''), 10);
          }

          const expectedValue = numericValue + 1;
          cy.log(`Current value: ${numericValue}, Expected after increment: ${expectedValue}`);

          SafetyAuditPage.openDrawer(1);

          SafetyAuditPage.checkFirstAlert();
          cy.get(SafetyAuditPage.selectors.selectedLabel).should('contain', '1');

          cy.get('[overflow="scroll"] [type="checkbox"]').check({ force: true });
          cy.get(SafetyAuditPage.selectors.selectedLabel).should('contain', expectedValue.toString());
        });
      }
    );

    it(
      'verifies resolving an alert moves it from Unresolved to Resolved list',
      { tags: ["Story:Safety Audit Resolve Alert Moves To Resolved List", "Severity:critical", "UI", "@smoke"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        SafetyAuditPage.getFirstAlertText().then((alertText) => {
          cy.log(`Original Alert: ${alertText}`);

          SafetyAuditPage.checkFirstAlert();
          SafetyAuditPage.resolveSelectedAlerts();

          SafetyAuditPage.switchAlertFilter('Unresolved', 'Resolved');
          cy.wait(1000);

          cy.get('body').then(($body) => {
            if ($body.find(SafetyAuditPage.selectors.auditTableRow).length > 0) {
              SafetyAuditPage.verifyAlertInResolvedList(alertText);
            } else {
              SafetyAuditPage.verifyEmptyState();
            }
          });

          SafetyAuditPage.switchAlertFilter('Resolved', 'Unresolved');
          cy.wait(1000);
          SafetyAuditPage.verifyAlertAbsentFromList(alertText);
        });
      }
    );

    it(
      "Verify that Yellow or Red color is displayed for workers with unsafe security alerts",
      { tags: ["Story:Safety Audit Yellow Or Red Indicator For Unsafe Alerts", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).each(($row) => {
          cy.wrap($row)
            .find(SafetyAuditPage.selectors.alertTooltip)
            .invoke('text')
            .then((text) => {
              const cleanText = text.replace(/ /g, '').trim();
              expect(cleanText).to.match(/^(Yellow|Red)$/);
            });
        });
      }
    );

    it(
      'should delete a safety alert and verify it is no longer visible in the same list',
      { tags: ["Story:Safety Audit Delete Alert Removes From List", "Severity:critical", "UI", "@smoke"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        SafetyAuditPage.getFirstAlertText().then((alertText) => {
          SafetyAuditPage.checkFirstAlert();
          cy.get(SafetyAuditPage.selectors.selectedLabel).should('contain', '1');

          SafetyAuditPage.deleteSelectedAlerts();

          SafetyAuditPage.switchAlertFilter('Unresolved', 'Resolved');
          SafetyAuditPage.switchAlertFilter('Resolved', 'Unresolved');
          cy.wait(1000);

          SafetyAuditPage.verifyAlertAbsentFromList(alertText);
        });
      }
    );

    it(
      'should add a comment to a safety alert and verify it appears in the comment list',
      { tags: ["Story:Safety Audit Add Comment To Alert", "Severity:critical", "UI"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        SafetyAuditPage.openCommentPanel(0);
        SafetyAuditPage.addRandomComment();
      }
    );

    it(
      'validating the ui of add comment',
      { tags: ["Story:Safety Audit Add Comment UI Validation", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        SafetyAuditPage.openCommentPanel(0);
        SafetyAuditPage.addRandomComment();
        cy.get(SafetyAuditPage.selectors.commentHeader).contains('Comment').should('be.visible');
        cy.get(SafetyAuditPage.selectors.commentItem).eq(0).realHover();
        cy.get('[label="Edit"]', { timeout: 10000 }).should('exist').and('be.visible');
        cy.get('[label="Delete"]', { timeout: 10000 }).should('exist').and('be.visible');
      }
    );

    it(
      'should edit a comment to a safety alert and verify it appears in the comment list',
      { tags: ["Story:Safety Audit Edit Comment On Alert", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        SafetyAuditPage.openCommentPanel(0);
        SafetyAuditPage.ensureCommentExists();
        SafetyAuditPage.editFirstComment();
      }
    );

    it(
      'should delete a comment from a safety alert and verify it is removed from the comment list',
      { tags: ["Story:Safety Audit Delete Comment From Alert", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        SafetyAuditPage.openCommentPanel(0);
        cy.wait(3000);

        SafetyAuditPage.ensureCommentExists();
        SafetyAuditPage.deleteFirstComment().then((deletedComment) => {
          cy.get(SafetyAuditPage.selectors.commentPanel)
            .scrollTo('top', { ensureScrollable: false });
          cy.wait(2000);

          cy.get('body').then(($b) => {
            if ($b.find(SafetyAuditPage.selectors.commentItem).length > 0) {
              cy.get(SafetyAuditPage.selectors.commentItem).each(($el) => {
                expect($el.text().trim()).not.to.equal(deletedComment);
              });
            } else {
              cy.log('No comments remaining');
            }
          });
        });
      }
    );

    it(
      'Should verify all safety alert filters display the correct alert types',
      { tags: ["Story:Safety Audit All Alert Type Filters Display Correctly", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        const verifyAlertFilter = (filterLabel, alertType) => {
          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

          SafetyAuditPage.switchAlertFilter(filterLabel, alertType);
          cy.get(SafetyAuditPage.selectors.calendarContainer)
            .should('be.visible')
            .and('contain.text', formattedDate);
          cy.wait(5000);

          cy.get('body').then(($body) => {
            if ($body.find(SafetyAuditPage.selectors.auditTableRow).length > 0) {
              cy.get(SafetyAuditPage.selectors.tableWrapper).eq(1).each(($table) => {
                cy.wrap($table).within(() => {
                  cy.get(`${workforceSelector.tableRow} ${SafetyAuditPage.selectors.selectedLabel}`)
                    .contains(alertType).should('be.visible');
                }).scrollTo('bottom', { duration: 1000, ensureScrollable: false });
              });
            } else {
              SafetyAuditPage.verifyEmptyState();
            }
          });
        };

        verifyAlertFilter('All Alerts', 'SOS');
        verifyAlertFilter('SOS', 'Fatigue');
        verifyAlertFilter('Fatigue', 'Fall');
        verifyAlertFilter('Fall', 'Unsafe');
        verifyAlertFilter('Unsafe', 'Near Miss');
        verifyAlertFilter('Near Miss', 'Restricted');
      }
    );

    it(
      'should verify that safety alerts are displayed in descending order by date',
      { tags: ["Story:Safety Audit Alerts Displayed In Descending Date Order", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);

        cy.get(`${SafetyAuditPage.selectors.auditTableRow} ${SafetyAuditPage.selectors.cellContent}`)
          .then(($dates) => {
            const dateArray = $dates.toArray().map((el) => new Date(el.innerText.trim()));
            for (let i = 0; i < dateArray.length - 1; i++) {
              expect(dateArray[i].getTime()).to.be.gte(dateArray[i + 1].getTime());
            }
            cy.log('All alerts are in descending order by date');
          });
      }
    );

    it(
      'Verify Comment has no character limit',
      { tags: ["Story:Safety Audit Comment No Character Limit", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        SafetyAuditPage.openDrawer(0);
        SafetyAuditPage.openCommentPanel(0);

        const longComment = 'A'.repeat(5000);

        cy.get('textarea').should('be.visible').clear().type(longComment, { delay: 0 });
        cy.contains('button p', 'Add Comment').click();

        cy.get(SafetyAuditPage.selectors.commentItem).should('be.visible');
        cy.get(SafetyAuditPage.selectors.commentItem).first().invoke('text').then((text) => {
          expect(text.length).to.eq(longComment.length);
          expect(text).to.eq(longComment);
        });
      }
    );

    it(
      "Verify Selected Safety Audit Alerts Count Matches Worker Alerts Summary",
      { tags: ["Story:Safety Audit Selected Alerts Count Matches Summary", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        // Read badge count only from the safety alert cell (12th column) to avoid counting unrelated labels
        cy.get(workforceSelector.tableRow).eq(2).within(() => {
          cy.get(SafetyAuditPage.selectors.workerName).invoke('text').then((name) => {
            cy.log(`Worker Name: ${name.trim()}`);
          });
        });

        cy.wrap(0).as('totalSafetyAuditCount');

        cy.get(workforceSelector.tableRow).eq(2).within(() => {
          cy.get('.table_td:nth-child(12) .default__label:visible').each(($el) => {
            const text = $el.text().trim();
            cy.log(`Found label: ${text}`);
            cy.get('@totalSafetyAuditCount').then((count) => {
              const numberMatch = text.match(/\+\s*(\d+)/);
              const increment = numberMatch ? Number(numberMatch[1]) : (text.length > 0 ? 1 : 0);
              cy.wrap(count + increment).as('totalSafetyAuditCount');
            });
          });
        });

        cy.get('@totalSafetyAuditCount').then((totalSafetyAuditCount) => {
          cy.log(`Total Safety Audit Count: ${totalSafetyAuditCount}`);

          SafetyAuditPage.openDrawer(2);

          cy.get('p').contains('Safety Audit').should('be.visible');

          // Switch to "All" status filter so resolved + unresolved alerts are both visible,
          // matching the row badge count which includes all alert states
          SafetyAuditPage.switchAlertFilter('Unresolved', 'All');

          cy.get(SafetyAuditPage.selectors.auditTableRow).should('be.visible');

          SafetyAuditPage.checkAllAlerts();

          cy.get(SafetyAuditPage.selectors.selectedCountLabel).invoke('text').then((selectedText) => {
            const selectedMatch = selectedText.match(/(\d+)/);
            const selectedCount = selectedMatch ? Number(selectedMatch[1]) : 0;
            cy.log(`Selected Alerts Count: ${selectedCount}`);
            expect(selectedCount).to.equal(totalSafetyAuditCount);
          });
        });
      }
    );

  }
);
