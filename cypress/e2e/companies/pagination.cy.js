/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';
import companiesHelper from '../../support/helper/companiesHelper';

function getTotalWorkers() {
  return cy.get('.workforce-footer')
    .invoke('text')
    .then((text) => {
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
}

describe("WorkForce Companies Module - Pagination", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });

  beforeEach(() => {
    companiesHelper.visitCompaniesPage();
  });

  it('Verify pagination is visible and default page is focused', () => {
    cy.get('.workforce-footer button')
      .filter((_, el) => el.innerText.trim() === '1')
      .invoke('attr', 'class')
      .then((classValue) => {
        expect(classValue.split(' ').length).to.eq(6);
      });
  });

  it('Verify pagination breaks into pages if 100+ workers exist', () => {
    getTotalWorkers().then((totalValue) => {
      if (totalValue > 100) {
        cy.get('.workforce-footer button')
          .filter((_, el) => el.innerText.trim() === '2')
          .should('be.visible');
      } else {
        cy.get('.workforce-footer button')
          .filter((_, el) => el.innerText.trim() === '2')
          .should('not.exist');
      }
    });
  });

  it('Verify Next and previous button navigates to respective page', () => {
    getTotalWorkers().then((totalValue) => {
      const totalPages = Math.ceil(totalValue / 100);

      if (totalPages > 1) {
        cy.get('.workforce-footer button:has(svg)').first().should('be.disabled');
        cy.get('.workforce-footer button:has(svg)').last().should('not.be.disabled');

        cy.get('.workforce-footer button:has(svg)').last().click();
        cy.wait(1000);

        cy.get('.workforce-footer button:has(svg)').first().should('not.be.disabled');
        cy.get('.workforce-footer button:has(svg)').last().should('not.be.disabled');
        cy.get('.workforce-footer button:has(svg)').first().click();
        cy.wait(1000);

        cy.get('.workforce-footer button:has(svg)').first().should('be.disabled');
      } else {
        cy.get('.workforce-footer button:has(svg)').first().should('be.disabled');
        cy.get('.workforce-footer button:has(svg)').last().should('be.disabled');
      }
    });
  });

  it('Verify ellipsis appears when total pages exceed threshold', () => {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');
    getTotalWorkers().then((totalValue) => {
      if (totalValue > 700) {
        cy.get('.workforce-footer').contains('…').should('be.visible');
      } else {
        cy.get('.workforce-footer').contains('…').should('not.exist');
      }
    });
  });

  it('Verify LAST page disables Next button', () => {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

    getTotalWorkers().then((totalValue) => {
      const totalPages = Math.ceil(totalValue / 100);

      if (totalPages > 1) {
        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .last()
          .click();

        cy.get('.workforce-footer button:has(svg)')
          .last()
          .should('be.disabled');
      }
    });
  });

  it('Verify FIRST page disables previous button', () => {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

    getTotalWorkers().then((totalValue) => {
      const totalPages = Math.ceil(totalValue / 100);

      if (totalPages > 1) {
        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .first()
          .click();

        cy.get('.workforce-footer button:has(svg)')
          .first()
          .should('be.disabled');
      }
    });
  });

  it('Verify clicking page numbers navigates to correct page', () => {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

    getTotalWorkers().then((totalValue) => {
      const totalPages = Math.ceil(totalValue / 100);

      if (totalPages > 3) {
        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .eq(1)
          .click();

        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .eq(1)
          .invoke('attr', 'class')
          .then((classValue) => {
            expect(classValue.split(' ').length).to.eq(6);
          });

        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .eq(2)
          .click();

        cy.get('.workforce-footer button')
          .filter((_, el) => /^\d+$/.test(el.innerText.trim()))
          .eq(2)
          .invoke('attr', 'class')
          .then((classValue) => {
            expect(classValue.split(' ').length).to.eq(6);
          });
      }
    });
  });

  it('Verify page scroll resets to top after navigating between pages', () => {
    cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

    getTotalWorkers().then((totalValue) => {
      const pageSize = 100;
      const totalPages = Math.ceil(totalValue / pageSize);

      if (totalPages < 2) {
        return;
      }

      cy.get('.table-wrapper').scrollTo('bottom', { duration: 1000, ensureScrollable: false });

      cy.get('.table-wrapper').should(($el) => {
        expect($el[0].scrollTop).to.be.greaterThan(0);
      });

      cy.get('.workforce-footer button')
        .filter((_, el) => el.innerText.trim() === '2')
        .click();

      cy.get(workforceSelector.tableRow).eq(0).should('be.visible');

      cy.get('.table-wrapper').then((wrapper) => {
        expect(wrapper[0].scrollTop).to.be.lte(0);
      });
    });
  });

});