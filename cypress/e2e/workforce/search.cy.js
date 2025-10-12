/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  



describe("Worker Module - Search", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Validating the search functionality - run twice', () => {
    cy.visit('/projects/94049707/workers');
    cy.intercept('POST', '/api/filterProjectWorker*').as('workersApi');
    cy.reload();
  
    cy.wait('@workersApi').then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map(worker => worker.firstName).filter(Boolean);
      cy.log(`First names: ${firstNames.join(', ')}`);
  
      const randomNames = Cypress._.sampleSize(firstNames, 2);
  
      randomNames.forEach((name, index) => {
        cy.log(`Search attempt ${index + 1}: ${name}`);
        cy.get(workforceSelector.searchInput).clear().type(name);
        cy.wait(3000)
  
        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length) {
            cy.get(workforceSelector.tableRow).contains(name).should('be.visible');
        
          } else {
            throw new Error(`Neither worker list nor alternate element found for "${name}"`);
          }
        });
      });
    });
  });
  
  
  it('Search triggers API only when at least 3 letters are entered', () => {
    cy.visit('/projects/94049707/workers');
    cy.wait(3000)
    cy.get(workforceSelector.tableRow)
    .then(($els) => {
      const initialList = [...$els].map(el => el.innerText.trim());
      cy.log('Initial List:', JSON.stringify(initialList));
      console.log('Initial List:', initialList); 

      cy.get(workforceSelector.searchInput).clear().type('a');

      cy.get(workforceSelector.tableRow).then(($newEls) => {
        const newList = [...$newEls].map(el => el.innerText.trim());
        cy.log('New List:', JSON.stringify(newList));
        console.log('New List:', newList); 
        expect(newList).to.deep.equal(initialList);
        
      });
    });

    cy.get(workforceSelector.tableRow)
    .then(($els) => {
      const initialList = [...$els].map(el => el.innerText.trim());
      cy.log('Initial List:', JSON.stringify(initialList));
      console.log('Initial List:', initialList); 

      cy.get(workforceSelector.searchInput).clear().type('aa');

      cy.get(workforceSelector.tableRow).then(($newEls) => {
        const newList = [...$newEls].map(el => el.innerText.trim());
        cy.log('New List:', JSON.stringify(newList));
        console.log('New List:', newList); 
        expect(newList).to.deep.equal(initialList);
        
      });
    });

    cy.get(workforceSelector.tableRow)
    .then(($els) => {
      const initialList = [...$els].map(el => el.innerText.trim());
      cy.log('Initial List:', JSON.stringify(initialList));
      console.log('Initial List:', initialList); 

      cy.get(workforceSelector.searchInput).clear().type('aha');
      cy.wait(3000)

      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).then(($newEls) => {
            const newList = [...$newEls].map(el => el.innerText.trim());
            console.log('New List:', newList);
  
            expect(newList).to.not.deep.equal(initialList);
          });
        } else {
          cy.get('.empty-body').should(
            'have.text',
            'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
          );
        }
      });
    });

  });
  


  it('Validating the search functionality for the search with no results', () => {
    cy.visit('/projects/94049707/workers');
    cy.get(workforceSelector.searchInput).clear().type('NonExistentName12345');
    cy.get('.empty-body').should('have.text', 'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters ')
    });


    it('Validating search functionality with empty input keeps rows unchanged', () => {
        cy.visit('/projects/94049707/workers');
        cy.wait(5000)
      
        cy.get('.personal-info-content__title').invoke("text").then((beforeText) => {
          const workerNamesBefore = beforeText.trim();
          cy.log('Before Search:', workerNamesBefore);
      
          cy.get(workforceSelector.searchInput).clear().type(' ');
      
          cy.get('.personal-info-content__title').invoke("text").then((afterText) => {
            const workerNamesAfter = afterText.trim();
            cy.log('After Search:', workerNamesAfter);
            expect(workerNamesAfter).to.eq(workerNamesBefore);
          });
        });
      });
})
  