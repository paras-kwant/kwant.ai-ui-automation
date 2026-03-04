/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { throttle } from 'rxjs';
import { workforceSelector } from '../../support/workforceSelector';
import workerHelper from '../../support/helper/workerHelper.js';

describe(
  "Worker Module - Pagination",
  { tags: ["Epic:WorkForce", "Feature:Pagination", "Module:Workforce-Worker"] },
  () => {

    beforeEach(() => {
      cy.loginAndVisit(() => workerHelper.visitWorkersPageForProject('500526306'));
    });

    it(
      'Verify pagination breaks into pages if 100+ workers exist',
      { tags: ["Story:Pagination Breaks Into Pages For 100+ Workers", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.getTotalWorkers().then((totalValue) => {
          cy.log('Total workers: ' + totalValue);

          if (totalValue > 100) {
            workforceSelector.pageTwo().should('be.visible');
          } else {
            workforceSelector.pageTwo().should('not.exist');
          }
        });
      }
    );

    it(
      'Verify Next and previous button navigates to respective page',
      { tags: ["Story:Pagination Next And Previous Navigation", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.getTotalWorkers().then((totalValue) => {
          const totalPages = Math.ceil(totalValue / 100);

          if (totalPages > 1) {
            cy.log(`Total workers: ${totalValue}, Total pages: ${totalPages}`);

            workforceSelector.previousButton().should('be.disabled');
            workforceSelector.nextButton().should('not.be.disabled');
            workforceSelector.nextButton().click();
            cy.wait(1000);

            workforceSelector.previousButton().should('not.be.disabled');
            workforceSelector.nextButton().should('not.be.disabled');

            workforceSelector.previousButton().click();
            cy.wait(1000);

            workforceSelector.previousButton().should('be.disabled');
          } else {
            workforceSelector.previousButton().should('be.disabled');
            workforceSelector.nextButton().should('be.disabled');
          }
        });
      }
    );

    it(
      'Verify ellipsis (…) appears when total pages exceed threshold',
      { tags: ["Story:Pagination Ellipsis Appears For Many Pages", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
        cy.getTotalWorkers().then((totalValue) => {
          cy.log('Total workers: ' + totalValue);
          if (totalValue > 300) {
            cy.get('.sc-kbhJrz.fOvnLJ svg').should('be.visible');
          } else {
            cy.get('.sc-kbhJrz.fOvnLJ svg').should('not.exist');
          }
        });
      }
    );

    it(
      'Verify LAST page disables Next button',
      { tags: ["Story:Pagination Last Page Disables Next Button", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

        cy.getTotalWorkers().then((totalValue) => {
          const totalPages = Math.ceil(totalValue / 100);
          if (totalPages > 1) {
            cy.log(`Total workers: ${totalValue}, Total pages: ${totalPages}`);
            workforceSelector.lastPageButton().should('be.visible').click();
            workforceSelector.nextButton().should('be.disabled');
          }
        });
      }
    );

    it(
      'Verify FIRST page disables previous button',
      { tags: ["Story:Pagination First Page Disables Previous Button", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

        cy.getTotalWorkers().then((totalValue) => {
          const totalPages = Math.ceil(totalValue / 100);
          if (totalPages > 1) {
            cy.log(`Total workers: ${totalValue}, Total pages: ${totalPages}`);
            workforceSelector.pageOne().should('be.visible').click();
            workforceSelector.previousButton().should('be.disabled');
          }
        });
      }
    );

    it(
      'Verify clicking page numbers navigates to correct page',
      { tags: ["Story:Pagination Page Number Navigation", "Severity:critical", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

        cy.getTotalWorkers().then((totalValue) => {
          const totalPages = Math.ceil(totalValue / 500);
          if (totalPages > 5) {
            cy.log(`Total workers: ${totalValue}, Total pages: ${totalPages}`);

            cy.get('button').contains('2').click();
            workforceSelector.pageTwo().invoke('attr', 'class').then((classValue) => {
              const classCount = classValue.split(' ').length;
              expect(classCount).to.eq(6);
            });

            cy.get('button').contains('3').click();
            workforceSelector.pageThree().invoke('attr', 'class').then((classValue) => {
              const classCount = classValue.split(' ').length;
              expect(classCount).to.eq(6);
            });

            cy.get('button').contains('4').click();
            workforceSelector.pageFour().invoke('attr', 'class').then((classValue) => {
              const classCount = classValue.split(' ').length;
              expect(classCount).to.eq(6);
            });
          }
        });
      }
    );

    it(
      'Verify page scroll resets to top after navigating between pages',
      { tags: ["Story:Pagination Scroll Resets To Top On Page Change", "Severity:normal", "UI", "Module:Workforce-Worker"] },
      () => {
        cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

        cy.getTotalWorkers().then((totalValue) => {
          const pageSize = 100;
          const totalPages = Math.ceil(totalValue / pageSize);

          if (totalPages < 2) {
            cy.log("Only one page available — skipping scroll test.");
            return;
          }

          cy.get('.table-wrapper').scrollTo('bottom', { duration: 1000, ensureScrollable: false });
          cy.get('.table-wrapper').should(($el) => {
            expect($el[0].scrollTop).to.be.greaterThan(0);
          });

          workforceSelector.pageTwo().should('be.visible').click();
          cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

          cy.get('.table-wrapper').then((wrapper) => {
            expect(wrapper[0].scrollTop).to.be.lte(0);
          });
        });
      }
    );

  }
);