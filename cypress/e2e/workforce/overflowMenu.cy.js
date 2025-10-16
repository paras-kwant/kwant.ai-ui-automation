/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - overflowMenu", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Validate  the options in overflow menu', () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Delete').should('not.exist');
    cy.contains('.dropdown-option', 'Disable').should('not.exist');
    cy.contains('.dropdown-option', 'Change Value').should('not.exist');
    cy.contains('.dropdown-option', 'Send Alert').should('exist');

    cy.get(workforceSelector.tableRow).eq(0).find('[type="checkbox"]').check({ force: true });    

    cy.get(workforceSelector.overflowMenu).click()
    cy.contains('.dropdown-option', 'Delete').should('exist');
    cy.contains('.dropdown-option', 'Disable').should('exist');
    cy.contains('.dropdown-option', 'Change Value').should('exist');
    cy.contains('.dropdown-option', 'Send Alert').should('exist');
  });

  it('Validate the Change Value functionality', ()=>{
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.tableRow).eq(0).find('[type="checkbox"]').check({ force: true });
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


it.only('Validate the Change Value for multiple user using select feature', () => {
    cy.visit('/projects/94049707/workers');
        cy.get(workforceSelector.tableRow).eq(0).find('[type="checkbox"]').check({ force: true });
        cy.get(workforceSelector.tableRow).eq(1).find('[type="checkbox"]').check({ force: true });

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
          cy.log('Cost Code:', val)  
      })
      cy.get('[label="Crew"] input').invoke('val').then((val) => {
          cy.wrap(val).as('crew')
      })

      cy.wait(1000)

      cy.get(workforceSelector.saveButton).click()
      cy.get(workforceSelector.toastMessage).contains('Value changed successfully').should('be.visible');


      cy.get(workforceSelector.tableRow).eq(0).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();
  
      cy.get('@crew').then((crew) => {
          cy.log('Retrieved Cost Code:', crew)
          cy.get('.hover-hoc-container__input__display-value').eq(2).should('contain.text', crew);
      });

      cy.get('.sc-cRmqLi').eq(1).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();
      cy.contain
  
      cy.get('@crew').then((crew) => {
          cy.log('Retrieved Cost Code:', crew)
          cy.get('.hover-hoc-container__input__display-value').eq(2).should('contain.text', crew);
      });

    })
    it('Verify Disable Worker Functionality',()=>{
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
      cy.get('.sc-kOPcWz').contains('Device disabled for 1 worker(s).').should('be.visible');
      cy.get('.sc-cRmqLi').eq(0).click({force:true})
      cy.get('.sc-jXbUNg>.jmJtNV').eq(3).click();
      cy.get('.hover-hoc-container__input__display-value').contains('-').should('be.visible')
  })

  it('Verify warning message on disabling a disable user.',()=>{
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

  it('Verify warning message on disabling a worker without any assigned device.',()=>{
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.readFile('cypress/fixtures/noEmailWorker.json').then(({ firstName, lastName }) => {
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

it('Verify the deletion functionality for the selected user.',()=>{
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
