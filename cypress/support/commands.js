
import { workforceSelector } from './workforceSelector';  
import workerHelper from './helper/workerHelper';


Cypress.Commands.add('login', () => {
  cy.session([Cypress.env('EMAIL'), Cypress.env('PASSWORD')], () => {
    cy.visit('/') 
    cy.get('[name="email"]').type(Cypress.env('EMAIL'))
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'))
    cy.get('button p').contains('Login').click()
    cy.wait(8000)
  
  }, {
    cacheAcrossSpecs: false 
  })
})


  Cypress.Commands.add("searchAndDeleteWorker", (firstName, lastName) => {
    cy.get(workforceSelector.searchInput).clear().type(firstName + " " + lastName);
  
    cy.get(".personal-info-content > .personal-info-content__title")
      .contains(`${firstName} ${lastName}`)
      .should("be.visible");
  
      cy.get('.header-checkbox-container [type="checkbox"]')
      .eq(0)
      .check({ force: true });
    
    cy.get(".sc-gFAWRd>.sc-aXZVg>button").click();
    cy.get(".delete-btn").click();
    cy.get("button>p").contains("Delete").click();
  
    cy.get(".sc-kOPcWz")
      .contains("successfully deleted")
      .should("be.visible");
  });


  Cypress.Commands.add(
    'verifyTableorEmptyState',
    ({ tableRowSelector, cellSelector, expectedText }) => {
  
      cy.wait(2000); // allow UI render
  
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
  
                expect(
                  hasMatch,
                  `Row should contain "${expectedText}"`
                ).to.be.true;
              });
  
          });
  
        } else {
          cy.get('.empty-body').should(
            'have.text',
            'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
          );
        }
      });
    }
  );
  
  


Cypress.Commands.add('getTotalWorkers', () => {
  return cy.get('.sc-kMkxaj.eTAOVM')
    .invoke('text')
    .then((text) => {
      const match = text.match(/(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/);
      return match ? Number(match[3]) : 0;
    });
});


Cypress.Commands.add('selectRandomOption', (inputSelector, optionSelector, name = 'option') => {
  cy.get(inputSelector).click(); 
  cy.get(optionSelector).should('be.visible').then(($options) => {
    if ($options.length === 0) {
      cy.log(`No ${name} found for selector: ${optionSelector}`);
      return;
    }
    const randomIndex = Cypress._.random(0, $options.length - 1);
    const $randomOption = $options.eq(randomIndex);
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


Cypress.Commands.add("cleanUI", () => {
  workerHelper.closeSidebarIfOpen();
})
