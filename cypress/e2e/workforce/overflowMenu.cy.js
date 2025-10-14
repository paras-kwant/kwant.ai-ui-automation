/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - select", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Validate total worker count matches displayed label after selecting all workers', () => {
    cy.visit('/projects/94049707/workers');
    cy.wait(3000);

    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Delete').should('not.exist');
    cy.contains('.dropdown-option', 'Disable').should('not.exist');
    cy.contains('.dropdown-option', 'Change Value').should('not.exist');
    cy.contains('.dropdown-option', 'Send Alert').should('exist');

    cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });    

    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Delete').should('exist');
    cy.contains('.dropdown-option', 'Disable').should('exist');
    cy.contains('.dropdown-option', 'Change Value').should('exist');
    cy.contains('.dropdown-option', 'Send Alert').should('exist');

  });

  it('Change Value', ()=>{
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Change Value').click(); 

    cy.get('.sc-fHjqPf.lazXQn').eq(0).click()
    cy.get('.sc-tagGq').then(($elements) => {
        const randomIndex = Math.floor(Math.random() * $elements.length);
        cy.wrap($elements[randomIndex]).click({ force: true });
    });

    cy.get('.sc-fHjqPf.lazXQn').eq(1).click()
    cy.get('.sc-tagGq').then(($elements) => {
        const randomIndex = Math.floor(Math.random() * $elements.length);
        cy.wrap($elements[randomIndex]).click({ force: true });
    });

    cy.get('.sc-fHjqPf.lazXQn').eq(2).click()
    cy.get('.sc-tagGq').then(($elements) => {
        const randomIndex = Math.floor(Math.random() * $elements.length);
        cy.wrap($elements[randomIndex]).click({ force: true });
    });
    cy.get('[label="Job Title"] input').invoke('val').then((val) => {
        cy.wrap(val).as('jobTitle')
    })
    cy.get('[label="Cost Code"] input').invoke('val').then((val) => {
        cy.wrap(val).as('costCode')
        cy.log('Cost Code:', val)  // Log to verify
    })
    cy.get('[label="Crew"] input').invoke('val').then((val) => {
        cy.wrap(val).as('crew')
    })

    cy.get(workforceSelector.saveButton).click()
    cy.get('.sc-kOPcWz').contains('Value changed successfully').should('be.visible');

    cy.get('.sc-cRmqLi').eq(0).click({force:true})
    cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();

    cy.get('@crew').then((crew) => {
        cy.log('Retrieved Cost Code:', crew)
        cy.get('.hover-hoc-container__input__display-value').eq(2).should('contain.text', crew);
    });
})


it('Change Value for Two Users and Validate', () => {
    cy.visit('/projects/94049707/workers');
    cy.wait(3000);


        cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });
        cy.get('.sc-cRmqLi').eq(1).find('[type="checkbox"]').check({ force: true });

        cy.get(workforceSelector.overflowMenu).click();
        cy.contains('.dropdown-option', 'Change Value').click();

        cy.get('.sc-fHjqPf.lazXQn').eq(0).click();
        cy.get('.sc-tagGq').then(($elements) => {
            const randomIndex = Math.floor(Math.random() * $elements.length);
            cy.wrap($elements[randomIndex]).click({ force: true });
        });

        cy.get('.sc-fHjqPf.lazXQn').eq(1).click();
        cy.get('.sc-tagGq').then(($elements) => {
            const randomIndex = Math.floor(Math.random() * $elements.length);
            cy.wrap($elements[randomIndex]).click({ force: true });
        });

        cy.get('.sc-fHjqPf.lazXQn').eq(2).click();
        cy.get('.sc-tagGq').then(($elements) => {
            const randomIndex = Math.floor(Math.random() * $elements.length);
            cy.wrap($elements[randomIndex]).click({ force: true });
        });
        cy.get('[label="Job Title"] input').invoke('val').then((val) => {
          cy.wrap(val).as('jobTitle')
      })
      cy.get('[label="Cost Code"] input').invoke('val').then((val) => {
          cy.wrap(val).as('costCode')
          cy.log('Cost Code:', val)  // Log to verify
      })
      cy.get('[label="Crew"] input').invoke('val').then((val) => {
          cy.wrap(val).as('crew')
      })

      cy.get(workforceSelector.saveButton).click()

      cy.get('.sc-kOPcWz').contains('Value changed successfully').should('be.visible');

      cy.get('.sc-cRmqLi').eq(0).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();
  
      cy.get('@crew').then((crew) => {
          cy.log('Retrieved Cost Code:', crew)
          cy.get('.hover-hoc-container__input__display-value').eq(2).should('contain.text', crew);
      });

      cy.get('.sc-cRmqLi').eq(1).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();
  
      cy.get('@crew').then((crew) => {
          cy.log('Retrieved Cost Code:', crew)
          cy.get('.hover-hoc-container__input__display-value').eq(2).should('contain.text', crew);
      });

    })
    it('Disable worker',()=>{
      cy.visit('/projects/94049707/workers');
      cy.wait(3000)
      cy.readFile('cypress/fixtures/createdWorker.json').then(({ firstName, lastName }) => {
          cy.get(workforceSelector.searchInput)
            .clear()
            .type(`${firstName} ${lastName}`);
        });
        cy.wait(2000)
        
      cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });
      cy.get(workforceSelector.overflowMenu).click()
      cy.contains('.dropdown-option', 'Disable').click();
      cy.get('button p').contains('Confirm').click()
      // cy.get('.sc-kOPcWz').contains('Device disabled for 1 worker(s).').should('be.visible');
      cy.get('.sc-cRmqLi').eq(0).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(3).click();
      cy.get('.hover-hoc-container__input__display-value').contains('-').should('be.visible')
  })

  it('Disable worker who arent assigned any device ',()=>{
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.readFile('cypress/fixtures/createdWorker.json').then(({ firstName, lastName }) => {
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(`${firstName} ${lastName}`);
      });
      cy.wait(2000)
      
    cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });
    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Disable').click();
    cy.get('button p').contains('Confirm').click()
    cy.get('.sc-kOPcWz').contains('Device not assigned to selected worker(s).').should('be.visible');
})

it('Delete Selected user ',()=>{
  cy.visit('/projects/94049707/workers');
  cy.wait(3000)
  cy.readFile('cypress/fixtures/createdWorker.json').then(({ firstName, lastName }) => {
      cy.get(workforceSelector.searchInput)
        .clear()
        .type(`${firstName} ${lastName}`);
    });
    cy.wait(2000)

  cy.get('.sc-cRmqLi').eq(0).find('[type="checkbox"]').check({ force: true });
  cy.get(workforceSelector.overflowMenu).click()
  cy.contains('.dropdown-option', 'Delete').click();
  cy.get('button p').contains('Delete').click()
  cy.get('.empty-body').should(
    'have.text',
    'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
  );
  })
    
});
