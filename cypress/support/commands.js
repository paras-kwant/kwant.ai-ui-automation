import { workforceSelector } from './workforceSelector';
import workerHelper from './helper/workerHelper';


Cypress.Commands.add('login', () => {
  cy.session([Cypress.env('EMAIL'), Cypress.env('PASSWORD')], () => {
    cy.visit('/');
    cy.get('[name="email"]').type(Cypress.env('EMAIL'));
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'));
    cy.get('button p').contains('Login').click();
    cy.url().should('include', '/projects');
  }, {
    cacheAcrossSpecs: true
  });
});

Cypress.Commands.add('captureAuthHeaders', () => {
  let authHeaders = {};

  cy.intercept('GET', '/api/projectConfigs', (req) => {
    authHeaders = {
      'x-auth-token': req.headers['x-auth-token'],
      'x-auth-project': req.headers['x-auth-project']
    };
  }).as('getConfig');

  return cy.wrap(authHeaders);
});


// ✅ Just login + navigate. Nothing else.
// Usage in every spec beforeEach:
//   cy.loginAndVisit(() => companiesHelper.visitCompaniesPage())
Cypress.Commands.add('loginAndVisit', (visitFn) => {
  cy.login();
  visitFn();
});


Cypress.Commands.add("searchAndDeleteWorker", (firstName, lastName) => {
  cy.get(workforceSelector.searchInput).clear().type(firstName + " " + lastName);

  cy.get(".personal-info-content > .personal-info-content__title")
    .contains(`${firstName} ${lastName}`)
    .should("be.visible");

  cy.get('.header-checkbox-container [type="checkbox"]')
    .eq(0)
    .check({ force: true });

  cy.get(workforceSelector.overflowMenu).click();
  cy.get(".delete-btn").click();
  cy.get("button p").contains("Delete").click();

  cy.get(workforceSelector.toastMessage).contains("successfully deleted")
    .should("be.visible");
});


Cypress.Commands.add(
  'verifyTableorEmptyState',
  ({ tableRowSelector, cellSelector, expectedText }) => {
    cy.wait(2000);

    cy.get('body').then(($body) => {
      const hasRows = $body.find(tableRowSelector).length > 0;

      if (hasRows) {
        cy.get(tableRowSelector).each(($row) => {
          cy.wrap($row)
            .find(cellSelector)
            .then(($cells) => {
              const hasMatch = [...$cells].some(cell =>
                cell.innerText.trim().includes(expectedText)
              );
              expect(hasMatch, `Row should contain "${expectedText}"`).to.be.true;
            });
        });
      } else {
        cy.get('.empty-body').contains('No Results Found').should('be.visible');
      }
    });
  }
);


Cypress.Commands.add('getTotalWorkers', () => {
  // return cy.get('.workforce-footer, .workers-footer')
  return cy.get('.table_footer, .workforce-footer, .table_section_footer, .workers-footer')
  
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      const numbers = text.match(/\d+/g);
      return Number(numbers[numbers.length - 1]);
    });
});


Cypress.Commands.add('selectRandomOption', (inputSelector, optionSelector, name = 'option') => {
  cy.get(inputSelector).click();
  cy.wait(1000)
  cy.get('body').should('be.visible');

  cy.get(optionSelector).should('be.visible').then(($options) => {
    if ($options.length === 0) {
      cy.log(`No ${name} found for selector: ${optionSelector}`);
      return;
    }

    const validOptions = [...$options].filter(el => {
      const text = el.innerText.trim();
      return text && text !== '-' && text.toLowerCase() !== 'none';
    });

    if (validOptions.length === 0) {
      cy.log(`No valid ${name} found (all were '-' or 'None')`);
      return;
    }

    const randomIndex = Cypress._.random(0, validOptions.length - 1);
    const $randomOption = Cypress.$(validOptions[randomIndex]);
    const optionText = $randomOption.text().trim();
    cy.log(`Selecting random ${name}: ${optionText}`);
    cy.wrap($randomOption).click({ force: true });
  });
});


Cypress.Commands.add('getWorkerField', (label) => {
  return cy.contains('.hover-hoc-container__label', label)
    .closest('.hover-hoc-container')
    .find('.hover-hoc-container__input__display-value');
});


Cypress.Commands.add("validateEmptyTable", ()=>{
  return cy.get('.empty-body').contains('No Results Found').should('be.visible');
})


Cypress.Commands.add("cleanUI", () => {
  cy.wait(1000);

  cy.get('body').then($body => {
    const $btn = $body.find('header button svg:visible');
    if ($btn.length) {
      cy.wrap($btn).last().click({ force: true });
    }
  });

  cy.get('body').then($body => {
    const $btn = $body.find('aside button svg:visible');
    if ($btn.length) {
      cy.wrap($btn).click({ force: true });
    }
  });

  cy.get('body').then($body => {
    if ($body.find('section button svg').length > 0) {
      cy.get('section button svg').eq(0).should('be.visible').click({ force: true });
    }
  });

  cy.get('body').then($body => {
    if ($body.find(".default__label:contains('Clear All')").length > 0) {
      cy.get(".default__label:contains('Clear All')").should('be.visible').click({ force: true });
    }
  });

  cy.get('body').then($body => {
    if ($body.find(".action-container").length > 0) {
      cy.get(".action-container").should('be.visible').click({ force: true });
    }
  });

  cy.get('body').then($body => {
    if ($body.find(workforceSelector.searchInput).length > 0) {
      cy.get(workforceSelector.searchInput).first().clear();
    }
  });

  



});