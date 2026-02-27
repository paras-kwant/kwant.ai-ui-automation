/// <reference types="cypress" />
const path = require("path");
const fs = require("fs");
import companiesHelper from '../../support/helper/companiesHelper';
import { workforceSelector } from '../../support/workforceSelector';

describe("Companies Module - Search", () => {

  before(() => {
    cy.session('userSession', () => {
      cy.login();
      cy.get('.card-title')
        .contains(Cypress.env('PROJECT_NAME'))
        .click();
    });
    companiesHelper.visitCompaniesPage();
  });
  it("Validating the search functionality - run twice (using TaskTrade API)", () => {
    cy.intercept("GET", "**/api/projectTaskTradesForTracking*").as("taskTradeApi");
    cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
    
    cy.reload();
    cy.wait("@taskTradeApi").then((interception) => {
      const trades = interception?.response?.body?.content || 
                     interception?.response?.body?.data || 
                     interception?.response?.body || [];
      const names = trades.map((t) => t.name).filter(Boolean);
      expect(names.length, "Available trade names").to.be.greaterThan(0);
      
      const randomNames = Cypress._.sampleSize(names, 2);
      
      randomNames.forEach((name) => {
        cy.get(workforceSelector.searchInput).clear().type(name + " ");
        
        const escapedName = Cypress._.escapeRegExp(name);
        const regex = new RegExp(escapedName, 'i');
  
        cy.wait('@searchApi');
        
        cy.get(workforceSelector.tableRow).should(($rows) => {
          expect($rows.length).to.be.greaterThan(0);
          
          $rows.each((index, row) => {
            const text = Cypress.$(row).find('.personal-info-content__title').text();
            expect(text).to.match(regex);
          });
        });
      });
    });
  });


  it("Non existing company", () => {
        cy.get(workforceSelector.searchInput).clear().type('nonexistingcompany');
        cy.get('.empty-body').should("contain.text", "No Results FoundTry adjusting your search or filter to find what you are looking for.")
  });


  it("Searching with partial keywords", () => {
    cy.intercept("GET", "**/api/projectTaskTradesForTracking*").as("taskTradeApi");
    cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
  
    cy.reload();
  
    cy.wait("@taskTradeApi").then(({ response }) => {
      const names = (response?.body?.content ||
        response?.body?.data ||
        response?.body ||
        [])
        .map((t) => t.name)
        .filter((name) => name && name.length > 5);
  
      expect(names.length).to.be.greaterThan(0);
  
      const randomNames = Cypress._.sampleSize(names, 2);
  
      randomNames.forEach((name) => {
        const searchTerm = name.substring(0, 3);
        
        cy.log(`Searching with partial keyword: ${searchTerm}`);
  
        // ✅ Type search term
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(searchTerm);
  
        // ✅ Wait for search API instead of hard-coded delay
        cy.wait('@searchApi').its('response.statusCode').should('eq', 200);
  
  
        cy.get(workforceSelector.tableRow).should(($elements) => {
          expect($elements.length).to.be.greaterThan(0);
          
          // Check each row contains the search term
          $elements.each((index, element) => {
            const normalizedText = element.innerText
              .toLowerCase()
              .replace(/\s+/g, ' ')   // remove newlines & extra spaces
              .trim();
          
            expect(normalizedText)
              .to.include(searchTerm.toLowerCase());
          });
        });
      });
    });
  });
  it('search with the status Active or Inactive', () => {
    cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
    
    const statuses = ['Active', 'Inactive'];
    const randomStatus = Cypress._.sample(statuses);
    
    cy.log(`Searching for status: ${randomStatus}`);
    
    cy.get(workforceSelector.searchInput)
      .clear()
      .type(randomStatus);
    
    cy.wait('@searchApi').its('response.statusCode').should('eq', 200);
  
    cy.get('body').then(($body) => {
      if ($body.find(workforceSelector.tableRow).length > 0) {
        cy.get(workforceSelector.tableRow).should(($rows) => {
          expect($rows.length).to.be.greaterThan(0); // ✅ Added explicit count check
          
          $rows.each((index, row) => {
            const rowText = Cypress.$(row).find('.table_td').text();
            expect(rowText).to.include(randomStatus);
          });
        });
      } else {
        cy.get('.empty-body')
          .should('be.visible')
          .and('contain.text', 'No Results Found')
          .and('contain.text', 'Try adjusting your search or filter to find what you are looking for.');
      }
    });
  });

  it("Searching by safety manager name", () => {
    cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("filterApi");
    
    cy.reload();
  
    cy.wait("@filterApi").then(({ response }) => {
      const companies = response?.body?.data || [];
  
      const companiesWithSafetyManager = companies.filter(
        (company) => company.safetyManagerName?.trim()
      );
  
      if (companiesWithSafetyManager.length === 0) {
        cy.log("No companies with safety managers found - skipping test");
        return;
      }
  
      const randomCompany = Cypress._.sample(companiesWithSafetyManager);
      const safetyManagerName = randomCompany.safetyManagerName;
  
      cy.log(`Searching for safety manager: ${safetyManagerName}`);
  
      cy.get(workforceSelector.searchInput).clear().type(safetyManagerName);
  
      cy.wait('@filterApi').its('response.statusCode').should('eq', 200);
  
      cy.get('body').then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).should(($rows) => {
            expect($rows.length).to.be.greaterThan(0);
            
            $rows.each((index, row) => {
              const rowText = Cypress.$(row).find('.table_td').text();
              expect(rowText).to.include(safetyManagerName);
            });
          });
        } else {
          cy.log(`No results found for safety manager: ${safetyManagerName}`);
          cy.get('.empty-body')
            .should('be.visible')
            .and('contain.text', 'No Results Found')
            .and('contain.text', 'Try adjusting your search or filter to find what you are looking for.');
        }
      });
    });
  });
  it("Search Compatibility with Filter Feature (Apply Search after Filter)", ()=>{
   cy.reload()
    cy.intercept("GET", "**/api/projectTaskTrade*").as("taskTradeApi");
    cy.wait("@taskTradeApi").then((interception) => {
      const trades = interception?.response?.body?.content || 
                     interception?.response?.body?.data || 
                     interception?.response?.body || [];
      const names = trades.map((t) => t.name).filter(Boolean);
      expect(names.length, "Available trade names").to.be.greaterThan(0);
      const randomNames = Cypress._.sampleSize(names, 1);
      randomNames.forEach((name) => {
        cy.contains(workforceSelector.tableColumn, 'Status').find('.table-header-filter-btn').click();
        cy.get('body').should('be.visible')
        cy.get('.select_item_container label').contains('Inactive').click();
        cy.get('.label.default__label').contains('Status: 1').should('be.visible');
        cy.get(workforceSelector.searchInput).clear().type(name+" ",);
        const escapedName = Cypress._.escapeRegExp(name);
       const regex = new RegExp(escapedName, 'i');

       cy.wait(1500);

       cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row)
              .find(".table_td")
              .should("contain.text", "Inactive");

            // Search text check
            cy.wrap($row)
              .find(".personal-info-content__title")
              .invoke("text")
              .then((text) => {
                expect(text.trim().toLowerCase())
                .to.include(name.trim().toLowerCase());
              
              });
          });
        }else{
          cy.log(`No inactive companies found matching: ${name}`);

          cy.get(".empty-body")
            .should("be.visible")
            .and("contain.text", "No Results Found")
            .and(
              "contain.text",
              "Try adjusting your search or filter to find what you are looking for."
            );
        }

       })


     });
    });

  })
  it("Search Compatibility with Filter Feature (Apply Filter after Search)", () => {
    cy.intercept("GET", "**/api/projectTaskTradesForTracking*").as("taskTradeApi");
    cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("filterApi");
    
    cy.reload();
  
    cy.wait("@taskTradeApi").then((interception) => {
      const trades = interception?.response?.body?.content ||
                     interception?.response?.body?.data ||
                     interception?.response?.body || [];
  
      const names = trades.map(t => t.name).filter(Boolean);
      expect(names.length).to.be.greaterThan(0);
  
      const searchText = Cypress._.sample(names);
  
      cy.log(`Searching for: ${searchText}, then applying Inactive filter`);
  
      // ✅ SEARCH first
      cy.get(workforceSelector.searchInput)
        .clear()
        .type(`${searchText} `);
  
      cy.wait('@filterApi').its('response.statusCode').should('eq', 200);


      cy.contains(workforceSelector.tableColumn, 'Status')
        .find('.table-header-filter-btn')
        .click();
  
      cy.get('.select_item_container label')
        .contains('Inactive')
        .click();
  

      cy.wait('@filterApi').its('response.statusCode').should('eq', 200);
      cy.wait(1500);
    

      cy.get("body").then(($body) => {
        if ($body.find(workforceSelector.tableRow).length > 0) {
          cy.get(workforceSelector.tableRow).each(($row) => {
            cy.wrap($row)
              .find(".table_td")
              .should("contain.text", "Inactive");
  
            // Search text check
            cy.wrap($row)
              .find(".personal-info-content__title")
              .invoke("text")
              .then((text) => {
                expect(text.trim().toLowerCase())
  .to.include(name.trim().toLowerCase());

              });
          });
        } else {
          cy.log(`No inactive companies found matching: ${searchText}`);
  
          cy.get(".empty-body")
            .should("be.visible")
            .and("contain.text", "No Results Found")
            .and(
              "contain.text",
              "Try adjusting your search or filter to find what you are looking for."
            );
        }
      });
    });
  });
  

  it("Should search and prioritize Company name with 3 or more keywords", () => {
    cy.intercept("GET", "**/api/projectTaskTradesForTracking*").as("taskTradeApi");
  
    cy.reload();
  
    cy.wait("@taskTradeApi").then(({ response }) => {
      const companies = response?.body?.content || 
                       response?.body?.data || 
                       response?.body || [];
  
      const longNames = companies
        .map((c) => c.name?.trim())
  
      expect(longNames.length).to.be.greaterThan(0);
  
      const randomCompany = Cypress._.sample(longNames);
      
      cy.log(`Testing company: ${randomCompany}`);
  
      const searchTerms = [
        randomCompany.substring(0, 3),
        randomCompany.substring(0, 6)
      ];
  
      cy.wrap(searchTerms).each((searchTerm) => {
        cy.log(`Searching: ${searchTerm}`);
  
        cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
  
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(searchTerm);
  
        cy.wait("@searchApi").its('response.statusCode').should('eq', 200);
        cy.wait(500);

        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            cy.get('.personal-info-content__title').should(($elements) => {
              expect($elements.length).to.be.greaterThan(0);
              
              $elements.each((index, el) => {
                const text = Cypress.$(el).text().trim().toLowerCase();
                const searchLower = searchTerm.trim().toLowerCase();
                expect(text).to.include(searchLower);
              });
            });
          } else {
            cy.log(`No results found for: ${searchTerm}`);
            cy.get('.empty-body')
              .should('be.visible')
              .and('contain.text', 'No Results Found')
              .and('contain.text', 'Try adjusting your search or filter to find what you are looking for.');
          }
        });
      });
    });
  });

  it("Should perform case-insensitive search with all case variations", () => {
    cy.intercept("GET", "**/api/projectTaskTradesForTracking*").as("taskTradeApi");
    
    cy.reload();
  
    cy.wait("@taskTradeApi").then(({ response }) => {
      const companies = response?.body?.content || 
                       response?.body?.data || 
                       response?.body || [];
  
      const companyNames = companies
        .map((c) => c.name?.trim())
        .filter((name) => name && name.length > 5);
  
      expect(companyNames.length).to.be.greaterThan(0);
  
      const randomCompany = Cypress._.sample(companyNames);
      
      cy.log(`Testing company: ${randomCompany}`);
      
      const searchVariations = [
        { type: 'lowercase', value: randomCompany.toLowerCase() },
        { type: 'UPPERCASE', value: randomCompany.toUpperCase() },
        { type: 'MiXeD CaSe', value: randomCompany.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('') }
      ];
  
      cy.wrap(searchVariations).each(({ type, value }) => {
        cy.log(`Testing ${type}: "${value}"`);
  
        cy.intercept("POST", "**/api/projectTaskTrade/filter*").as("searchApi");
  
        cy.get(workforceSelector.searchInput)
          .clear()
          .type(value);
  
        cy.wait("@searchApi").its('response.statusCode').should('eq', 200);
  
        cy.get('body').should(($body) => {
          const hasRows = $body.find(workforceSelector.tableRow).length > 0;
          const hasEmpty = $body.find('.empty-body:visible').length > 0;
          expect(hasRows || hasEmpty).to.be.true;
        });
  
        cy.get('body').then(($body) => {
          if ($body.find(workforceSelector.tableRow).length > 0) {
            // ✅ PASS - Results found (expected behavior)
            cy.get('.personal-info-content__title').should(($elements) => {
              expect($elements.length).to.be.greaterThan(0);
              
              $elements.each((index, el) => {
                const text = Cypress.$(el).text().trim().toLowerCase();
                const searchLower = randomCompany.toLowerCase();
                expect(text).to.include(searchLower);
              });
            });
  
            cy.log(`✅ ${type} search works correctly`);
          } else {
            // ❌ FAIL - No results found (case-sensitive bug!)
            cy.get('.empty-body').should('be.visible');
            
            // This will FAIL the test
            throw new Error(
              `❌ Case-insensitive search FAILED for ${type} case! ` +
              `Searched for "${value}" but got no results. ` +
              `This indicates the search is case-sensitive (BUG).`
            );
          }
        });
      });
    });
  });
})