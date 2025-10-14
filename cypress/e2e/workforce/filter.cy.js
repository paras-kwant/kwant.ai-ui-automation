/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import { workforceSelector } from '../../support/workforceSelector';  
import '../../support/commands';
import { log } from 'console';



describe("Worker Module - filer", () => {
  beforeEach(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title').contains('Regression test').click();
    });
  });

  
  it('Verify Filter of the diffrent column for name', () => {
    cy.visit('/projects/94049707/workers');
    cy.intercept('POST', '/api/filterProjectWorker*').as('workersApi');
    cy.reload();
  
    cy.wait('@workersApi').then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map(worker => worker.firstName).filter(Boolean);
      cy.log(`First names: ${firstNames.join(', ')}`);
  
    const randomNames = Cypress._.sampleSize(firstNames, 2);
    cy.get('.table-header-filter-btn').eq(0).click();
    cy.get('input.sc-fHjqPf.fCepZC').type(randomNames[0]);
    cy.get('p').contains('Filters:').click()
    cy.wait(2000)
    cy.get('.sc-cRmqLi .personal-info-content__title').invoke('text').then((name) => {
      cy.log(name)
    })
    /
    cy.get('.sc-cRmqLi .personal-info-content__title').should('contain', randomNames[0])
    cy.get(workforceSelector.clearFilterButton).click()
})
  })

  it.only('Verify Filter of the different column for company', () => {
    cy.visit('/projects/94049707/workers');
    cy.log("Testing for company filter");
  
    cy.get('.table-header-filter-btn').eq(1).click();
  
    // Find all parent elements
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      // Pick one parent randomly
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
  
      const name = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      cy.log(`Randomly selected company name: ${name}`);
  
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });

      cy.get('p').contains('Filters:').click();
      cy.wait(3000)

      cy.verifyTableorEmptyState({
        tableRowSelector: workforceSelector.tableRow,  
        cellSelector: '.table_td:nth-child(6) .cell-content',
        expectedText: 'A&C Electrical Services, Inc.'  
      })
    })
  })
  it('Verify Filter of the different column for Job (Title)', () => {
  cy.visit('/projects/94049707/workers');
  cy.log("Testing for company filter");

  cy.get('.table-header-filter-btn').eq(2).click();

  cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
    const randomIndex = Cypress._.random(0, $parents.length - 1);
    const $randomParent = $parents.eq(randomIndex);
    const name = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
    cy.log(`Randomly selected company name: ${name}`);

    cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });

    cy.get('p').contains('Filters:').click();
    cy.wait(3000)

    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get('.table_td:nth-child(7) .cell-content')
          .contains(name)
          .should('be.visible');
      } else {
          cy.get('.empty-body').should(
              'have.text',
              'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
            );
      }
    });
  })
  })


  it('Verify Filter of the different column for site status', () => {
    cy.visit('/projects/94049707/workers');
    cy.log("Testing for site status filter");
  
    cy.get('.table-header-filter-btn').eq(3).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
  
      const name = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      cy.log(`Randomly selected status: ${name}`);
  
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
  
      cy.get('p').contains('Filters:').click();
      cy.wait(3000);
  
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          if (name.toLowerCase() === 'flagged') {
           cy.log("Handling 'Flagged' status with special case");
          } else {
            cy.get('.dot-container__status-label')
              .contains(name)
              .should('be.visible');
          }
        } else {
          cy.get('.empty-body').should(
            'have.text',
            'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
          );
        }
      });
    });
  });

  it('Verify combined filters (Name + Company + Job Title + Site Status)', () => {
    cy.visit('/projects/94049707/workers');
    cy.log("Testing combined filters");
  
    let selectedName, selectedCompany, selectedJobTitle, selectedStatus;
  
    cy.intercept('POST', '/api/filterProjectWorker*').as('workersApi');
    cy.reload();
  
    cy.wait('@workersApi').then((interception) => {
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map(worker => worker.firstName).filter(Boolean);
      const randomName = Cypress._.sample(firstNames);
      selectedName = randomName;
  
      cy.log(`Selected Name: ${randomName}`);
      cy.get('.table-header-filter-btn').eq(0).click();
      cy.get('input.sc-fHjqPf.fCepZC').type(randomName);
      cy.get('p').contains('Filters:').click();
      cy.wait(1000); 
    });
  
    cy.get('.table-header-filter-btn').eq(1).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const companyName = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedCompany = companyName;
  
      cy.log(`Selected Company: ${companyName}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(1000);
    });
  
    cy.get('.table-header-filter-btn').eq(2).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const jobTitle = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedJobTitle = jobTitle;
  
      cy.log(`Selected Job Title: ${jobTitle}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(1000);
    });
  
    cy.get('.table-header-filter-btn').eq(3).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const statusName = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedStatus = statusName;
  
      cy.log(`Selected Site Status: ${statusName}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(3000); 
    });
  
    cy.then(() => {
      cy.log(`Validating combined filters:`);
      cy.log(`Name: ${selectedName}`);
      cy.log(`Company: ${selectedCompany}`);
      cy.log(`Job Title: ${selectedJobTitle}`);
      cy.log(`Status: ${selectedStatus}`);
  
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.log("Validating filtered results contain all selected criteria");
          
          cy.get('.sc-cRmqLi .personal-info-content__title')
            .contains(selectedName)
            .should('be.visible');
            
          cy.get('.table_td:nth-child(6) .cell-content')
            .contains(selectedCompany)
            .should('be.visible');
            
          cy.get('.table_td:nth-child(7) .cell-content')
            .contains(selectedJobTitle)
            .should('be.visible');
            
          if (selectedStatus.toLowerCase() === 'flagged') {
            cy.get('.dot-container__status-label')
              .should('contain.text', 'Red')
              .and('be.visible');
          } else {
            cy.get('.dot-container__status-label')
              .contains(selectedStatus)
              .should('be.visible');
          }
          
          cy.log("✅ All combined filters validated successfully");
          
        } else {
          cy.get('.empty-body').should(
            'have.text',
            'No Results FoundTry adjusting your search or filter to find what you are looking for. Reset Filters '
          );
          cy.log("⚠️ No results found matching all combined filter criteria");
        }
      });
    });
  });


  it('Verify Clear filter functionality', () => {
    cy.visit('/projects/94049707/workers');
    
    let workerNamesBefore, selectedName, selectedCompany, selectedJobTitle, selectedStatus;
  
    cy.intercept('POST', '/api/filterProjectWorker*').as('workersApi');
    cy.reload();
  
    cy.wait('@workersApi').then((interception) => {
      
      cy.get('.personal-info-content__title').then(($elements) => {
        workerNamesBefore = $elements.map((index, element) => Cypress.$(element).text().trim()).get().join('');
        cy.log('Before Search:', workerNamesBefore);
      });
  
      const workers = interception.response.body.projectWorkerDTOS;
      const firstNames = workers.map(worker => worker.firstName).filter(Boolean);
      const randomName = Cypress._.sample(firstNames);
      selectedName = randomName;
  
      cy.log(`Selected Name: ${randomName}`);
      cy.get('.table-header-filter-btn').eq(0).click();
      cy.get('input.sc-fHjqPf.fCepZC').type(randomName);
      cy.get('p').contains('Filters:').click();
      cy.wait(1000);
    });
  
    // Apply Company filter
    cy.get('.table-header-filter-btn').eq(1).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const companyName = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedCompany = companyName;
  
      cy.log(`Selected Company: ${companyName}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(1000);
    });
  
    // Apply Job Title filter
    cy.get('.table-header-filter-btn').eq(2).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const jobTitle = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedJobTitle = jobTitle;
  
      cy.log(`Selected Job Title: ${jobTitle}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(1000);
    });
  
    // Apply Site Status filter
    cy.get('.table-header-filter-btn').eq(3).click();
  
    cy.get('.sc-fzQBhs.fyTPqL').then(($parents) => {
      const randomIndex = Cypress._.random(0, $parents.length - 1);
      const $randomParent = $parents.eq(randomIndex);
      const statusName = $randomParent.find('.sc-eldPxv.bVwlNE').text().trim();
      selectedStatus = statusName;
  
      cy.log(`Selected Site Status: ${statusName}`);
      cy.wrap($randomParent).find('input[type="checkbox"]').check({ force: true });
      cy.get('p').contains('Filters:').click();
      cy.wait(3000);
    });
  
    // Clear all filters
    cy.get(workforceSelector.clearFilterButton).click();
    cy.wait(5000);
    cy.get('.personal-info-content__title').should('have.length.greaterThan', 0);
  
    cy.get('.personal-info-content__title').then(($elements) => {
      const workerNamesAfter = $elements.map((index, element) => Cypress.$(element).text().trim()).get().join('');
      cy.log('After Clear:', workerNamesAfter);
      // expect(workerNamesAfter).to.eq(workerNamesBefore);
    });
  });


  it('Validate worker added date range filter works correctly', () => {
    const startDate = '01/01/2025';
    
    cy.visit('/projects/94049707/workers');
    
    cy.get('[label="Filters"] button').click();
    
    cy.get('[placeholder="MM/DD/YYYY - MM/DD/YYYY"]').eq(2).type(startDate);
    cy.get('.rmdp-day.rmdp-today .sd').click();
    
    cy.get('.sc-aXZVg.hdcwLk button').click();
    cy.get('.jHNNhu').click();
    
    cy.get(workforceSelector.tableRow)
      .should('have.length.greaterThan', 0)
      .then(($rows) => {
        const randomIndex = Cypress._.random(0, $rows.length - 1);
        cy.wrap($rows[randomIndex]).click({ force: true });
      });
    
    cy.get('.sc-jXbUNg>.jmJtNV').eq(1).click();
    
    cy.wait(2000)
    cy.get('.hover-hoc-container__input__display-value').eq(6).invoke('text').then((dateText) => {
      const cleanDate = dateText.trim();
      cy.log('Date from UI:', cleanDate);

      
      const uiDate = new Date(cleanDate);
      const startDateObj = new Date(startDate);
      const currentDate = new Date();

      expect(uiDate.getTime()).to.be.at.least(startDateObj.getTime());
      expect(uiDate.getTime()).to.be.at.most(currentDate.getTime());
      
  
    });
  });

  it('Validate remobving filter one after another', ()=>{
    cy.visit('/projects/94049707/workers');
    cy.get('[label="Filters"] button').click();
    cy.get('[name="name"]').type('test')
    cy.get('[name="phone"]').type('98789765654')
    cy.get('[name="email"]').type('demo@gmail.com')
    cy.get('.sc-aXZVg.hdcwLk button').click();
    cy.get('.jHNNhu').click();
    cy.get('.filter-tag').should('have.length', 3);
    cy.get('.filter-tag').eq(0).should('contain.text', 'Name: test')
    cy.get('.filter-tag').eq(1).should('contain.text', 'Phone: 98789765654')
    cy.get('.filter-tag').eq(2).should('contain.text', 'Email: demo@gmail.com')
    cy.get('.sc-ecPEgm.kVJnXL >>.action-container').eq(0).click()
    cy.get('.filter-tag').eq(0).should('not.contain.text', 'Name: test');
    cy.get('.filter-tag').should('have.length', 2);

    cy.get('.sc-ecPEgm.kVJnXL >>.action-container').eq(0).click()
    cy.get('.filter-tag').eq(0).should('not.contain.text', 'Phone: 98789765654');
    cy.get('.filter-tag').should('have.length', 1);
  })
  
})
